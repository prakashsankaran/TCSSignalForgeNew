const { z } = require('zod');

const ENTERPRISE_CATEGORIES = [
  'BUSINESS_PROBLEM',
  'BUSINESS_OBJECTIVE',
  'REQUEST',
  'OBLIGATION',
  'PROPOSED_SOLUTION',
  'BUSINESS_RULE',
  'DECISION',
  'ACTION_ITEM',
  'RISK',
  'CONSTRAINT',
  'DEPENDENCY',
  'INTEGRATION',
  'NFR',
  'SECURITY_REQUIREMENT',
  'COMPLIANCE_REQUIREMENT',
  'UX_REQUIREMENT',
  'DEADLINE',
  'MEASURABLE_IMPACT',
  'OPEN_QUESTION',
  'ASSUMPTION',
  'CONFLICT',
  'STAKEHOLDER_VIEWPOINT'
];

const SourceSchema = z.object({
  connectorMode: z.enum(['GMAIL', 'MEET_REST', 'FILE_BACKED', 'SAMPLE_DATA', 'SLACK', 'JIRA', 'CONFLUENCE']),
  sourceThreadId: z.string(),
  physicalMessageCount: z.number().int().min(1),
  logicalEmailCount: z.number().int().min(0),
  summarySectionCount: z.number().int().min(0),
  conversationStructure: z.enum(['SINGLE_MESSAGE', 'EMBEDDED_SIMULATED_THREAD', 'TRANSCRIPT', 'SLACK_THREAD', 'JIRA_ISSUE', 'CONFLUENCE_DOC']),
  rawText: z.string()
});

const LogicalBlockSchema = z.object({
  blockId: z.string(), // e.g. LOGICAL-EMAIL-001 or SUMMARY_SECTION
  sender: z.string().optional(),
  role: z.string().optional(),
  date: z.string().optional(),
  subject: z.string().optional(),
  content: z.string(),
  isSummarySection: z.boolean().default(false),
  excludeFromPrimaryExtraction: z.boolean().default(false)
});

const AtomicUnitSchema = z.object({
  unitId: z.string(), // e.g. GMAIL-MESSAGE-001#LOGICAL-EMAIL-004#SENTENCE-003
  logicalBlockId: z.string(),
  lineNumber: z.number().int(),
  text: z.string(),
  eligibleForExtraction: z.boolean(),
  noiseType: z.enum(['GREETING', 'CLOSING', 'SEPARATOR', 'HEADER', 'SIGNATURE', 'DISCLAIMER', 'METADATA', 'CHANGELOG', 'MACRO', 'BOILERPLATE', 'NONE']).default('NONE')
});

const ExtractedSignalSchema = z.object({
  signalId: z.string(),
  sourceUnitId: z.string(),
  statement: z.string(),
  primaryCategory: z.enum(ENTERPRISE_CATEGORIES),
  secondaryTags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.95),
  containsPotentialPII: z.boolean().default(false),
  piiCategories: z.array(z.string()).default([]),
  temporalStatus: z.enum(['ACTIVE', 'RESOLVED', 'SUPERSEDED']).default('ACTIVE'),
  relationship: z.enum(['ANSWERS', 'SUPERSEDES', 'CONFIRMS', 'CONTRADICTS', 'REFINES', 'SUPPORTS', 'IMPLEMENTS', 'NONE']).default('NONE'),
  targetSignalId: z.string().nullable().optional(),
  userStatus: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'EDITED']).default('PENDING'),
  editedStatement: z.string().optional()
});

const StakeholderViewpointSchema = z.object({
  role: z.string(),
  summary: z.string(),
  keyConcerns: z.array(z.string()),
  evidenceCitations: z.array(z.string())
});

const GovernanceSchema = z.object({
  reviewStatus: z.enum(['UNREVIEWED', 'CONFIRMED', 'REJECTED']).default('UNREVIEWED'),
  sensitivity: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
  consentGiven: z.boolean().default(false),
  reviewerName: z.string().optional(),
  auditNotes: z.string().optional(),
  reviewedAt: z.string().optional()
});

const SignalEnvelopeSchema = z.object({
  envelopeId: z.string(),
  contentHash: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  source: SourceSchema,
  logicalBlocks: z.array(LogicalBlockSchema),
  atomicUnits: z.array(AtomicUnitSchema),
  extractedSignals: z.array(ExtractedSignalSchema),
  stakeholderViewpoints: z.array(StakeholderViewpointSchema),
  governance: GovernanceSchema
});

module.exports = {
  ENTERPRISE_CATEGORIES,
  SignalEnvelopeSchema,
  SourceSchema,
  LogicalBlockSchema,
  AtomicUnitSchema,
  ExtractedSignalSchema,
  StakeholderViewpointSchema,
  GovernanceSchema
};
