const { google } = require('googleapis');
const config = require('../config');
const { decrypt, encrypt } = require('../crypto/encryption');
const db = require('../db/database');

function getOAuthClient() {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
}

function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  const scopes = [
    config.GOOGLE_GMAIL_SCOPE,
    config.GOOGLE_MEET_SCOPE,
    'openid',
    'email',
    'profile'
  ];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    include_granted_scopes: true
  });
}

async function fetchGmailThread(userId = 'default_user') {
  const tokenRow = db.prepare('SELECT * FROM encrypted_oauth_tokens WHERE user_id = ?').get(userId);
  if (!tokenRow) {
    throw new Error('No OAuth tokens found for user. Please sign in with Google first.');
  }

  let tokenData;
  try {
    const decryptedRaw = decrypt(tokenRow.access_token, tokenRow.iv, tokenRow.tag);
    if (!decryptedRaw) {
      throw new Error('Invalid token ciphertext.');
    }
    // Check if it's serialized JSON or plain string
    if (decryptedRaw.startsWith('{')) {
      tokenData = JSON.parse(decryptedRaw);
    } else {
      tokenData = { access_token: decryptedRaw, refresh_token: null };
    }
  } catch (err) {
    db.prepare('DELETE FROM encrypted_oauth_tokens WHERE user_id = ?').run(userId);
    throw new Error('OAuth token decryption failed. Please click Gmail OAuth to sign in again.');
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || undefined
  });

  // Listen for auto-refreshed tokens and persist safely
  oauth2Client.on('tokens', (tokens) => {
    try {
      const updatedPayload = JSON.stringify({
        access_token: tokens.access_token || tokenData.access_token,
        refresh_token: tokens.refresh_token || tokenData.refresh_token,
        expiry_date: tokens.expiry_date || tokenData.expiry_date,
        scope: tokens.scope || tokenData.scope
      });
      const enc = encrypt(updatedPayload);
      db.prepare(`
        UPDATE encrypted_oauth_tokens
        SET access_token = ?, iv = ?, tag = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(enc.encryptedText, enc.iv, enc.tag, tokens.expiry_date || 0, userId);
    } catch (e) {
      console.warn('Failed to save refreshed token:', e);
    }
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
  let res;
  // Broad search query matching both label and email contents
  const searchQuery = `${config.GMAIL_POLL_LABEL} OR label:frugalforge-candidate OR label:FrugalForge-Candidate OR "frugalforge-candidate" OR "FrugalForge-Candidate"`;
  
  try {
    res = await gmail.users.threads.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 10
    });
  } catch (err) {
    const isAuthError =
      err.code === 401 ||
      err.status === 401 ||
      err.code === 403 ||
      err.status === 403 ||
      (err.message && (
        err.message.includes('Invalid Credentials') ||
        err.message.includes('Insufficient Permission') ||
        err.message.includes('insufficient_scope') ||
        err.message.includes('invalid_grant')
      ));

    if (isAuthError) {
      db.prepare('DELETE FROM encrypted_oauth_tokens WHERE user_id = ?').run(userId);
      throw new Error('OAuth token expired or lacks Gmail read permissions. Please click Gmail OAuth to sign in and grant the Gmail permission checkbox.');
    }
    throw err;
  }

  const threads = res.data.threads || [];
  if (threads.length === 0) {
    throw new Error(`No threads found matching "${config.GMAIL_POLL_LABEL}" or "frugalforge-candidate" in your Gmail inbox.`);
  }

  const firstThread = await gmail.users.threads.get({
    userId: 'me',
    id: threads[0].id
  });

  const threadData = firstThread.data;
  let fullBodyText = '';

  (threadData.messages || []).forEach(msg => {
    const payload = msg.payload || {};
    let bodyData = '';
    if (payload.body && payload.body.data) {
      bodyData = Buffer.from(payload.body.data, 'base64').toString('utf8');
    } else if (payload.parts) {
      const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body && textPart.body.data) {
        bodyData = Buffer.from(textPart.body.data, 'base64').toString('utf8');
      } else if (payload.parts[0] && payload.parts[0].body && payload.parts[0].body.data) {
        bodyData = Buffer.from(payload.parts[0].body.data, 'base64').toString('utf8');
      }
    }
    if (!bodyData && msg.snippet) {
      bodyData = msg.snippet;
    }

    // Extract headers (From, Date, Subject)
    const headers = payload.headers || [];
    const fromHeader = (headers.find(h => h.name.toLowerCase() === 'from') || {}).value || 'Unknown Sender';
    const dateHeader = (headers.find(h => h.name.toLowerCase() === 'date') || {}).value || new Date().toISOString();
    const subjectHeader = (headers.find(h => h.name.toLowerCase() === 'subject') || {}).value || '';

    fullBodyText += `--- LOGICAL EMAIL MESSAGE: ${msg.id} ---\nFrom: ${fromHeader}\nDate: ${dateHeader}\nSubject: ${subjectHeader}\n\n${bodyData}\n\n`;
  });

  return {
    connectorMode: 'GMAIL',
    sourceThreadId: threadData.id,
    realMessageId: threadData.messages && threadData.messages[0] ? threadData.messages[0].id : '1904a1f87b2e9c10',
    rawText: fullBodyText
  };
}

module.exports = {
  getAuthUrl,
  getOAuthClient,
  fetchGmailThread
};
