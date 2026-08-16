/**
 * Jira Integration Connector
 * Ingests Jira User Stories, Epics, Bugs, and Technical Tasks with comments and Acceptance Criteria.
 * Supports live Jira Cloud/Server REST API v3, file exports (.json, .xml, .txt, .md), and enterprise sample data.
 */

const config = require('../config');

// Allow local HTTPS fetch in corporate proxy environments
if (process.env.NODE_ENV !== 'production' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Pre-built Enterprise Candidate Jira User Story & Specification (JIRA)
 */
function getSampleJiraData() {
  const issueKey = 'PROJ-1024';
  const rawJiraText = `--- PHYSICAL JIRA ISSUE: ${issueKey} ---
Project: FrugalForge Enterprise Core | Issue Type: Story | Priority: High | Status: In Progress
Reporter: Maya Sundaram (Product Owner) | Assignee: Vikramaditya Verma (Lead Architect) | Sprint: Sprint 48 (2026-Q3)
Created: 2026-08-11T09:15:00Z | Updated: 2026-08-14T17:30:00Z

--- Logical Email LOGICAL-EMAIL-001 ---
From: Maya Sundaram (Product Owner)
Date: 2026-08-11T09:15:00Z
Subject: PROJ-1024: Automated Vendor Onboarding & Real-Time Risk Evaluation
Role: Product Owner

Issue Summary:
As a Procurement Risk Officer, I want an automated vendor onboarding workflow with instant compliance screening, so that we eliminate manual onboarding latency and prevent vendor onboarding fraud.

Business Problem & Objectives:
Our current spreadsheet-based vendor verification takes 2-3 business days per vendor, resulting in a 40% vendor onboarding drop-off and severe procurement delays.
The business objective is to achieve instant automated vendor approvals within 5 minutes for pre-cleared tier-1 vendors.

--- Logical Email LOGICAL-EMAIL-002 ---
From: Maya Sundaram (Product Owner)
Date: 2026-08-11T10:00:00Z
Subject: PROJ-1024 Acceptance Criteria
Role: Product Owner

Acceptance Criteria:
1. When a vendor submits registration details, the system must validate PAN, GSTIN, and corporate CIN via MCA REST APIs.
2. If vendor risk score is less than 20 and invoice exposure limit is under ₹50,000, the system must auto-approve vendor activation without manual intervention.
3. If vendor risk score exceeds 50 or bank jurisdiction is high-risk, the system must flag for manual senior supervisor override.
4. Target go-live is strictly locked for deployment by 15 November 2026.

--- Logical Email LOGICAL-EMAIL-003 ---
From: Vikramaditya Verma (Lead Architect)
Date: 2026-08-12T14:20:00Z
Subject: PROJ-1024 Technical Constraints & Architecture Decision
Role: Solution Architect

Technical Constraints & Architecture Decision:
We decided that all outbound webhook calls to the core banking ledger must use mTLS encryption with AES-256 payload signing.
The verification microservice must maintain a sub-200ms response SLA under 500 QPS load.
All vendor bank account details must undergo AES-256 tokenization and mask PII account references before entering audit ledgers.

--- Logical Email LOGICAL-EMAIL-004 ---
From: Neha Kulkarni (Compliance Officer)
Date: 2026-08-13T11:05:00Z
Subject: PROJ-1024 Compliance & Open Questions
Role: Compliance Officer

Compliance & Regulatory Obligations:
Every automated decision output must produce an immutable cryptographic trace complying with RBI audit guidelines.
Question: Do we require dual-factor authorization when a supervisor executes a manual threshold override?

--- Logical Email LOGICAL-EMAIL-005 ---
From: Vikramaditya Verma (Lead Architect)
Date: 2026-08-14T16:45:00Z
Subject: PROJ-1024 Resolution & Dependencies
Role: Solution Architect

Resolution & System Dependencies:
To answer Neha's question: yes, manual supervisor overrides will require dual-factor biometric authorization.
This story depends on the upstream Core Banking Master Data API v2 service release.
Blocker: Staging sandbox credentials for GSTIN verification must be provisioned before integration test kick-off.

Expected Requirement Signals for Layer 0 Extraction
--------------------------------------------------
[TEST SUMMARY — EXCLUDED FROM EXTRACTION]
- Source Type: Jira Issue Specification
- Primary Categories: BUSINESS_PROBLEM, BUSINESS_OBJECTIVE, BUSINESS_RULE, NFR, DECISION, DEADLINE, COMPLIANCE_REQUIREMENT, OPEN_QUESTION, DEPENDENCY
`;

  return {
    connectorMode: 'JIRA',
    sourceThreadId: `JIRA-${issueKey}`,
    realMessageId: `jira-${issueKey.toLowerCase()}-1904a`,
    rawText: rawJiraText
  };
}

/**
 * Fetch Jira issue from Jira Cloud / Server REST API (or fallback to sample data)
 */
async function fetchJiraIssue(issueKey = 'PROJ-1024') {
  const jiraHost = config.JIRA_HOST || process.env.JIRA_HOST;
  const jiraToken = config.JIRA_API_TOKEN || process.env.JIRA_API_TOKEN;
  const jiraEmail = config.JIRA_EMAIL || process.env.JIRA_EMAIL;

  if (!jiraHost || !jiraToken || !jiraEmail) {
    return getSampleJiraData();
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');
    const url = `https://${jiraHost.replace(/^https?:\/\//, '')}/rest/api/3/issue/${encodeURIComponent(issueKey)}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Jira API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return parseJiraJsonResponse(data);
  } catch (err) {
    console.warn(`Live Jira API failed (${err.message}). Using enterprise Jira sample fallback.`);
    return getSampleJiraData();
  }
}

/**
 * Parses raw JSON response from Jira REST API into standardized raw text evidence
 */
function parseJiraJsonResponse(data) {
  const key = data.key || 'JIRA-ISSUE';
  const fields = data.fields || {};
  const summary = fields.summary || 'Jira Story';
  const reporter = fields.reporter?.displayName || 'Reporter';
  const assignee = fields.assignee?.displayName || 'Assignee';
  const created = fields.created || new Date().toISOString();
  const description = typeof fields.description === 'string' ? fields.description : JSON.stringify(fields.description || '');

  let rawText = `--- PHYSICAL JIRA ISSUE: ${key} ---\n`;
  rawText += `Project: ${fields.project?.name || 'Core'} | Type: ${fields.issuetype?.name || 'Story'} | Priority: ${fields.priority?.name || 'Medium'}\n`;
  rawText += `Reporter: ${reporter} | Assignee: ${assignee} | Created: ${created}\n\n`;

  rawText += `--- Logical Email LOGICAL-EMAIL-001 ---\n`;
  rawText += `From: ${reporter}\nDate: ${created}\nSubject: ${key}: ${summary}\nRole: Reporter\n\n`;
  rawText += `${description}\n\n`;

  const comments = fields.comment?.comments || [];
  comments.forEach((c, idx) => {
    const commentAuthor = c.author?.displayName || 'Team Member';
    const commentDate = c.created || created;
    const commentBody = typeof c.body === 'string' ? c.body : JSON.stringify(c.body || '');
    const blockNum = String(idx + 2).padStart(3, '0');

    rawText += `--- Logical Email LOGICAL-EMAIL-${blockNum} ---\n`;
    rawText += `From: ${commentAuthor}\nDate: ${commentDate}\nSubject: Re: ${key} Discussion\nRole: Stakeholder\n\n`;
    rawText += `${commentBody}\n\n`;
  });

  return {
    connectorMode: 'JIRA',
    sourceThreadId: `JIRA-${key}`,
    realMessageId: `jira-${key.toLowerCase()}`,
    rawText: rawText
  };
}

/**
 * Parse an uploaded Jira file (.json, .xml, .txt, .md, .csv)
 */
function parseJiraFile(fileContent, filename = 'jira_issue.txt') {
  const isJson = filename.endsWith('.json') || (fileContent.trim().startsWith('{') && fileContent.trim().endsWith('}'));
  
  if (isJson) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.fields || parsed.key) {
        return parseJiraJsonResponse(parsed);
      }
    } catch (e) {
      // Fall through to text parsing
    }
  }

  // Format as JIRA connector mode
  const issueKeyMatch = filename.match(/([A-Z]+-\d+)/i) || fileContent.match(/([A-Z]{2,10}-\d+)/);
  const issueKey = issueKeyMatch ? issueKeyMatch[1].toUpperCase() : 'JIRA-DOC-001';

  let formattedText = fileContent;
  if (!fileContent.includes('--- Logical Email') && !fileContent.includes('LOGICAL-EMAIL-')) {
    formattedText = `--- PHYSICAL JIRA ISSUE: ${issueKey} ---\nSource File: ${filename}\n\n--- Logical Email LOGICAL-EMAIL-001 ---\nFrom: Jira Import\nDate: ${new Date().toISOString()}\nSubject: ${issueKey} Ingestion\nRole: Specification Author\n\n${fileContent}`;
  }

  return {
    connectorMode: 'JIRA',
    sourceThreadId: `JIRA-${issueKey}`,
    realMessageId: `jira-${issueKey.toLowerCase()}-${Date.now().toString(36)}`,
    rawText: formattedText
  };
}

module.exports = {
  fetchJiraIssue,
  getSampleJiraData,
  parseJiraJsonResponse,
  parseJiraFile
};
