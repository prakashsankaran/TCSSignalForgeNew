/**
 * Confluence Integration Connector
 * Ingests Confluence PRDs, Architecture Decision Records (ADR), RFC Specifications, and Requirements Pages.
 * Supports live Confluence Cloud/Server REST API v2, document uploads (.md, .txt, .html, .json), and enterprise sample data.
 */

const config = require('../config');

// Allow local HTTPS fetch in corporate proxy environments
if (process.env.NODE_ENV !== 'production' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Pre-built Enterprise Candidate Confluence Architecture RFC & PRD Specification (CONFLUENCE)
 */
function getSampleConfluenceData() {
  const pageId = 'CONF-ARCH-882';
  const rawConfluenceText = `--- PHYSICAL CONFLUENCE DOCUMENT: ${pageId} ---
Space: CORE-ARCHITECTURE (Enterprise Core Architecture) | Page Title: Instant Settlement & Automated Risk Engine RFC
Document Status: APPROVED | Version: v3.2 | Author: Ananya Deshmukh (Principal Architect)
Last Modified: 2026-08-10T11:20:00Z | Contributors: Vikramaditya Verma, Neha Kulkarni, Maya Sundaram

--- Logical Email LOGICAL-EMAIL-001 ---
From: Ananya Deshmukh (Principal Architect)
Date: 2026-08-10T11:20:00Z
Subject: 1. Executive Summary & Problem Statement
Role: Enterprise Architect

1. Executive Summary & Problem Statement:
Our legacy settlement subsystem currently incurs a 24-48 hour settlement delay across inter-bank disbursement channels, resulting in high customer churn and ₹12M annual operational overhead.
The strategic objective is to design a high-throughput Instant Settlement Engine that validates and processes transactions in real time.

--- Logical Email LOGICAL-EMAIL-002 ---
From: Ananya Deshmukh (Principal Architect)
Date: 2026-08-10T11:35:00Z
Subject: 2. Architecture Decisions & System Invariants
Role: Enterprise Architect

2. Architecture Decisions & System Invariants:
ADR-01: We decided that all inter-service messaging will utilize Kafka partitioned topics with at-least-once delivery guarantees.
ADR-02: Microservices must maintain end-to-end P99 response latency under 150ms during peak 1,000 QPS load.
All sensitive account identifiers such as ACC-482910-Z must be masked and encrypted with AES-256-GCM before writing to distributed datastores.

--- Logical Email LOGICAL-EMAIL-003 ---
From: Maya Sundaram (Product Owner)
Date: 2026-08-10T14:10:00Z
Subject: 3. Business Rules & Financial Thresholds
Role: Product Owner

3. Business Rules & Financial Limits:
Rule 1: If transaction value is less than or equal to ₹10,000 and risk score is below 15, the system must auto-approve immediate settlement.
Rule 2: Any single transaction exceeding ₹50,000 must mandate multi-signature approval from two senior authorized supervisors.
Mandatory constraint: System deployment and general availability are strictly locked for go-live before 1 October 2026.

--- Logical Email LOGICAL-EMAIL-004 ---
From: Neha Kulkarni (Compliance Officer)
Date: 2026-08-10T15:45:00Z
Subject: 4. Regulatory Compliance & Governance
Role: Compliance Officer

4. Regulatory Compliance & Governance:
Every credit evaluation model output must provide explainable AI reasoning metrics for statutory RBI auditability.
Question: Do we need to maintain cryptographic payload hashes in our regulatory reporting tables for 7 years?

--- Logical Email LOGICAL-EMAIL-005 ---
From: Ananya Deshmukh (Principal Architect)
Date: 2026-08-10T16:50:00Z
Subject: 5. RFC Resolution & External Dependencies
Role: Enterprise Architect

5. RFC Resolution & External Dependencies:
To answer Neha's question: yes, all cryptographic SHA-256 payload hashes will be retained in immutable WORM storage for 7 years.
System Dependency: The Instant Settlement Engine depends on the National Payments Gateway API v3 release.
Blocker: Verification of sandbox mTLS certificates from partner banks is required prior to load testing.

Expected Requirement Signals for Layer 0 Extraction
--------------------------------------------------
[TEST SUMMARY — EXCLUDED FROM EXTRACTION]
- Source Type: Confluence Architecture RFC Document
- Primary Categories: BUSINESS_PROBLEM, BUSINESS_OBJECTIVE, DECISION, NFR, BUSINESS_RULE, DEADLINE, COMPLIANCE_REQUIREMENT, OPEN_QUESTION, DEPENDENCY
`;

  return {
    connectorMode: 'CONFLUENCE',
    sourceThreadId: `CONF-${pageId}`,
    realMessageId: `conf-${pageId.toLowerCase()}-1904a`,
    rawText: rawConfluenceText
  };
}

/**
 * Fetch Confluence page using Confluence REST API (or fallback to sample data)
 */
async function fetchConfluencePage(pageId = 'CONF-ARCH-882') {
  const confHost = config.CONFLUENCE_HOST || process.env.CONFLUENCE_HOST;
  const confToken = config.CONFLUENCE_API_TOKEN || process.env.CONFLUENCE_API_TOKEN;
  const confEmail = config.CONFLUENCE_EMAIL || process.env.CONFLUENCE_EMAIL;

  if (!confHost || !confToken || !confEmail) {
    return getSampleConfluenceData();
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${confEmail}:${confToken}`).toString('base64');
    const url = `https://${confHost.replace(/^https?:\/\//, '')}/wiki/rest/api/content/${encodeURIComponent(pageId)}?expand=body.storage,version,space`;

    const res = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Confluence API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return parseConfluenceJsonResponse(data);
  } catch (err) {
    console.warn(`Live Confluence API failed (${err.message}). Using enterprise Confluence sample fallback.`);
    return getSampleConfluenceData();
  }
}

/**
 * Parses raw JSON response from Confluence REST API into standardized raw text evidence
 */
function parseConfluenceJsonResponse(data) {
  const id = data.id || 'CONF-PAGE';
  const title = data.title || 'Architecture Specification';
  const space = data.space?.name || data.space?.key || 'Engineering';
  const version = data.version?.number || '1';
  const author = data.version?.by?.displayName || 'Architect';
  const date = data.version?.when || new Date().toISOString();
  let bodyHtml = data.body?.storage?.value || '';

  // Clean HTML tags to text while preserving section structure
  const cleanBody = bodyHtml
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]+>/g, '');

  let rawText = `--- PHYSICAL CONFLUENCE DOCUMENT: ${id} ---\n`;
  rawText += `Space: ${space} | Page Title: ${title}\n`;
  rawText += `Version: v${version} | Author: ${author} | Date: ${date}\n\n`;

  rawText += `--- Logical Email LOGICAL-EMAIL-001 ---\n`;
  rawText += `From: ${author}\nDate: ${date}\nSubject: ${title}\nRole: Author\n\n`;
  rawText += `${cleanBody}\n`;

  return {
    connectorMode: 'CONFLUENCE',
    sourceThreadId: `CONF-${id}`,
    realMessageId: `conf-${id.toLowerCase()}`,
    rawText: rawText
  };
}

/**
 * Parse an uploaded Confluence file (.md, .txt, .html, .json, .doc)
 */
function parseConfluenceFile(fileContent, filename = 'confluence_prd.md') {
  const isJson = filename.endsWith('.json') || (fileContent.trim().startsWith('{') && fileContent.trim().endsWith('}'));

  if (isJson) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.body || parsed.title) {
        return parseConfluenceJsonResponse(parsed);
      }
    } catch (e) {
      // Fall through to text parsing
    }
  }

  const titleMatch = fileContent.match(/#\s+(.+)/) || fileContent.match(/Page Title:\s*(.+)/i);
  const docTitle = titleMatch ? titleMatch[1].trim() : filename.replace(/\.[^/.]+$/, '');
  const docId = `CONF-${docTitle.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}`;

  let formattedText = fileContent;
  if (!fileContent.includes('--- Logical Email') && !fileContent.includes('LOGICAL-EMAIL-')) {
    formattedText = `--- PHYSICAL CONFLUENCE DOCUMENT: ${docId} ---\nSpace: Document Ingestion | Page Title: ${docTitle}\nSource File: ${filename}\n\n--- Logical Email LOGICAL-EMAIL-001 ---\nFrom: Confluence Import\nDate: ${new Date().toISOString()}\nSubject: ${docTitle}\nRole: Specification Author\n\n${fileContent}`;
  }

  return {
    connectorMode: 'CONFLUENCE',
    sourceThreadId: docId,
    realMessageId: `conf-${docId.toLowerCase()}-${Date.now().toString(36)}`,
    rawText: formattedText
  };
}

module.exports = {
  fetchConfluencePage,
  getSampleConfluenceData,
  parseConfluenceJsonResponse,
  parseConfluenceFile
};
