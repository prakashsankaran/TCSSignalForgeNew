/**
 * Deterministic Rules Engine for Enterprise Discovery Signal Classification
 * Categorizes atomic statements into 22 canonical enterprise categories.
 * Filters out non-requirement conversational chatter, greetings, and metadata.
 */

const { scanPII } = require('./piiDetector');

function classifyStatement(atomicUnit, logicalBlock) {
  const text = atomicUnit.text.trim();
  if (!text || !atomicUnit.eligibleForExtraction) return null;

  // Ignore pure header section lines without substantive requirement sentences
  if (/^(?:###?\s*)?(?:Acceptance Criteria|Technical Constraints|Executive Summary|Architecture Decisions|Business Rules|Regulatory Compliance|Issue Summary|Resolution & Dependencies|RFC Resolution|System Invariants|Open Questions)[:\s]*$/i.test(text)) {
    return null;
  }

  // Ignore lines shorter than 12 chars unless they have explicit financial or numerical rule indicators
  if (text.length < 12 && !(/[₹$€]\d+/.test(text) || /\b(?:qps|sla|ms)\b/i.test(text))) {
    return null;
  }

  // Filter out conversational chatter & non-signal phrases
  const CHATTER_REGEX = /^(ok|okay|sure|thanks|thank you|sounds good|will do|got it|noted|fyi|see below|let me know|let's discuss|please find attached|best regards|regards|cheers|lgtm|\+1|looking into this|merged pr|working on it|created branch|assigned to backend)\b/i;
  if (CHATTER_REGEX.test(text) && text.length < 40) {
    return null;
  }

  let primaryCategory = null;
  let secondaryTags = [];
  let confidence = 0.92;

  // RULE 0: User Story pattern (As a [role], I want [feature], so that [outcome])
  if (/^As a\b.*I (?:want|need|require)\b.*so that\b/i.test(text)) {
    primaryCategory = 'REQUEST';
    secondaryTags.push('USER_STORY', 'FUNCTIONAL_SPEC');
  }
  // RULE 1: Question matching - any sentence ending with '?' or containing explicit question phrases
  else if (text.includes('?') || /^(what|how|why|who|when|where|can we|should we|is there|do we)\b/i.test(text)) {
    primaryCategory = 'OPEN_QUESTION';
    if (text.toLowerCase().includes('risk') || text.toLowerCase().includes('fraud')) {
      secondaryTags.push('RISK_INQUIRY');
    }
    if (text.toLowerCase().includes('threshold') || text.toLowerCase().includes('limit')) {
      secondaryTags.push('THRESHOLD_CLARIFICATION');
    }
  }
  // RULE 2: Target Dates / Deadlines
  else if (/\b(?:by|deadline|target launch|due date|scheduled for|go-live|before)\s+(?:\d{1,2}\s+[A-Za-z]+|\d{4}|Q[1-4])\b/i.test(text) || /\bby (?:1 October 2026|15 November 2026)\b/i.test(text)) {
    primaryCategory = 'DEADLINE';
    secondaryTags.push('GO_LIVE_MILESTONE');
    if (text.toLowerCase().includes('must') || text.toLowerCase().includes('strictly')) secondaryTags.push('HARD_DEADLINE');
  }
  // RULE 3: Decisions / Approvals / ADR (Takes precedence over general tech phrases)
  else if (/^ADR-\d+:/i.test(text) || /\b(?:we decided|agreed|confirmed|finalized|selected|chosen|we will use|will utilize)\b/i.test(text)) {
    primaryCategory = 'DECISION';
    secondaryTags.push('ARCHITECTURE_DECISION');
    if (/\b(?:encryption|mtls|tls|auth|aes)\b/i.test(text)) {
      secondaryTags.push('SECURITY_ARCHITECTURE');
    }
  }
  // RULE 4: Historical delays / pain points -> BUSINESS_PROBLEM or MEASURABLE_IMPACT
  else if (/\b(?:wait|delay|slow|friction|bottleneck|drop-off|manual processing|turnaround time|loss|legacy settlement)\b/i.test(text)) {
    if (/\b(?:2-3 (?:days|business days)|48 hours|percent|%|hours|costs|₹\d+M)\b/i.test(text)) {
      primaryCategory = 'MEASURABLE_IMPACT';
      secondaryTags.push('CUSTOMER_FRICTION', 'OPERATIONAL_LATENCY');
    } else {
      primaryCategory = 'BUSINESS_PROBLEM';
      secondaryTags.push('PROCESS_PAIN_POINT');
    }
  }
  // RULE 5: Business Rules & Acceptance Criteria (thresholds, validation criteria, automated approvals, conditions)
  else if (/\b(?:auto-approve|flag for manual|flag for senior|override|threshold|maximum auto-approval|invoice exposure limit|risk score is (?:less|below|exceeds|more)|rule \d+|acceptance criteria|\d+\.\s*(?:when|if|all|the system must))\b/i.test(text) || /[₹$€]\s*?\d+[\d,.]*/.test(text) || /\b\d+\s*(?:inr|usd|rupees|dollars)\b/i.test(text)) {
    primaryCategory = 'BUSINESS_RULE';
    if (text.includes('₹') || text.toLowerCase().includes('inr') || text.toLowerCase().includes('dollar') || text.includes('$')) {
      secondaryTags.push('FINANCIAL_THRESHOLD');
    }
    if (text.toLowerCase().includes('flag') || text.toLowerCase().includes('override') || text.toLowerCase().includes('review')) {
      secondaryTags.push('RISK_CONTROL');
    }
    if (/^\d+\.\s*(?:when|if)\b/i.test(text) || text.toLowerCase().includes('acceptance criteria')) {
      secondaryTags.push('ACCEPTANCE_CRITERIA');
    }
  }
  // RULE 6: Compliance & Auditability / Explainability
  else if (/\b(?:explainable|audit|regulatory|compliance|gdpr|sox|pci|rbi|sec|mca|statutory)\b/i.test(text)) {
    primaryCategory = 'COMPLIANCE_REQUIREMENT';
    if (/\bexplainable\b/i.test(text)) {
      secondaryTags.push('AUDITABILITY', 'MODEL_EXPLAINABILITY');
    } else {
      secondaryTags.push('REGULATORY');
    }
  }
  // RULE 7: Security / Authentication / Encryption
  else if (/\b(?:security|encryption|mtls|auth|oauth|mfa|tls|token|tokenization|privacy|kms|biometric|multi-signature)\b/i.test(text)) {
    primaryCategory = 'SECURITY_REQUIREMENT';
    secondaryTags.push('DATA_PROTECTION');
  }
  // RULE 8: NFR (Non-Functional Requirements)
  else if (/\b(?:latency|throughput|uptime|sla|availability|ms|milliseconds|qps|scalable|p99)\b/i.test(text)) {
    primaryCategory = 'NFR';
    secondaryTags.push('PERFORMANCE_SLA');
  }
  // RULE 9: Blockers & Dependencies
  else if (/\b(?:blocker|blocking)\b/i.test(text)) {
    primaryCategory = 'RISK';
    secondaryTags.push('PROJECT_BLOCKER');
  } else if (/\b(?:depends on|blocked by|prerequisite|dependency)\b/i.test(text)) {
    primaryCategory = 'DEPENDENCY';
    secondaryTags.push('SYSTEM_DEPENDENCY');
  }
  // RULE 10: Action Items / Assignments
  else if (/\b(?:action item|assigned to|will configure|will build|will implement|todo|owner:)\b/i.test(text) || /^\s*-\s*\[\s*\]/i.test(text)) {
    primaryCategory = 'ACTION_ITEM';
    secondaryTags.push('TASK_ASSIGNMENT');
  }
  // RULE 11: Business Objectives
  else if (/\b(?:objective|goal|target|achieve|aim|eliminate|reduce fraud|increase conversion)\b/i.test(text)) {
    primaryCategory = 'BUSINESS_OBJECTIVE';
    secondaryTags.push('STRATEGIC_GOAL');
  }
  // RULE 12: Risks & Constraints
  else if (/\b(?:risk|vulnerability|threat|exposure|loss|chargeback)\b/i.test(text)) {
    primaryCategory = 'RISK';
    secondaryTags.push('FRAUD_RISK');
  } else if (/\b(?:constraint|limited to|must not|cannot|restricted)\b/i.test(text)) {
    primaryCategory = 'CONSTRAINT';
    secondaryTags.push('SYSTEM_LIMITATION');
  }
  // RULE 13: UX Requirements
  else if (/\b(?:ui|ux|screen|interface|dashboard|modal|pane|view|user flow)\b/i.test(text)) {
    primaryCategory = 'UX_REQUIREMENT';
    secondaryTags.push('FRONTEND_DESIGN');
  }
  // RULE 14: Integrations & APIs
  else if (/\b(?:api|integration|webhook|connector|microservice|rest|grpc|kafka)\b/i.test(text)) {
    primaryCategory = 'INTEGRATION';
    secondaryTags.push('THIRD_PARTY_API');
  }
  // RULE 15: Proposed Solutions & Requests
  else if (/\b(?:propose|suggest|recommend|solution|architecture)\b/i.test(text)) {
    primaryCategory = 'PROPOSED_SOLUTION';
    secondaryTags.push('TECHNICAL_PROPOSAL');
  } else if (/\b(?:request|need|require|please provide|want|mandatory)\b/i.test(text)) {
    primaryCategory = 'REQUEST';
    secondaryTags.push('STAKEHOLDER_REQUEST');
  }
  // RULE 16: Stakeholder Viewpoints
  else if (/\b(?:from a .* perspective|as the .*|my perspective|viewpoint|concern)\b/i.test(text)) {
    primaryCategory = 'STAKEHOLDER_VIEWPOINT';
    secondaryTags.push('ROLE_PERSPECTIVE');
  }
  // RULE 17: General Substantive Requirement Statements
  else if (/\b(?:must|shall|should|will|ensure|configured|mandate|workflow|process|criteria)\b/i.test(text) && text.length > 25) {
    primaryCategory = 'BUSINESS_RULE';
    secondaryTags.push('SYSTEM_CRITERIA');
  }

  // If the line did not match any requirement rule or indicator, do not extract it as a signal!
  if (!primaryCategory) {
    return null;
  }

  // Perform PII scan
  const piiResult = scanPII(text);

  return {
    signalId: `SIG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    sourceUnitId: atomicUnit.unitId,
    statement: text,
    primaryCategory: primaryCategory,
    secondaryTags: Array.from(new Set(secondaryTags)),
    confidence: confidence,
    containsPotentialPII: piiResult.containsPotentialPII,
    piiCategories: piiResult.piiCategories,
    temporalStatus: 'ACTIVE',
    relationship: 'NONE',
    targetSignalId: null,
    userStatus: 'PENDING'
  };
}

module.exports = {
  classifyStatement
};
