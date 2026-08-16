const { encrypt, decrypt, sha256Hash } = require('../src/crypto/encryption');
const { parseLogicalBlocks } = require('../src/parser/logicalBlockParser');
const { segmentAtomicUnits } = require('../src/parser/atomicSegmenter');
const { scanPII } = require('../src/classifier/piiDetector');
const { classifyStatement } = require('../src/classifier/rulesEngine');
const { resolveTemporalRelationships, extractStakeholderViewpoints } = require('../src/classifier/temporalResolver');
const { getSampleData } = require('../src/ingestion/sampleDataLoader');
const { getSampleSlackData } = require('../src/ingestion/slackConnector');
const { getSampleJiraData } = require('../src/ingestion/jiraConnector');
const { getSampleConfluenceData } = require('../src/ingestion/confluenceConnector');
const { processRawEvidence, confirmSignal, generateCandidateSignalMarkdown } = require('../src/services/signalService');
const { SignalEnvelopeSchema } = require('../src/schemas/signalEnvelopeSchema');

describe('Enterprise Signal Intake Engine Test Suite (20 Tests)', () => {

  // --- CRYPTOGRAPHY & SECURITY TESTS (3 Tests) ---
  describe('1. Cryptography & Security', () => {
    test('1.1 AES-256-GCM encryption/decryption roundtrip succeeds', () => {
      const token = 'ya29.a0Axoo-sample-oauth-token-string-12345';
      const enc = encrypt(token, 'test-key-32-bytes-long-123456789');
      expect(enc).toHaveProperty('encryptedText');
      expect(enc).toHaveProperty('iv');
      expect(enc).toHaveProperty('tag');

      const decrypted = decrypt(enc.encryptedText, enc.iv, enc.tag, 'test-key-32-bytes-long-123456789');
      expect(decrypted).toBe(token);
    });

    test('1.2 AES-256-GCM detects tampering and throws error', () => {
      const token = 'secret-access-token';
      const enc = encrypt(token, 'test-key-32-bytes-long-123456789');
      const tamperedTag = (parseInt(enc.tag.slice(0, 2), 16) ^ 0xff).toString(16) + enc.tag.slice(2);
      expect(() => {
        decrypt(enc.encryptedText, enc.iv, tamperedTag, 'test-key-32-bytes-long-123456789');
      }).toThrow();
    });

    test('1.3 SHA-256 content hashing produces deterministic 64-char hex strings', () => {
      const text = 'Sample evidence body content text';
      const hash1 = sha256Hash(text);
      const hash2 = sha256Hash(text);
      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
      expect(sha256Hash('Different content')).not.toBe(hash1);
    });
  });

  // --- LOGICAL BLOCK PARSER TESTS (3 Tests) ---
  describe('2. Physical vs Logical Conversation Parsing', () => {
    test('2.1 Truthful physical message count is 1 for embedded simulated threads', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      expect(parsed.physicalMessageCount).toBe(1);
      expect(parsed.conversationStructure).toBe('EMBEDDED_SIMULATED_THREAD');
    });

    test('2.2 Embedded thread parses 10 logical emails correctly', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      expect(parsed.logicalEmailCount).toBe(10);
      expect(parsed.logicalBlocks.filter(b => !b.isSummarySection)).toHaveLength(10);
    });

    test('2.3 Trailing summary section is isolated with excludeFromPrimaryExtraction true', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      const summaryBlock = parsed.logicalBlocks.find(b => b.isSummarySection);
      expect(summaryBlock).toBeDefined();
      expect(summaryBlock.excludeFromPrimaryExtraction).toBe(true);
      expect(summaryBlock.blockId).toBe('SUMMARY_SECTION');
    });
  });

  // --- ATOMIC SEGMENTATION & NOISE STRIPPING TESTS (3 Tests) ---
  describe('3. Atomic Segmentation & Noise Stripping', () => {
    test('3.1 Atomic units generate compound citation IDs', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      const units = segmentAtomicUnits(parsed.logicalBlocks, sample.realMessageId);
      expect(units.length).toBeGreaterThan(15);
      expect(units[0].unitId).toMatch(/^GMAIL-MESSAGE-[a-f0-9]+#LOGICAL-EMAIL-\d+#SENTENCE-\d+$/);
    });

    test('3.2 Greetings and closings are tagged as noise (eligibleForExtraction false)', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      const units = segmentAtomicUnits(parsed.logicalBlocks, sample.realMessageId);
      const greetingUnit = units.find(u => u.text.startsWith('Hi Team'));
      const closingUnit = units.find(u => u.text.startsWith('Regards'));
      expect(greetingUnit.eligibleForExtraction).toBe(false);
      expect(greetingUnit.noiseType).toBe('GREETING');
      expect(closingUnit.eligibleForExtraction).toBe(false);
      expect(closingUnit.noiseType).toBe('CLOSING');
    });

    test('3.3 Summary section lines have eligibleForExtraction false', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      const units = segmentAtomicUnits(parsed.logicalBlocks, sample.realMessageId);
      const summaryUnits = units.filter(u => u.logicalBlockId === 'SUMMARY_SECTION');
      summaryUnits.forEach(u => {
        expect(u.eligibleForExtraction).toBe(false);
      });
    });
  });

  // --- DETERMINISTIC RULES ENGINE TESTS (4 Tests) ---
  describe('4. Deterministic Classification Engine', () => {
    test('4.1 Questions with question marks are classified as OPEN_QUESTION', () => {
      const unit = { unitId: 'U1', text: 'What is the acceptable system latency for instant risk scoring during peak traffic?', eligibleForExtraction: true };
      const signal = classifyStatement(unit, {});
      expect(signal.primaryCategory).toBe('OPEN_QUESTION');
    });

    test('4.2 Target dates are classified as DEADLINE', () => {
      const unit = { unitId: 'U2', text: 'Our target launch date is locked for deployment by 1 October 2026.', eligibleForExtraction: true };
      const signal = classifyStatement(unit, {});
      expect(signal.primaryCategory).toBe('DEADLINE');
      expect(signal.secondaryTags).toContain('GO_LIVE_MILESTONE');
    });

    test('4.3 Historical delays are classified as BUSINESS_PROBLEM or MEASURABLE_IMPACT', () => {
      const unit = { unitId: 'U3', text: 'Currently, customers wait 2-3 days for claim approvals, causing a 24% drop-off in customer satisfaction.', eligibleForExtraction: true };
      const signal = classifyStatement(unit, {});
      expect(['BUSINESS_PROBLEM', 'MEASURABLE_IMPACT']).toContain(signal.primaryCategory);
    });

    test('4.4 Model explainability requirements are classified as COMPLIANCE_REQUIREMENT with AUDITABILITY tag', () => {
      const unit = { unitId: 'U4', text: 'Regarding automated risk scoring: all AI risk decisions must be explainable and auditable under regulatory guidelines.', eligibleForExtraction: true };
      const signal = classifyStatement(unit, {});
      expect(signal.primaryCategory).toBe('COMPLIANCE_REQUIREMENT');
      expect(signal.secondaryTags).toContain('AUDITABILITY');
    });
  });

  // --- TEMPORAL RESOLUTION & STAKEHOLDER TESTS (3 Tests) ---
  describe('5. Temporal Resolution & Stakeholder Viewpoints', () => {
    test('5.1 Open questions are matched with answers and marked RESOLVED', () => {
      const signals = [
        { signalId: 'S1', primaryCategory: 'OPEN_QUESTION', statement: 'What is the acceptable threshold limit?', temporalStatus: 'ACTIVE', sourceUnitId: 'U1' },
        { signalId: 'S2', primaryCategory: 'BUSINESS_RULE', statement: 'The auto-approval threshold limit is set to ₹5,000.', temporalStatus: 'ACTIVE', sourceUnitId: 'U2' }
      ];
      const resolved = resolveTemporalRelationships(signals, []);
      const q = resolved.find(s => s.signalId === 'S1');
      expect(q.temporalStatus).toBe('RESOLVED');
    });

    test('5.2 Earlier threshold rule (₹2,000) is marked SUPERSEDED by later ₹5,000 threshold', () => {
      const signals = [
        { signalId: 'S1', primaryCategory: 'BUSINESS_RULE', statement: 'We initially propose that all instant claims with a value up to ₹2,000 will be auto-approved.', temporalStatus: 'ACTIVE', sourceUnitId: 'U1' },
        { signalId: 'S2', primaryCategory: 'BUSINESS_RULE', statement: 'We decided that the auto-approval threshold for low-risk verified customers is increased to ₹5,000.', temporalStatus: 'ACTIVE', sourceUnitId: 'U2' }
      ];
      const resolved = resolveTemporalRelationships(signals, []);
      const earlier = resolved.find(s => s.signalId === 'S1');
      expect(earlier.temporalStatus).toBe('SUPERSEDED');
    });

    test('5.3 Stakeholder viewpoints extract 6 role-specific summary objects', () => {
      const sample = getSampleData();
      const parsed = parseLogicalBlocks(sample.rawText, sample.sourceThreadId, sample.realMessageId);
      const units = segmentAtomicUnits(parsed.logicalBlocks, sample.realMessageId);
      const signals = units.map(u => classifyStatement(u, {})).filter(Boolean);
      const viewpoints = extractStakeholderViewpoints(parsed.logicalBlocks, signals);
      expect(viewpoints).toHaveLength(6);
      expect(viewpoints.map(v => v.role)).toContain('Fraud & Risk Manager');
    });
  });

  // --- PII SCANNER & REVIEW GATE TESTS (4 Tests) ---
  describe('6. PII Scanner & Review Gate Enforcement', () => {
    test('6.1 PII detector correctly flags email addresses and payment references', () => {
      const pii1 = scanPII('Send details to user.support@external-partner.com for confirmation');
      expect(pii1.containsPotentialPII).toBe(true);
      expect(pii1.piiCategories).toContain('EMAIL_ADDRESS');

      const pii2 = scanPII('Customer account reference ACC-994821-X has pending status');
      expect(pii2.containsPotentialPII).toBe(true);
      expect(pii2.piiCategories).toContain('PAYMENT_INFORMATION_REFERENCE');
    });

    test('6.2 Full sample ingestion generates Zod-valid SignalEnvelope', () => {
      const sample = getSampleData();
      const envelope = processRawEvidence(sample);
      expect(() => SignalEnvelopeSchema.parse(envelope)).not.toThrow();
      expect(envelope.envelopeId).toMatch(/^ENV-/);
    });

    test('6.3 Review gate fails if sensitivity, consent, reviewer name, or confirmed signal is missing', () => {
      const sample = getSampleData();
      const envelope = processRawEvidence(sample);

      // Missing sensitivity
      expect(() => {
        confirmSignal(envelope.envelopeId, { sensitivity: '', consentGiven: true, reviewerName: 'Alice', signalUpdates: [] });
      }).toThrow(/Sensitivity classification/);

      // Missing consent
      expect(() => {
        confirmSignal(envelope.envelopeId, { sensitivity: 'CONFIDENTIAL', consentGiven: false, reviewerName: 'Alice', signalUpdates: [] });
      }).toThrow(/consent/);

      // Missing reviewer name
      expect(() => {
        confirmSignal(envelope.envelopeId, { sensitivity: 'CONFIDENTIAL', consentGiven: true, reviewerName: '', signalUpdates: [] });
      }).toThrow(/Reviewer name/);

      // No confirmed signals
      expect(() => {
        confirmSignal(envelope.envelopeId, { sensitivity: 'CONFIDENTIAL', consentGiven: true, reviewerName: 'Alice', signalUpdates: [] });
      }).toThrow(/At least 1 statement/);
    });

    test('6.4 Review gate succeeds when all criteria are satisfied and produces Markdown handoff', () => {
      const sample = getSampleData();
      const envelope = processRawEvidence(sample);
      const firstSignal = envelope.extractedSignals[0];

      const confirmedEnvelope = confirmSignal(envelope.envelopeId, {
        sensitivity: 'CONFIDENTIAL',
        consentGiven: true,
        reviewerName: 'Prakash (Architect)',
        auditNotes: 'Verified all 22 requirement signals and temporal supersessions.',
        signalUpdates: [{ signalId: firstSignal.signalId, userStatus: 'CONFIRMED' }]
      });

      expect(confirmedEnvelope.governance.reviewStatus).toBe('CONFIRMED');
      expect(confirmedEnvelope.governance.sensitivity).toBe('CONFIDENTIAL');

      const md = generateCandidateSignalMarkdown(confirmedEnvelope);
      expect(md).toContain('# Candidate Enterprise Requirement Signals');
      expect(md).toContain('CONFIDENTIAL');
    });
  });

  // --- SLACK INTEGRATION TESTS (3 Tests) ---
  describe('7. Slack Thread Ingestion & Signal Extraction', () => {
    test('7.1 Slack thread raw evidence ingestion generates Zod-valid SignalEnvelope with connectorMode SLACK', () => {
      const slackSample = getSampleSlackData();
      expect(slackSample.connectorMode).toBe('SLACK');
      const envelope = processRawEvidence(slackSample);
      expect(() => SignalEnvelopeSchema.parse(envelope)).not.toThrow();
      expect(envelope.source.connectorMode).toBe('SLACK');
    });

    test('7.2 Slack team conversation is classified into Enterprise Requirement Signals correctly', () => {
      const slackSample = getSampleSlackData();
      const envelope = processRawEvidence(slackSample);
      expect(envelope.extractedSignals.length).toBeGreaterThan(0);
      
      const categories = envelope.extractedSignals.map(s => s.primaryCategory);
      expect(categories.some(c => ['BUSINESS_PROBLEM', 'BUSINESS_RULE', 'REQUEST', 'PROPOSED_SOLUTION'].includes(c))).toBe(true);
    });

    test('7.3 Slack thread can be confirmed via human review gate and generates Markdown report', () => {
      const slackSample = getSampleSlackData();
      const envelope = processRawEvidence(slackSample);
      const firstSignal = envelope.extractedSignals[0];

      const confirmedEnvelope = confirmSignal(envelope.envelopeId, {
        sensitivity: 'INTERNAL',
        consentGiven: true,
        reviewerName: 'Slack Lead Reviewer',
        auditNotes: 'Confirmed Slack requirements for FrugalForge discovery.',
        signalUpdates: [{ signalId: firstSignal.signalId, userStatus: 'CONFIRMED' }]
      });

      expect(confirmedEnvelope.governance.reviewStatus).toBe('CONFIRMED');
      const md = generateCandidateSignalMarkdown(confirmedEnvelope);
      expect(md).toContain('`SLACK`');
    });
  });

  // --- JIRA INTEGRATION & NOISE FILTERING TESTS (4 Tests) ---
  describe('8. Jira Issue Ingestion & High-Precision Noise Filtering', () => {
    test('8.1 Jira raw evidence ingestion generates Zod-valid SignalEnvelope with connectorMode JIRA and ENV-JIRA ID', () => {
      const jiraSample = getSampleJiraData();
      expect(jiraSample.connectorMode).toBe('JIRA');
      const envelope = processRawEvidence(jiraSample);
      expect(() => SignalEnvelopeSchema.parse(envelope)).not.toThrow();
      expect(envelope.source.connectorMode).toBe('JIRA');
      expect(envelope.envelopeId).toMatch(/^ENV-JIRA-\d{3}$/);
    });

    test('8.2 Jira metadata (Reporter, Assignee, Priority, Sprint) is stripped as noise (eligibleForExtraction false)', () => {
      const jiraSample = getSampleJiraData();
      const envelope = processRawEvidence(jiraSample);
      
      // Verify atomic units contain METADATA noise tags
      const metadataUnits = envelope.atomicUnits.filter(u => u.noiseType === 'METADATA');
      expect(metadataUnits.length).toBeGreaterThan(0);
      metadataUnits.forEach(u => {
        expect(u.eligibleForExtraction).toBe(false);
      });

      // Verify no extracted signal contains raw reporter/assignee metadata lines
      envelope.extractedSignals.forEach(s => {
        expect(s.statement).not.toMatch(/^Reporter:\s*/i);
        expect(s.statement).not.toMatch(/^Project:\s*.*\|\s*Issue Type:\s*/i);
      });
    });

    test('8.3 Extracts high-value Acceptance Criteria, User Story, Technical Constraints, and Deadlines', () => {
      const jiraSample = getSampleJiraData();
      const envelope = processRawEvidence(jiraSample);
      expect(envelope.extractedSignals.length).toBeGreaterThan(0);

      const categories = envelope.extractedSignals.map(s => s.primaryCategory);
      expect(categories).toContain('REQUEST'); // User story
      expect(categories).toContain('BUSINESS_RULE'); // Acceptance Criteria / MCA
      expect(categories).toContain('DECISION'); // Architecture decision
      expect(categories).toContain('DEADLINE'); // Target go-live date
      expect(categories).toContain('COMPLIANCE_REQUIREMENT'); // RBI audit
    });

    test('8.4 Jira envelope succeeds review gate and exports valid Markdown report', () => {
      const jiraSample = getSampleJiraData();
      const envelope = processRawEvidence(jiraSample);
      const firstSignal = envelope.extractedSignals[0];

      const confirmedEnvelope = confirmSignal(envelope.envelopeId, {
        sensitivity: 'CONFIDENTIAL',
        consentGiven: true,
        reviewerName: 'Maya Sundaram (PO)',
        auditNotes: 'Jira PROJ-1024 story accepted for sprint delivery.',
        signalUpdates: [{ signalId: firstSignal.signalId, userStatus: 'CONFIRMED' }]
      });

      expect(confirmedEnvelope.governance.reviewStatus).toBe('CONFIRMED');
      const md = generateCandidateSignalMarkdown(confirmedEnvelope);
      expect(md).toContain('`JIRA`');
      expect(md).toContain('PROJ-1024');
    });
  });

  // --- CONFLUENCE INTEGRATION & NOISE FILTERING TESTS (4 Tests) ---
  describe('9. Confluence PRD Ingestion & Architectural Signal Extraction', () => {
    test('9.1 Confluence raw evidence generates Zod-valid SignalEnvelope with connectorMode CONFLUENCE and ENV-CONF ID', () => {
      const confSample = getSampleConfluenceData();
      expect(confSample.connectorMode).toBe('CONFLUENCE');
      const envelope = processRawEvidence(confSample);
      expect(() => SignalEnvelopeSchema.parse(envelope)).not.toThrow();
      expect(envelope.source.connectorMode).toBe('CONFLUENCE');
      expect(envelope.envelopeId).toMatch(/^ENV-CONF-\d{3}$/);
    });

    test('9.2 Confluence space metadata and document boilerplate are tagged as noise', () => {
      const confSample = getSampleConfluenceData();
      const envelope = processRawEvidence(confSample);

      const metadataUnits = envelope.atomicUnits.filter(u => u.noiseType === 'METADATA');
      expect(metadataUnits.length).toBeGreaterThan(0);
      metadataUnits.forEach(u => {
        expect(u.eligibleForExtraction).toBe(false);
      });

      envelope.extractedSignals.forEach(s => {
        expect(s.statement).not.toMatch(/^Space:\s*.*\|\s*Page Title:\s*/i);
        expect(s.statement).not.toMatch(/^Document Status:\s*/i);
      });
    });

    test('9.3 Extracts Architecture Decisions (ADR), NFRs, Compliance, and Open RFC Questions', () => {
      const confSample = getSampleConfluenceData();
      const envelope = processRawEvidence(confSample);
      expect(envelope.extractedSignals.length).toBeGreaterThan(0);

      const categories = envelope.extractedSignals.map(s => s.primaryCategory);
      expect(categories).toContain('BUSINESS_PROBLEM'); // Settlement delay
      expect(categories).toContain('DECISION'); // ADR-01 Kafka
      expect(categories).toContain('NFR'); // 150ms latency SLA
      expect(categories).toContain('BUSINESS_RULE'); // Financial limit ₹10,000 / ₹50,000
      expect(categories).toContain('COMPLIANCE_REQUIREMENT'); // Explainable AI / RBI
      expect(categories).toContain('OPEN_QUESTION'); // 7 years retention
    });

    test('9.4 Confluence envelope succeeds review gate and exports valid Markdown report', () => {
      const confSample = getSampleConfluenceData();
      const envelope = processRawEvidence(confSample);
      const firstSignal = envelope.extractedSignals[0];

      const confirmedEnvelope = confirmSignal(envelope.envelopeId, {
        sensitivity: 'RESTRICTED',
        consentGiven: true,
        reviewerName: 'Ananya Deshmukh (Principal Architect)',
        auditNotes: 'Confluence RFC approved with Kafka & RBI compliance.',
        signalUpdates: [{ signalId: firstSignal.signalId, userStatus: 'CONFIRMED' }]
      });

      expect(confirmedEnvelope.governance.reviewStatus).toBe('CONFIRMED');
      expect(confirmedEnvelope.governance.sensitivity).toBe('RESTRICTED');
      const md = generateCandidateSignalMarkdown(confirmedEnvelope);
      expect(md).toContain('`CONFLUENCE`');
      expect(md).toContain('CONF-ARCH-882');
    });
  });

});

