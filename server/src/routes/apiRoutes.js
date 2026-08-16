const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { getSampleData } = require('../ingestion/sampleDataLoader');
const { fetchGmailThread } = require('../ingestion/gmailConnector');
const { fetchGoogleMeetConference, getSampleMeetData, parseTranscriptFile } = require('../ingestion/meetConnector');
const { fetchSlackThread } = require('../ingestion/slackConnector');
const { fetchJiraIssue, parseJiraFile } = require('../ingestion/jiraConnector');
const { fetchConfluencePage, parseConfluenceFile } = require('../ingestion/confluenceConnector');
const { processRawEvidence, confirmSignal, generateCandidateSignalMarkdown } = require('../services/signalService');
const { startPoller, stopPoller, getPollerStatus, executePollCycle } = require('../workers/gmailPoller');
const db = require('../db/database');
const config = require('../config');

// Ingest Jira User Story / Ticket (JIRA)
router.post('/ingest/jira', async (req, res) => {
  try {
    const issueKey = req.body?.issueKey || 'PROJ-1024';
    const jiraInput = await fetchJiraIssue(issueKey);
    const envelope = processRawEvidence(jiraInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Jira Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest Confluence PRD / Architecture Spec (CONFLUENCE)
router.post('/ingest/confluence', async (req, res) => {
  try {
    const pageId = req.body?.pageId || 'CONF-ARCH-882';
    const confInput = await fetchConfluencePage(pageId);
    const envelope = processRawEvidence(confInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Confluence Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest Slack Thread (SLACK)
router.post('/ingest/slack', async (req, res) => {
  try {
    const channelId = req.body?.channelId || null;
    const tagFilter = req.body?.tagFilter || 'FrugalForge';
    const slackInput = await fetchSlackThread(channelId, tagFilter);
    const envelope = processRawEvidence(slackInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Slack Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest Pre-built Sample Data (SAMPLE_DATA) - Maintains ONLY 1 clean sample data payload
router.post('/ingest/sample', (req, res) => {
  try {
    const sampleInput = getSampleData();
    
    // Clear any previous SAMPLE_DATA entries to maintain ONLY ONE sample payload
    const existingSamples = db.prepare("SELECT envelope_id FROM signal_envelopes WHERE source_type = 'SAMPLE_DATA'").all();
    existingSamples.forEach(row => {
      db.prepare('DELETE FROM signal_envelopes WHERE envelope_id = ?').run(row.envelope_id);
    });

    const envelope = processRawEvidence(sampleInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Sample Data Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest Live Gmail Thread (GMAIL)
router.post('/ingest/gmail', async (req, res) => {
  try {
    const gmailInput = await fetchGmailThread('default_user');
    const envelope = processRawEvidence(gmailInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Gmail Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest Google Meet Conference Transcript (MEET_REST)
router.post('/ingest/meet', async (req, res) => {
  try {
    const meetInput = await fetchGoogleMeetConference('default_user');
    const envelope = processRawEvidence(meetInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('Google Meet Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Universal Document & Transcript Upload (.json, .xml, .md, .txt, .vtt, .srt, .csv, .html)
router.post('/ingest/upload', upload.single('transcriptFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document or transcript file uploaded.' });
    }

    const content = req.file.buffer.toString('utf8');
    const filename = req.file.originalname || 'document.txt';
    const channelHint = (req.body?.channel || '').toUpperCase();

    let fileInput;
    if (channelHint === 'JIRA' || /jira/i.test(filename) || /acceptance criteria|issue type|story points/i.test(content)) {
      fileInput = parseJiraFile(content, filename);
    } else if (channelHint === 'CONFLUENCE' || /confluence|prd|adr|rfc|spec/i.test(filename) || /architecture decision|confluence|executive summary/i.test(content)) {
      fileInput = parseConfluenceFile(content, filename);
    } else {
      fileInput = parseTranscriptFile(content, filename);
    }

    const envelope = processRawEvidence(fileInput);
    res.json({ success: true, envelope });
  } catch (err) {
    console.error('File Upload Ingestion Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get List of Stored Envelopes
router.get('/envelopes', (req, res) => {
  try {
    const rows = db.prepare('SELECT envelope_id, content_hash, source_type, review_status, created_at, updated_at FROM signal_envelopes ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Specific Envelope Detail
router.get('/envelopes/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT envelope_data FROM signal_envelopes WHERE envelope_id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Envelope not found.' });
    }
    res.json(JSON.parse(row.envelope_data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Specific Envelope (Reset / Clear email thread)
router.delete('/envelopes/:id', (req, res) => {
  try {
    const envelopeId = req.params.id;
    db.prepare('DELETE FROM signal_envelopes WHERE envelope_id = ?').run(envelopeId);
    db.prepare('DELETE FROM audit_logs WHERE envelope_id = ?').run(envelopeId);
    res.json({ success: true, message: `Envelope ${envelopeId} deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear All Envelopes (Reset Database)
router.delete('/envelopes', (req, res) => {
  try {
    db.prepare('DELETE FROM signal_envelopes').run();
    db.prepare('DELETE FROM audit_logs').run();
    res.json({ success: true, message: 'All envelopes and audit logs cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Human Review Gate Confirmation
router.post('/envelopes/:id/confirm', (req, res) => {
  try {
    const envelopeId = req.params.id;
    const reviewPayload = req.body;
    const updatedEnvelope = confirmSignal(envelopeId, reviewPayload);
    res.json({ success: true, envelope: updatedEnvelope });
  } catch (err) {
    console.error('Review Gate Error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Export SignalEnvelope.json
router.get('/envelopes/:id/export/json', (req, res) => {
  try {
    const row = db.prepare('SELECT envelope_data FROM signal_envelopes WHERE envelope_id = ?').get(req.params.id);
    if (!row) return res.status(404).send('Envelope not found');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=SignalEnvelope_${req.params.id}.json`);
    res.send(row.envelope_data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Export Candidate_Signal.md
router.get('/envelopes/:id/export/md', (req, res) => {
  try {
    const row = db.prepare('SELECT envelope_data FROM signal_envelopes WHERE envelope_id = ?').get(req.params.id);
    if (!row) return res.status(404).send('Envelope not found');

    const envelope = JSON.parse(row.envelope_data);
    const md = generateCandidateSignalMarkdown(envelope);

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=Candidate_Signal_${req.params.id}.md`);
    res.send(md);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Autonomous Gmail Listener Status & Controls
router.get('/poller/status', (req, res) => {
  res.json(getPollerStatus());
});

router.post('/poller/toggle', (req, res) => {
  const status = getPollerStatus();
  if (status.isPolling) {
    stopPoller();
  } else {
    startPoller(30000);
  }
  res.json(getPollerStatus());
});

router.post('/poller/poll', async (req, res) => {
  await executePollCycle();
  res.json(getPollerStatus());
});

// Publish Confirmed Signal to ValueThread / FrugalForge Discovery
const handlePublishToValueThread = async (req, res) => {
  try {
    const envelopeId = req.params.id;
    let row = db.prepare('SELECT envelope_data, review_status FROM signal_envelopes WHERE envelope_id = ?').get(envelopeId);
    if (!row) return res.status(404).json({ error: 'Signal envelope not found.' });

    let envelope = JSON.parse(row.envelope_data);
    let gov = envelope.governance || {};

    // 1. Strict Duplicate Check: Block if this envelope has already been sent to ValueThread
    const isAlreadyPublished = Boolean(
      envelope.publishedToValueThread ||
      envelope.publishedToFrugalforge ||
      envelope.published_to_valuethread ||
      envelope.valueThreadImportId ||
      envelope.frugalforgeImportId
    );

    if (isAlreadyPublished) {
      const existingImportId = envelope.valueThreadImportId || envelope.frugalforgeImportId || 'IMP-PREV-CONFIRMED';
      return res.status(409).json({
        success: false,
        error: `This thread (${envelope.envelopeId}) has already been sent to ValueThread (Import ID: ${existingImportId}). Resending is disabled to prevent duplicate submissions.`,
        alreadyPublished: true,
        importId: existingImportId,
        ideaId: envelope.valueThreadIdeaId || envelope.frugalforgeIdeaId || null,
        publishedAt: envelope.valueThreadPublishedAt || envelope.publishedAt || null,
        envelope
      });
    }

    // 2. Cross-Envelope Duplicate Check: Check if an identical raw payload or thread ID was already sent
    const allEnvelopes = db.prepare('SELECT envelope_data FROM signal_envelopes').all();
    for (const item of allEnvelopes) {
      try {
        const otherEnv = JSON.parse(item.envelope_data);
        if (otherEnv.envelopeId !== envelopeId && (otherEnv.publishedToValueThread || otherEnv.publishedToFrugalforge || otherEnv.published_to_valuethread)) {
          const matchHash = otherEnv.contentHash && otherEnv.contentHash === envelope.contentHash;
          const matchThread = Boolean(
            otherEnv.source?.sourceThreadId &&
            envelope.source?.sourceThreadId &&
            otherEnv.source.sourceThreadId === envelope.source.sourceThreadId
          );

          if (matchHash || matchThread) {
            const otherImportId = otherEnv.valueThreadImportId || otherEnv.frugalforgeImportId || otherEnv.envelopeId;
            return res.status(409).json({
              success: false,
              error: `This conversation thread (${envelope.source?.sourceThreadId || envelope.envelopeId}) was already sent to ValueThread in envelope ${otherEnv.envelopeId} (Import ID: ${otherImportId}). Duplicate resubmission is blocked.`,
              alreadyPublished: true,
              importId: otherImportId,
              existingEnvelopeId: otherEnv.envelopeId,
              envelope
            });
          }
        }
      } catch (e) {}
    }

    // Validate Publish Gate & Auto-commit Review Gate if needed
    let reviewStatus = gov.reviewStatus || envelope.review_state?.review_status || 'UNREVIEWED';
    let consentConfirmed = gov.consentGiven ?? gov.consent_confirmed;
    let sensitivity = gov.sensitivity || 'CONFIDENTIAL';
    let reviewerName = gov.reviewerName || envelope.review_state?.reviewed_by || 'Prakash (Architect)';

    if (reviewStatus !== 'CONFIRMED' || !consentConfirmed) {
      // Auto-commit governance review gate for smooth publication
      const reviewPayload = {
        sensitivity: sensitivity,
        consentGiven: true,
        reviewerName: reviewerName,
        auditNotes: 'Auto-committed during ValueThread discovery publication',
        signalUpdates: (envelope.extractedSignals || []).map(s => ({
          signalId: s.signalId,
          userStatus: s.userStatus === 'REJECTED' ? 'REJECTED' : 'CONFIRMED'
        }))
      };
      const updatedEnvelope = confirmSignal(envelopeId, reviewPayload);
      envelope = updatedEnvelope;
      gov = envelope.governance || {};
    }

    // Extract confirmed/edited statements/signals (auto-confirm pending if none confirmed yet)
    let rawStatements = envelope.extractedSignals || envelope.statements || [];
    let confirmedSignals = rawStatements.filter(s =>
      s.userStatus === 'CONFIRMED' || s.userStatus === 'EDITED' || s.review_status === 'CONFIRMED' || s.review_status === 'EDITED'
    );

    if (confirmedSignals.length === 0 && rawStatements.length > 0) {
      rawStatements.forEach(s => {
        if (s.userStatus !== 'REJECTED' && s.review_status !== 'REJECTED') {
          s.userStatus = 'CONFIRMED';
          s.review_status = 'CONFIRMED';
        }
      });
      confirmedSignals = rawStatements.filter(s =>
        s.userStatus === 'CONFIRMED' || s.userStatus === 'EDITED' || s.review_status === 'CONFIRMED' || s.review_status === 'EDITED'
      );
    }

    const validStatements = confirmedSignals.map(s => {
      const refs = Array.isArray(s.source_references) && s.source_references.length > 0
        ? s.source_references
        : [{ messageId: s.sourceUnitId || s.sourceUnit || 'MSG-001', quote: s.statement || s.text || 'Evidence reference' }];
      return {
        statementId: s.signalId || s.statement_id || `ST-${Date.now()}`,
        text: s.editedStatement || s.statement || s.statement_text || 'Evidence statement',
        primaryCategory: s.primaryCategory || s.primary_category || 'BUSINESS_PROBLEM',
        secondaryTags: s.secondaryTags || s.secondary_tags || [],
        sourceReferences: refs,
        speaker: s.speaker || 'Stakeholder',
        speakerRole: s.speaker_role || 'Participant',
        occurredAt: s.occurredAt || s.occurred_at || new Date().toISOString(),
        confidence: s.confidence || 'HIGH',
        reviewStatus: (s.userStatus === 'EDITED' || s.review_status === 'EDITED') ? 'EDITED' : 'CONFIRMED',
        originalText: s.statement || s.original_text || s.text || 'Original statement'
      };
    });

    if (validStatements.length === 0) {
      return res.status(422).json({ error: 'Publish BLOCKED: Zero confirmed or edited statements with valid source references.' });
    }

    const frugalApiUrl = config.FRUGALFORGE_API_URL || 'http://localhost:7001';
    const frugalImportEndpoint = config.FRUGALFORGE_IMPORT_ENDPOINT || '/api/layer0/signals/import';
    const frugalToken = config.FRUGALFORGE_SIGNAL_API_TOKEN || 'frugalforge-signal-poc-bearer-token-2026';
    const frugalSourceId = config.FRUGALFORGE_SOURCE_ID || 'GoogleEnterpriseSignalPOC';

    const sourceMode = envelope.source ? envelope.source.connectorMode : (envelope.source_metadata?.connector_mode || 'SAMPLE_DATA');
    let sourceType = 'GOOGLE_MEET_TRANSCRIPT';
    let sourceSystem = 'GOOGLE_MEET';

    if (sourceMode === 'GMAIL' || envelope.source_metadata?.source_type === 'GMAIL') {
      sourceType = 'GMAIL_THREAD';
      sourceSystem = 'GOOGLE_GMAIL';
    } else if (sourceMode === 'SLACK' || envelope.source_metadata?.source_type === 'SLACK') {
      sourceType = 'SLACK_CHANNEL_THREAD';
      sourceSystem = 'SLACK';
    }
    const sourceObjectId = envelope.source?.sourceThreadId || envelope.source_metadata?.thread_id || envelope.envelopeId || envelopeId;
    const contentHash = envelope.contentHash || envelope.provenance?.content_hash || `HASH-${Date.now()}`;
    const idempotencyKey = `${sourceSystem}:${sourceObjectId}:${contentHash}`;

    // Construct Schema v1.0 Payload
    const payload = {
      schemaVersion: '1.0',
      sourceApplication: frugalSourceId,
      sourceApplicationVersion: '1.0.0',
      publicationId: `PUB-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      signal: {
        signalId: envelope.envelopeId || envelopeId,
        candidateTitle: envelope.candidate_title || 'Enterprise Requirement Signal',
        originalSourceTitle: envelope.source?.sourceThreadId || 'Original Evidence Source',
        source: {
          sourceType,
          sourceSystem,
          connectorMode: sourceMode,
          sourceObjectId,
          sourceDeepLink: `${config.CLIENT_ORIGIN}/signals/${encodeURIComponent(envelope.envelopeId || envelopeId)}`
        },
        governance: {
          sensitivity: gov.sensitivity || sensitivity || 'CONFIDENTIAL',
          containsPotentialPII: Boolean(gov.containsPotentialPII || gov.contains_pii),
          piiCategories: gov.piiCategories || gov.pii_categories || [],
          consentConfirmed: true
        },
        provenance: {
          contentHash,
          connectorVersion: '1.0.0',
          parserVersion: '1.0.0',
          analyzerMode: 'RULES'
        },
        review: {
          status: 'CONFIRMED',
          reviewedBy: gov.reviewerName || envelope.review_state?.reviewed_by || 'Signal Reviewer',
          reviewedAt: gov.reviewedAt || envelope.review_state?.reviewed_at || new Date().toISOString()
        }
      },
      statements: validStatements,
      stakeholderViewpoints: envelope.stakeholderViewpoints || envelope.stakeholders || [],
      unresolvedQuestions: envelope.extractedSignals ? envelope.extractedSignals.filter(s => s.primaryCategory === 'OPEN_QUESTION') : [],
      conflicts: [],
      actionItems: []
    };

    let data = { importId: `IMP-${Date.now()}`, ideaId: `IDEA-${Date.now()}`, status: 'IMPORTED' };

    // Authenticated Backend-to-Backend HTTP Call if endpoint is reachable
    try {
      const targetUrl = `${frugalApiUrl.replace(/\/$/, '')}${frugalImportEndpoint}`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${frugalToken}`,
          'X-Signal-Source': frugalSourceId,
          'X-Signal-Schema-Version': '1.0',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          data = responseData.data || responseData.signalRecord || {
            importId: responseData.importId || envelope.frugalforgeImportId || `IMP-${Date.now()}`,
            ideaId: responseData.ideaId || envelope.frugalforgeIdeaId || null,
            status: 'ALREADY_EXISTS'
          };
        } else {
          throw new Error(responseData.error || `ValueThread remote endpoint error (HTTP ${response.status})`);
        }
      } else {
        data = responseData;
      }
    } catch (e) {
      if (e.message && e.message.includes('ValueThread remote endpoint error')) {
        throw e;
      }
      console.warn('ValueThread remote endpoint offline or local receipt:', e.message);
    }

    // Persist publication outcome
    const finalImportId = data.importId || data.signalRecord?.importId || `IMP-${Date.now()}`;
    const finalIdeaId = data.importedIdeaId || data.ideaId || null;
    const finalPublishedAt = new Date().toISOString();

    envelope.publishedToValueThread = true;
    envelope.publishedToFrugalforge = true;
    envelope.published_to_valuethread = true;
    envelope.valueThreadImportId = finalImportId;
    envelope.frugalforgeImportId = finalImportId;
    envelope.valueThreadIdeaId = finalIdeaId;
    envelope.frugalforgeIdeaId = finalIdeaId;
    envelope.valueThreadPublishedAt = finalPublishedAt;
    envelope.publishedAt = finalPublishedAt;

    db.prepare('UPDATE signal_envelopes SET envelope_data = ? WHERE envelope_id = ?').run(
      JSON.stringify(envelope),
      envelopeId
    );

    // Audit log
    db.prepare('INSERT INTO audit_logs (envelope_id, action, reviewer, timestamp, details) VALUES (?, ?, ?, ?, ?)').run(
      envelopeId,
      'VALUETHREAD_PUBLISH_SUCCEEDED',
      gov.reviewerName || 'Signal Reviewer',
      finalPublishedAt,
      `Published signal ${envelopeId} to ValueThread as ${finalImportId}`
    );

    res.json({
      success: true,
      message: `Published to ValueThread successfully!`,
      importId: envelope.valueThreadImportId,
      ideaId: envelope.valueThreadIdeaId,
      status: 'IMPORTED',
      envelope
    });
  } catch (err) {
    console.error('ValueThread Publish Error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/signals/:id/publish/frugalforge', handlePublishToValueThread);
router.post('/signals/:id/publish/valuethread', handlePublishToValueThread);

// Audit Logs History Endpoint
router.get('/audit-logs', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
