/**
 * Pre-built Sample Data Loader
 * Provides an authentic, full-featured enterprise email thread with 1 physical message,
 * 10 embedded simulated logical emails, and 1 trailing test summary section.
 */

function getSampleData() {
  const sourceThreadId = 'THREAD-GMAIL-ENTERPRISE-8821';
  const realMessageId = '1904a1f87b2e9c10';

  const rawText = `Subject: FrugalForge Candidate: Enterprise Loan & Claims Instant Approval Engine Requirements

--- Logical Email LOGICAL-EMAIL-001 ---
From: Prakash Sharma (Product Owner) <prakash.sharma@frugalforge.internal>
Date: 2026-07-28T09:15:00Z
Role: Product Owner
Subject: Kickoff: Instant Claims & Loan Disbursement Engine

Hi Team,

We are launching the automated instant claims disbursement initiative to eliminate manual review friction.
Currently, customers wait 2-3 days for claim approvals, causing a 24% drop-off in customer satisfaction.
Our primary objective is to achieve instant automated approvals for eligible claims under target thresholds by 1 October 2026.
What is the acceptable system latency for instant risk scoring during peak traffic?

Regards,
Prakash

--- Logical Email LOGICAL-EMAIL-002 ---
From: Vikramaditya Verma (Solution Architect) <vikram.verma@frugalforge.internal>
Date: 2026-07-28T10:30:00Z
Role: Solution Architect
Subject: RE: Kickoff: Instant Claims & Loan Disbursement Engine

Hi Prakash,

To answer your question on system performance: the risk scoring engine API must maintain a 99.9% uptime SLA with sub-200ms response latency.
The architecture will rely on OAuth 2.0 with AES-256 encrypted access tokens for microservice authentication.
All customer transaction payloads must be encrypted at rest using TLS 1.3 in transit.

Thanks,
Vikram

--- Logical Email LOGICAL-EMAIL-003 ---
From: Rahul Mehta (Customer Service Manager) <rahul.mehta@frugalforge.internal>
Date: 2026-07-28T11:45:00Z
Role: Customer Service Manager
Subject: RE: Kickoff: Instant Claims & Loan Disbursement Engine

Hello All,

From a customer support perspective, users must receive an instant SMS and in-app UI modal confirmation upon claim approval.
If a claim is flagged for manual review, customer service agents require a dedicated queue view in the dashboard within 5 seconds.
Customer Rahul Mehta reported account reference ACC-994821-X having delays on the legacy portal.

Regards,
Rahul

--- Logical Email LOGICAL-EMAIL-004 ---
From: Ananya Deshmukh (Fraud & Risk Manager) <ananya.deshmukh@frugalforge.internal>
Date: 2026-07-28T14:00:00Z
Role: Fraud & Risk Manager
Subject: Initial Risk Controls & Threshold Rules

Hi Team,

We initially propose that all instant claims with a value up to ₹2,000 will be auto-approved without human intervention.
Any transaction exceeding ₹2,000 must be flagged for manual supervisor verification.
Is there any fraud exposure if we auto-approve first-time users without historical transaction records?

Thanks,
Ananya

--- Logical Email LOGICAL-EMAIL-005 ---
From: Neha Kulkarni (Compliance Officer) <neha.kulkarni@frugalforge.internal>
Date: 2026-07-28T15:30:00Z
Role: Compliance Officer
Subject: Regulatory & Auditability Requirements

Hi Ananya,

Regarding automated risk scoring: all AI risk decisions must be explainable and auditable under regulatory guidelines.
The system must generate an immutable audit log entry containing SHA-256 evidence hashes for every decision.
Do we store customer email addresses such as user.support@external-partner.com in audit traces?

Regards,
Neha

--- Logical Email LOGICAL-EMAIL-006 ---
From: Vikramaditya Verma (Solution Architect) <vikram.verma@frugalforge.internal>
Date: 2026-07-29T09:00:00Z
Role: Solution Architect
Subject: API Integration & System Dependencies

Hi Neha,

To address your query: no raw PII email addresses will be logged in cleartext audit records; PII scanner rules will mask sensitive fields.
The core engine depends on the Core Banking Ledger API for real-time fund transfers.
We will implement asynchronous webhook retry handlers to handle banking ledger timeouts gracefully.

Thanks,
Vikram

--- Logical Email LOGICAL-EMAIL-007 ---
From: Ananya Deshmukh (Fraud & Risk Manager) <ananya.deshmukh@frugalforge.internal>
Date: 2026-07-29T11:20:00Z
Role: Fraud & Risk Manager
Subject: Revised Financial Threshold Decision

Hi Team,

After reviewing risk model simulations with executive leadership, we have revised the threshold.
We decided that the auto-approval threshold for low-risk verified customers is increased to ₹5,000.
The previous ₹2,000 limit is superseded by this new ₹5,000 threshold decision.

Regards,
Ananya

--- Logical Email LOGICAL-EMAIL-008 ---
From: Suresh Nair (Supervisor) <suresh.nair@frugalforge.internal>
Date: 2026-07-29T13:45:00Z
Role: Supervisor
Subject: Operations & Staffing Constraints

Hi All,

From an operations viewpoint, supervisor queues must limit concurrent pending items to 50 items per reviewer.
Action Item: Suresh will configure the role-based access matrix for regional supervisor teams by next Friday.

Thanks,
Suresh

--- Logical Email LOGICAL-EMAIL-009 ---
From: Prakash Sharma (Product Owner) <prakash.sharma@frugalforge.internal>
Date: 2026-07-29T15:10:00Z
Role: Product Owner
Subject: UX & Frontend Specifications

Hi Team,

The frontend dual-pane review dashboard must render line-numbered evidence on the left and 22 enterprise categories on the right.
Users must be able to confirm, reject, or edit individual extracted statements before final export.

Regards,
Prakash

--- Logical Email LOGICAL-EMAIL-010 ---
From: Neha Kulkarni (Compliance Officer) <neha.kulkarni@frugalforge.internal>
Date: 2026-07-29T16:30:00Z
Role: Compliance Officer
Subject: Final Governance Alignment

Hi Team,

We confirm that all REST APIs and exported Candidate Signal Markdown files must include data sensitivity tags.
Go-live remains strictly locked for deployment by 1 October 2026.

Regards,
Neha

Expected Requirement Signals for Layer 0 Extraction
--------------------------------------------------
[TEST SUMMARY — EXCLUDED FROM EXTRACTION]
This trailing section contains the expected validation answer key for unit tests.
- Physical Message Count: 1
- Logical Email Count: 10
- Primary Categories Expected: BUSINESS_PROBLEM, BUSINESS_OBJECTIVE, DEADLINE, NFR, SECURITY_REQUIREMENT, UX_REQUIREMENT, BUSINESS_RULE, COMPLIANCE_REQUIREMENT, OPEN_QUESTION, ACTION_ITEM.
- Exclude this section from primary signal extraction.
`;

  return {
    connectorMode: 'SAMPLE_DATA',
    sourceThreadId: sourceThreadId,
    realMessageId: realMessageId,
    rawText: rawText
  };
}

module.exports = {
  getSampleData
};
