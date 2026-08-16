/**
 * Core Signal Ingestion & Review Gate Service
 * Orchestrates parsing, classification, temporal resolution, Zod validation,
 * database persistence, human review gate enforcement, and exports.
 */

const { parseLogicalBlocks } = require('../parser/logicalBlockParser');
const { segmentAtomicUnits } = require('../parser/atomicSegmenter');
const { classifyStatement } = require('../classifier/rulesEngine');
const { resolveTemporalRelationships, extractStakeholderViewpoints } = require('../classifier/temporalResolver');
const { SignalEnvelopeSchema } = require('../schemas/signalEnvelopeSchema');
const { sha256Hash } = require('../crypto/encryption');
const db = require('../db/database');

/**
 * Generate human-readable incremental envelope IDs:
 * - ENV-MAIL-001, ENV-MAIL-002 (Emails / Gmail)
 * - ENV-MEET-001, ENV-MEET-002 (Google Meet)
 * - ENV-SLACK-001, ENV-SLACK-002 (Slack)
 * - ENV-TRANS-001, ENV-TRANS-002 (Transcripts / Uploads)
 */
function generateIncrementalEnvelopeId(connectorMode) {
  let prefix = 'ENV-MAIL';
  const mode = (connectorMode || '').toUpperCase();
  if (mode.includes('JIRA')) {
    prefix = 'ENV-JIRA';
  } else if (mode.includes('CONF')) {
    prefix = 'ENV-CONF';
  } else if (mode.includes('MEET')) {
    prefix = 'ENV-MEET';
  } else if (mode.includes('SLACK')) {
    prefix = 'ENV-SLACK';
  } else if (mode.includes('FILE') || mode.includes('TRANS') || mode.includes('UPLOAD')) {
    prefix = 'ENV-TRANS';
  } else {
    prefix = 'ENV-MAIL';
  }

  try {
    const list = db.prepare("SELECT envelope_id FROM signal_envelopes").all();
    let maxNum = 0;
    list.forEach(row => {
      const id = row.envelope_id || '';
      if (id.startsWith(prefix + '-')) {
        const numPart = id.substring(prefix.length + 1);
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  } catch (e) {
    return `${prefix}-001`;
  }
}

/**
 * Process raw text into a canonical SignalEnvelope
 */
function processRawEvidence(rawInput) {
  const { connectorMode, sourceThreadId, realMessageId, rawText } = rawInput;

  // 1. Calculate SHA-256 Hash of raw evidence
  const contentHash = sha256Hash(rawText);

  // Deduplication: If this exact evidence payload is already ingested, return existing envelope
  try {
    const existing = db.prepare('SELECT envelope_id, envelope_data FROM signal_envelopes WHERE content_hash = ?').get(contentHash);
    if (existing && existing.envelope_data) {
      return JSON.parse(existing.envelope_data);
    }
  } catch (e) {
    // Proceed with ingestion if DB query fails or not found
  }

  // 2. Parse Physical vs Logical conversation blocks
  const parseResult = parseLogicalBlocks(rawText, sourceThreadId, realMessageId || '1904a1f87b2e9c10');

  // 3. Segment into line/sentence-level AtomicSourceUnits with noise stripping
  const atomicUnits = segmentAtomicUnits(parseResult.logicalBlocks, realMessageId || '1904a1f87b2e9c10');

  // 4. Classify eligible statements into 22 Enterprise Categories with sequential IDs
  const rawSignals = [];
  let signalCounter = 1;
  atomicUnits.forEach(unit => {
    const block = parseResult.logicalBlocks.find(b => b.blockId === unit.logicalBlockId);
    const signal = classifyStatement(unit, block);
    if (signal) {
      signal.signalId = `SIG-${String(signalCounter).padStart(3, '0')}`;
      signalCounter++;
      rawSignals.push(signal);
    }
  });

  // 5. Apply Temporal Resolution & Question Supersession logic
  const resolvedSignals = resolveTemporalRelationships(rawSignals, parseResult.logicalBlocks);

  // 6. Extract Stakeholder Viewpoints
  const stakeholderViewpoints = extractStakeholderViewpoints(parseResult.logicalBlocks, resolvedSignals);

  // 7. Assemble Canonical SignalEnvelope object with human-readable incremental ID
  const envelopeId = generateIncrementalEnvelopeId(connectorMode);
  const now = new Date().toISOString();

  const envelope = {
    envelopeId: envelopeId,
    contentHash: contentHash,
    createdAt: now,
    updatedAt: now,
    source: {
      connectorMode: connectorMode || 'SAMPLE_DATA',
      sourceThreadId: sourceThreadId || 'THREAD-001',
      physicalMessageCount: parseResult.physicalMessageCount,
      logicalEmailCount: parseResult.logicalEmailCount,
      summarySectionCount: parseResult.summarySectionCount,
      conversationStructure: parseResult.conversationStructure,
      rawText: rawText
    },
    logicalBlocks: parseResult.logicalBlocks,
    atomicUnits: atomicUnits,
    extractedSignals: resolvedSignals,
    stakeholderViewpoints: stakeholderViewpoints,
    governance: {
      reviewStatus: 'UNREVIEWED',
      consentGiven: false
    }
  };

  // 8. Validate against Zod schema
  const validatedEnvelope = SignalEnvelopeSchema.parse(envelope);

  // 9. Save to SQLite database
  const stmt = db.prepare(`
    INSERT INTO signal_envelopes (envelope_id, content_hash, source_type, envelope_data, review_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    validatedEnvelope.envelopeId,
    validatedEnvelope.contentHash,
    validatedEnvelope.source.connectorMode,
    JSON.stringify(validatedEnvelope),
    validatedEnvelope.governance.reviewStatus,
    validatedEnvelope.createdAt,
    validatedEnvelope.updatedAt
  );

  return validatedEnvelope;
}

/**
 * Statement-Level Human Review Gate enforcement
 */
function confirmSignal(envelopeId, reviewPayload) {
  const row = db.prepare('SELECT * FROM signal_envelopes WHERE envelope_id = ?').get(envelopeId);
  if (!row) {
    throw new Error(`Envelope with ID ${envelopeId} not found.`);
  }

  const envelope = JSON.parse(row.envelope_data);
  const { sensitivity, consentGiven, reviewerName, auditNotes, signalUpdates } = reviewPayload;

  // Review Gate Check 1: Sensitivity classification
  if (!sensitivity || !['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].includes(sensitivity)) {
    throw new Error('Review Gate Failed: Sensitivity classification (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED) must be selected.');
  }

  // Review Gate Check 2: Consent checkbox
  if (consentGiven !== true) {
    throw new Error('Review Gate Failed: Data governance consent must be explicitly checked.');
  }

  // Review Gate Check 3: Reviewer name
  if (!reviewerName || typeof reviewerName !== 'string' || reviewerName.trim().length === 0) {
    throw new Error('Review Gate Failed: Reviewer name must be provided.');
  }

  // Apply signal user updates (CONFIRMED, REJECTED, EDITED)
  if (Array.isArray(signalUpdates)) {
    signalUpdates.forEach(update => {
      const target = envelope.extractedSignals.find(s => s.signalId === update.signalId);
      if (target) {
        if (update.userStatus) target.userStatus = update.userStatus;
        if (update.editedStatement) target.editedStatement = update.editedStatement;
        if (update.primaryCategory) target.primaryCategory = update.primaryCategory;
      }
    });
  }

  // Review Gate Check 4: At least 1 statement explicitly marked CONFIRMED or EDITED
  const confirmedCount = envelope.extractedSignals.filter(s => s.userStatus === 'CONFIRMED' || s.userStatus === 'EDITED').length;
  if (confirmedCount === 0) {
    throw new Error('Review Gate Failed: At least 1 statement must be explicitly marked CONFIRMED or EDITED before committing signal.');
  }

  // Update Governance metadata
  envelope.governance.reviewStatus = 'CONFIRMED';
  envelope.governance.sensitivity = sensitivity;
  envelope.governance.consentGiven = true;
  envelope.governance.reviewerName = reviewerName.trim();
  envelope.governance.auditNotes = auditNotes || '';
  envelope.governance.reviewedAt = new Date().toISOString();
  envelope.updatedAt = envelope.governance.reviewedAt;

  // Validate updated envelope with Zod
  const validatedEnvelope = SignalEnvelopeSchema.parse(envelope);

  // Save updated envelope back to SQLite
  db.prepare(`
    UPDATE signal_envelopes
    SET envelope_data = ?, review_status = 'CONFIRMED', updated_at = ?
    WHERE envelope_id = ?
  `).run(JSON.stringify(validatedEnvelope), validatedEnvelope.updatedAt, envelopeId);

  // Log to audit table
  db.prepare(`
    INSERT INTO audit_logs (envelope_id, action, reviewer, timestamp, details)
    VALUES (?, ?, ?, ?, ?)
  `).run(envelopeId, 'COMMIT_REVIEW', reviewerName.trim(), validatedEnvelope.updatedAt, `Sensitivity: ${sensitivity}, Confirmed Signals: ${confirmedCount}`);

  return validatedEnvelope;
}

/**
 * Generate Markdown handoff report Candidate_Signal.md
 */
function generateCandidateSignalMarkdown(envelope) {
  const { envelopeId, contentHash, source, extractedSignals, stakeholderViewpoints, governance } = envelope;

  const confirmedSignals = extractedSignals.filter(s => s.userStatus === 'CONFIRMED' || s.userStatus === 'EDITED');
  const resolvedQuestions = extractedSignals.filter(s => s.temporalStatus === 'RESOLVED' || s.primaryCategory === 'OPEN_QUESTION');
  const supersededStatements = extractedSignals.filter(s => s.temporalStatus === 'SUPERSEDED');

  let md = `# Candidate Enterprise Requirement Signals\n\n`;
  md += `**Envelope ID**: \`${envelopeId}\`  \n`;
  md += `**Source Thread / Key**: \`${source.sourceThreadId || 'N/A'}\`  \n`;
  md += `**SHA-256 Raw Hash**: \`${contentHash}\`  \n`;
  md += `**Connector Mode**: \`${source.connectorMode}\`  \n`;
  md += `**Reviewer**: ${governance.reviewerName || 'N/A'} | **Sensitivity**: \`${governance.sensitivity || 'UNSET'}\`  \n\n`;

  md += `## 1. Confirmed Enterprise Signals (Handoff Ready)\n\n`;
  if (confirmedSignals.length === 0) {
    md += `*No signals confirmed yet. Pending human review gate confirmation.*\n\n`;
  } else {
    confirmedSignals.forEach((s, idx) => {
      const stmtText = s.editedStatement || s.statement;
      md += `### Signal ${idx + 1}: ${s.primaryCategory}\n`;
      md += `- **Statement**: "${stmtText}"\n`;
      md += `- **Primary Category**: \`${s.primaryCategory}\`\n`;
      md += `- **Secondary Tags**: ${s.secondaryTags.map(t => `\`${t}\``).join(', ') || 'None'}\n`;
      md += `- **Compound Citation**: \`${s.sourceUnitId}\`\n`;
      md += `- **PII Alert**: ${s.containsPotentialPII ? `⚠️ YES (${s.piiCategories.join(', ')})` : 'NO'}\n\n`;
    });
  }

  md += `## 2. Temporal Resolution & Superseded Statements\n\n`;
  md += `### Resolved Open Questions\n`;
  if (resolvedQuestions.length === 0) {
    md += `*No resolved questions found.*\n\n`;
  } else {
    resolvedQuestions.forEach(q => {
      md += `- **Question**: "${q.statement}" [Status: \`${q.temporalStatus}\`]\n`;
    });
    md += `\n`;
  }

  md += `### Superseded Thresholds & Rules\n`;
  if (supersededStatements.length === 0) {
    md += `*No superseded rules detected.*\n\n`;
  } else {
    supersededStatements.forEach(sup => {
      md += `- **Superseded Statement**: "${sup.statement}" [\`${sup.sourceUnitId}\`]\n`;
    });
    md += `\n`;
  }

  md += `## 3. Stakeholder Viewpoints\n\n`;
  stakeholderViewpoints.forEach(vp => {
    md += `### Role: ${vp.role}\n`;
    md += `- **Executive Summary**: ${vp.summary}\n`;
    md += `- **Key Concerns**: ${vp.keyConcerns.join('; ')}\n\n`;
  });

  md += `## 4. Provenance & Evidence Traceability\n\n`;
  md += `- **Physical Messages**: ${source.physicalMessageCount}\n`;
  md += `- **Logical Email Thread Count**: ${source.logicalEmailCount}\n`;
  md += `- **Summary Section Excluded**: ${source.summarySectionCount > 0 ? 'YES' : 'NO'}\n`;
  md += `- **Audit Trace**: Review committed at ${governance.reviewedAt || 'Pending'}\n`;

  return md;
}

module.exports = {
  processRawEvidence,
  confirmSignal,
  generateCandidateSignalMarkdown
};
