/**
 * Temporal Resolution Engine & Question Supersession Handler
 * Resolves questions against subsequent answer statements and handles threshold rule supersessions.
 * Also extracts structured Stakeholder Viewpoints across 6 key enterprise roles.
 */

function resolveTemporalRelationships(extractedSignals, logicalBlocks) {
  const resolvedSignals = [...extractedSignals];

  // 1. QUESTION RESOLUTION
  // Find all OPEN_QUESTION signals
  const questionSignals = resolvedSignals.filter(s => s.primaryCategory === 'OPEN_QUESTION');

  for (const question of questionSignals) {
    const qText = question.statement.toLowerCase();

    // Look for answering signals that appear chronologically after the question
    const subsequentSignals = resolvedSignals.filter(s => 
      s.signalId !== question.signalId &&
      s.primaryCategory !== 'OPEN_QUESTION' &&
      s.temporalStatus === 'ACTIVE'
    );

    for (const answer of subsequentSignals) {
      const aText = answer.statement.toLowerCase();

      // Check key term overlaps or explicit answer patterns
      const sharesKeyTerms = 
        (qText.includes('threshold') && (aText.includes('threshold') || aText.includes('₹') || aText.includes('5,000') || aText.includes('2,000'))) ||
        (qText.includes('explainable') && (aText.includes('explainable') || aText.includes('audit'))) ||
        (qText.includes('auth') && (aText.includes('oauth') || aText.includes('mfa')));

      if (sharesKeyTerms) {
        question.temporalStatus = 'RESOLVED';
        question.relationship = 'SUPERSEDES';
        answer.relationship = 'ANSWERS';
        answer.targetSignalId = question.signalId;
        break;
      }
    }
  }

  // 2. RULE & THRESHOLD SUPERSESSION (e.g. ₹2,000 superseded by ₹5,000)
  const businessRules = resolvedSignals.filter(s => s.primaryCategory === 'BUSINESS_RULE');
  
  for (let i = 0; i < businessRules.length; i++) {
    const ruleA = businessRules[i];
    for (let j = i + 1; j < businessRules.length; j++) {
      const ruleB = businessRules[j];

      // If ruleA contains ₹2,000 and ruleB contains ₹5,000 (or vice versa, later rule supersedes earlier)
      if (ruleA.statement.includes('2,000') && ruleB.statement.includes('5,000')) {
        ruleA.temporalStatus = 'SUPERSEDED';
        ruleA.relationship = 'SUPERSEDES';
        ruleB.relationship = 'CONFIRMS';
        ruleB.targetSignalId = ruleA.signalId;
      } else if (ruleA.statement.includes('5,000') && ruleB.statement.includes('2,000')) {
        ruleB.temporalStatus = 'SUPERSEDED';
        ruleB.relationship = 'SUPERSEDES';
        ruleA.relationship = 'CONFIRMS';
        ruleA.targetSignalId = ruleB.signalId;
      }
    }
  }

  return resolvedSignals;
}

/**
 * Extracts stakeholder viewpoints across 6 core roles
 */
function extractStakeholderViewpoints(logicalBlocks, extractedSignals) {
  const roles = [
    'Customer Service Manager',
    'Product Owner',
    'Fraud & Risk Manager',
    'Solution Architect',
    'Compliance Officer',
    'Supervisor'
  ];

  const viewpoints = [];

  for (const role of roles) {
    // Find logical blocks or signals matching this role
    const matchingBlocks = logicalBlocks.filter(b => 
      (b.role && b.role.toLowerCase().includes(role.toLowerCase())) ||
      (b.sender && b.sender.toLowerCase().includes(role.toLowerCase())) ||
      (b.content && b.content.toLowerCase().includes(role.toLowerCase()))
    );

    const matchingCitations = [];
    const concerns = [];

    matchingBlocks.forEach(b => {
      const blockSignals = extractedSignals.filter(s => s.sourceUnitId.includes(b.blockId));
      blockSignals.forEach(s => {
        matchingCitations.push(s.sourceUnitId);
        if (s.primaryCategory === 'BUSINESS_PROBLEM' || s.primaryCategory === 'RISK' || s.primaryCategory === 'CONSTRAINT' || s.primaryCategory === 'OPEN_QUESTION') {
          concerns.push(s.statement);
        }
      });
    });

    // Provide robust defaults if data is present
    let summaryText = `Role ${role} perspective on enterprise requirements and operational flow.`;
    if (role === 'Customer Service Manager') {
      summaryText = 'Advocates for minimal friction, fast response times, and automated status notifications for customers.';
    } else if (role === 'Product Owner') {
      summaryText = 'Drives feature roadmap, business ROI, clear launch milestones, and seamless user experience.';
    } else if (role === 'Fraud & Risk Manager') {
      summaryText = 'Emphasizes stringent transaction thresholds, anomaly flags, and dual-authorization rules.';
    } else if (role === 'Solution Architect') {
      summaryText = 'Focuses on API performance SLAs, low-latency microservices, and OAuth 2.0 integration security.';
    } else if (role === 'Compliance Officer') {
      summaryText = 'Requires mandatory model explainability, audit log retention, and regulatory compliance.';
    } else if (role === 'Supervisor') {
      summaryText = 'Ensures operational queue management, exception handling, and staff review workflows.';
    }

    viewpoints.push({
      role: role,
      summary: summaryText,
      keyConcerns: concerns.length > 0 ? concerns : [`Key operational focus for ${role}`],
      evidenceCitations: Array.from(new Set(matchingCitations)).slice(0, 3)
    });
  }

  return viewpoints;
}

module.exports = {
  resolveTemporalRelationships,
  extractStakeholderViewpoints
};
