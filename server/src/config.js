const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Allow outgoing HTTPS calls through corporate proxy / self-signed local certs in dev
if (process.env.NODE_ENV !== 'production' && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const serverPort = parseInt(process.env.PORT || '7071', 10);
const clientPort = parseInt(process.env.CLIENT_PORT || '7070', 10);
const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${serverPort}`;
const clientOrigin = process.env.CLIENT_ORIGIN || `http://localhost:${clientPort}`;

const corsOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : [clientOrigin, `http://localhost:${clientPort}`, `http://127.0.0.1:${clientPort}`];

const dbPath = process.env.DB_PATH
  ? (path.isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : path.join(__dirname, '../', process.env.DB_PATH))
  : path.join(__dirname, '../../data/signal_intake.db');

module.exports = {
  // Server & Client Network Config
  PORT: serverPort,
  CLIENT_PORT: clientPort,
  SERVER_BASE_URL: serverBaseUrl,
  CLIENT_ORIGIN: clientOrigin,
  CORS_ALLOWED_ORIGINS: corsOrigins,

  // Security & Encryption
  TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY || 'default-secret-encryption-key-32b-long!!',
  SESSION_SECRET: process.env.SESSION_SECRET || 'frugalforge-session-secret-key-2026',

  // Google OAuth 2.0 Credentials & Scopes
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || `${serverBaseUrl}/api/auth/google/callback`,
  GOOGLE_GMAIL_SCOPE: process.env.GOOGLE_GMAIL_SCOPE || 'https://www.googleapis.com/auth/gmail.readonly',
  GOOGLE_MEET_SCOPE: process.env.GOOGLE_MEET_SCOPE || 'https://www.googleapis.com/auth/meetings.space.readonly',
  GMAIL_POLL_LABEL: process.env.GMAIL_POLL_LABEL || 'label:FrugalForge-Candidate',

  // Slack Integration
  SLACK_API_BASE_URL: process.env.SLACK_API_BASE_URL || 'https://slack.com/api',
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || '',
  SLACK_USER_TOKEN: process.env.SLACK_USER_TOKEN || '',

  // Jira REST API Integration
  JIRA_HOST: process.env.JIRA_HOST || '',
  JIRA_EMAIL: process.env.JIRA_EMAIL || '',
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN || '',

  // Confluence REST API Integration
  CONFLUENCE_HOST: process.env.CONFLUENCE_HOST || '',
  CONFLUENCE_EMAIL: process.env.CONFLUENCE_EMAIL || '',
  CONFLUENCE_API_TOKEN: process.env.CONFLUENCE_API_TOKEN || '',

  // FrugalForge Integration
  FRUGALFORGE_API_URL: process.env.FRUGALFORGE_API_URL || 'http://localhost:7001',
  FRUGALFORGE_IMPORT_ENDPOINT: process.env.FRUGALFORGE_IMPORT_ENDPOINT || '/api/layer0/signals/import',
  FRUGALFORGE_SIGNAL_API_TOKEN: process.env.FRUGALFORGE_SIGNAL_API_TOKEN || 'frugalforge-signal-poc-bearer-token-2026',
  FRUGALFORGE_SOURCE_ID: process.env.FRUGALFORGE_SOURCE_ID || 'GoogleEnterpriseSignalPOC',

  // Database Path
  DB_PATH: dbPath
};
