# Master Prompt: Standalone Local Gmail + Google Meet Enterprise Signal Intake Engine

Paste this exact master prompt into Antigravity on any machine to build and run this application from scratch.

---

```text
You are an expert full-stack engineer and enterprise discovery architect. Build a Standalone Local Gmail + Google Meet Enterprise Signal Intake Proof of Concept (POC) application from scratch.

The system ingests unstructured communication from Gmail threads and Google Meet transcripts (or file upload fallback), normalizes them into a canonical SignalEnvelope model with immutable raw evidence preservation, extracts structured enterprise discovery findings using a deterministic rules engine (or local Ollama LLM), presents a rich dual-pane human review interface, and exports governed Candidate Enterprise Signals as SignalEnvelope.json and Candidate_Signal.md.

================================================================================
1. TECHNOLOGY STACK & PROJECT STRUCTURE
================================================================================
- Repository Root: Initialize backend and frontend in a single project repository.
- Backend: Node.js + Express (Port 7071)
  - SQLite database using `better-sqlite3` in WAL mode at `data/signal_intake.db`.
  - Cryptography: Node crypto module for AES-256-GCM OAuth token encryption and SHA-256 raw text content hashing.
  - Validation: Zod schemas for Canonical SignalEnvelope validation.
  - Security: Helmet, CORS (allowing `http://localhost:7070`), express-session.
- Frontend: React + Vite + Vanilla Tailwind CSS (Port 7070)
  - Dark mode enterprise UI palette (slate/indigo/emerald/rose styling).
  - Lucide React icons (`lucide-react`).

================================================================================
2. GOOGLE OAUTH 2.0 & API CONNECTORS
================================================================================
- Auth Flow: Server-side Google OAuth 2.0 authorization code flow.
  - OAuth Scopes:
    - https://www.googleapis.com/auth/gmail.readonly
    - https://www.googleapis.com/auth/meetings.space.readonly
    - openid
    - email
    - profile
  - Redirect URI: http://localhost:7071/api/auth/google/callback
- Token Storage: Encrypt OAuth tokens using AES-256-GCM with a 32-byte key derived via SHA-256 from `TOKEN_ENCRYPTION_KEY`. Store in SQLite table `encrypted_oauth_tokens`.
- Gmail API Ingestion:
  - Fetch user threads filtered by label `FrugalForge-Candidate` (or search query `label:FrugalForge-Candidate`).
  - Import raw message bodies, headers, dates, and senders.
- Google Meet REST API Ingestion & Fallback:
  - Attempt live Google Meet REST API conference records and transcripts fetch.
  - Provide a File Upload Fallback (`FILE_BACKED`) accepting `.vtt`, `.srt`, `.txt`, and `.json` transcript files.
  - Provide a Pre-built Sample Data Loader (`SAMPLE_DATA`) to test instant ingestion without OAuth.

================================================================================
3. PHYSICAL VS. LOGICAL CONVERSATION MODEL (SIMULATED EMAIL THREADS)
================================================================================
- Truthful Source Model:
  - Physical Gmail Evidence: `messageCount: 1`, `sourceThreadId: "<real Gmail thread ID>"`, `GMAIL-MESSAGE-{realMessageId}`. Do not fabricate 10 Gmail message IDs.
  - Logical Conversation Layer: Detect embedded simulated emails in the message body (`LOGICAL-EMAIL-001` through `LOGICAL-EMAIL-010`).
  - Answer-Key Isolation: Detect trailing section `Expected Requirement Signals for Layer 0 Extraction` as `SUMMARY_SECTION` with `excludeFromPrimaryExtraction: true`.
  - Compound Source Citations: Use `GMAIL-MESSAGE-{realId}#LOGICAL-EMAIL-004#SENTENCE-003` for line-level traceability.
  - Truthful UI Metadata: Show `Physical Messages: 1`, `Logical Emails: 10`, `Summary Sections: 1`, `conversationStructure: EMBEDDED_SIMULATED_THREAD` with an informational note banner.

================================================================================
4. ATOMIC SEGMENTATION & NOISE STRIPPING
================================================================================
- Process logical blocks into `AtomicSourceUnit` objects.
- Strip noise into non-extraction units (`eligibleForExtraction: false`):
  - Greetings (`Hi Team`, `Hi Prakash`, `Hello All`)
  - Closings/Signatures (`Regards`, `Thanks`, `Ananya`)
  - Separators (`---`, `___`, `===`)
  - Metadata header lines (`From:`, `To:`, `Date:`, `Subject:`, `Role:`)

================================================================================
5. 22 ENTERPRISE SIGNAL CATEGORIES & EXTRACTION QUALITY
================================================================================
- Support 22 Enterprise Categories:
  `BUSINESS_PROBLEM`, `BUSINESS_OBJECTIVE`, `REQUEST`, `OBLIGATION`, `PROPOSED_SOLUTION`, `BUSINESS_RULE`, `DECISION`, `ACTION_ITEM`, `RISK`, `CONSTRAINT`, `DEPENDENCY`, `INTEGRATION`, `NFR`, `SECURITY_REQUIREMENT`, `COMPLIANCE_REQUIREMENT`, `UX_REQUIREMENT`, `DEADLINE`, `MEASURABLE_IMPACT`, `OPEN_QUESTION`, `ASSUMPTION`, `CONFLICT`, `STAKEHOLDER_VIEWPOINT`.
- Enforce 1 Primary Category per statement with secondary tags (e.g. `primaryCategory: BUSINESS_RULE`, `secondaryTags: ["DECISION", "RISK_CONTROL"]`).
- Correct Classification Errors:
  - Questions (`?`) → `OPEN_QUESTION` (never `BUSINESS_PROBLEM`).
  - Historical delays ("wait 2-3 days") → `BUSINESS_PROBLEM` / `MEASURABLE_IMPACT` (never `DECISION`).
  - Explainability ("must be explainable") → `COMPLIANCE_REQUIREMENT` with `AUDITABILITY` tag.
  - Dates ("by 1 October 2026") → `DEADLINE`.

================================================================================
6. TEMPORAL RESOLUTION & QUESTION SUPERSESSION
================================================================================
- Temporal Resolver (`temporalResolver.js`):
  - Tracks relationships: `ANSWERS`, `SUPERSEDES`, `CONFIRMS`, `CONTRADICTS`, `REFINES`, `SUPPORTS`, `IMPLEMENTS`.
  - Question Resolution: Matches open questions against subsequent answers. Updates question status to `RESOLVED` and removes them from unresolved open questions list.
  - Rule Supersession: Evolution of thresholds (e.g. initial ₹2,000 threshold superseded by final ₹5,000 threshold) marks ₹2,000 statement as `SUPERSEDED` and ₹5,000 as `CONFIRMED/CURRENT`.
- Stakeholder Viewpoints: Extracts 6 role-specific viewpoint objects (`Customer Service Manager`, `Product Owner`, `Fraud & Risk Manager`, `Solution Architect`, `Compliance Officer`, `Supervisor`).

================================================================================
7. PII SCANNER & STATEMENT-LEVEL HUMAN REVIEW GATE
================================================================================
- PII Category Scanner (`piiDetector.js`):
  - Detects `containsPotentialPII: true` and populates `piiCategories` (`EMAIL_ADDRESS`, `PERSON_NAME`, `PAYMENT_INFORMATION_REFERENCE`) without logging raw sensitive PII values to audit logs.
- Statement-Level Review Gate (`confirmSignal`):
  - Signal confirmation requires:
    1. Sensitivity classification selected (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`).
    2. Data governance consent checkbox checked.
    3. Reviewer name entered.
    4. At least 1 statement explicitly marked `CONFIRMED` or `EDITED` with a core primary category.

================================================================================
8. DUAL-PANE REVIEW INTERFACE (FRONTEND)
================================================================================
- Left Pane (Raw Evidence Store):
  - Line-numbered view of raw text with SHA-256 content hash badge.
  - Compound citation line highlighting (`GMAIL-MESSAGE-xxx#LOGICAL-EMAIL-yyy#SENTENCE-zzz`).
  - Answer-key badge `TEST SUMMARY — EXCLUDED FROM EXTRACTION`.
- Right Pane (Extracted Context & Governance):
  - 22 Enterprise Category tabs with active deduplicated counts.
  - **Enterprise Summary** tab presenting a consolidated executive summary.
  - Interactive cards with Confirm (check), Reject (X), and Edit (pencil) buttons.
  - Sensitivity selector, PII detection badges, Reviewer name input, Consent checkbox, and Audit notes.
  - Download buttons for `SignalEnvelope.json` and `Candidate_Signal.md`.

================================================================================
9. CANONICAL EXPORTS & HANDOFF
================================================================================
- Export `SignalEnvelope.json` adhering strictly to canonical Zod schema.
- Export `Candidate_Signal.md` separating:
  - Confirmed Enterprise Signals (Handoff Ready)
  - Resolved Questions & Superseded Statements
  - Stakeholder Viewpoints
  - Provenance & Evidence Traceability (SHA-256 hash, parser version, connector mode)

================================================================================
10. AUTOMATED TESTS & VERIFICATION
================================================================================
- Unit/Integration Tests in `server/tests/`:
  - OAuth token encryption/decryption roundtrip & tampering defense.
  - SHA-256 deterministic content hashing & duplicate prevention.
  - Logical block parsing (1 physical message, 10 logical emails, 1 excluded summary).
  - Atomic segmentation & noise stripping.
  - Classification accuracy & temporal resolution.
  - PII scanner & review gate enforcement.
- Verification Commands:
  - Backend tests: `npm test` in `server/` (20/20 passing tests).
  - Frontend build: `npm run build` in `client/` (0 errors).
```

---

Save this file and run `npm test` and `npm run build` to verify total system health.
