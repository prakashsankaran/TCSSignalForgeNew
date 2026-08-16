# ⚡ SignalForge

> **High-Precision Multi-Channel Enterprise Discovery & Signal Intake Engine**  
> *Transform unstructured communication across Gmail, Slack, Jira, Confluence, and Google Meet into structured, governed Enterprise Requirement Signals.*

---

## 🌟 Overview

**SignalForge** is an enterprise-grade ingestion and requirement classification platform designed to capture candidate signals across distributed enterprise communication channels. It provides:

- **Multi-Connector Autonomous Listener**: Continuous monitoring and ingestion across **Gmail OAuth 2.0**, **Slack Webhooks**, **Jira REST API**, **Confluence PRDs/RFCs**, and **Google Meet Transcripts**.
- **High-Precision Noise Filtering**: Strips boilerplate, email signatures, greetings, and ticket metadata, isolating actionable statements.
- **22 Enterprise Signal Classifications**: Categorizes requirements into `BUSINESS_PROBLEM`, `BUSINESS_RULE`, `DECISION`, `ACTION_ITEM`, `NFR`, `SECURITY_REQUIREMENT`, `COMPLIANCE_REQUIREMENT`, `DEADLINE`, `OPEN_QUESTION`, etc.
- **Cryptographic Provenance**: Deterministic SHA-256 raw evidence hashing and AES-256-GCM token encryption.
- **Dual-Pane Governance & Review Workspace**: Line-level source citations and human-in-the-loop review gate prior to downstream export.
- **Zero-Hallucination Export**: Canonical `SignalEnvelope.json` and governed `Candidate_Signal.md` handoff.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 2. Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
*Backend runs on `http://localhost:7071`.*

### 3. Frontend Setup
```bash
cd ../client
cp .env.example .env
npm install
npm run dev
```
*Frontend runs on `http://localhost:7070`.*

---

## 🛡️ Security & Environment Configuration

Copy `.env.example` in both `server/` and `client/` and configure your credentials:

```env
# Server Network Settings
PORT=7071
SERVER_BASE_URL=http://localhost:7071
CLIENT_PORT=7070
CLIENT_ORIGIN=http://localhost:7070

# Security & Encryption Keys
TOKEN_ENCRYPTION_KEY=your-32-byte-aes256gcm-secret-key-here!!
SESSION_SECRET=your-session-secret-key-here

# Connectors (Optional / Configurable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SLACK_BOT_TOKEN=
JIRA_HOST=
JIRA_EMAIL=
JIRA_API_TOKEN=
CONFLUENCE_HOST=
CONFLUENCE_EMAIL=
CONFLUENCE_API_TOKEN=
```

---

## 🧪 Testing

Run the full automated test suite (31 Unit & Integration Tests):
```bash
cd server
npm test
```

Build the frontend client:
```bash
cd ../client
npm run build
```

---

## 📜 License
Private & Confidential — Built for Enterprise Signal Discovery.
