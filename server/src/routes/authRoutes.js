const express = require('express');
const router = express.Router();
const { getAuthUrl, getOAuthClient } = require('../ingestion/gmailConnector');
const { encrypt } = require('../crypto/encryption');
const db = require('../db/database');
const config = require('../config');

// Get Google OAuth 2.0 Login URL
router.get('/google/url', (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OAuth Callback Redirect Handler
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Encrypt the complete token object payload with 1 IV and 1 Tag
    const tokenPayloadStr = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expiry_date: tokens.expiry_date || 0,
      scope: tokens.scope || ''
    });

    const encrypted = encrypt(tokenPayloadStr);

    const stmt = db.prepare(`
      INSERT INTO encrypted_oauth_tokens (user_id, access_token, refresh_token, expiry_date, iv, tag, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    stmt.run(
      'default_user',
      encrypted.encryptedText,
      tokens.refresh_token ? 'HAS_REFRESH' : 'NO_REFRESH',
      tokens.expiry_date || 0,
      encrypted.iv,
      encrypted.tag,
      now
    );

    res.redirect(`${config.CLIENT_ORIGIN}?auth=success`);
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send(`OAuth Error: ${err.message}`);
  }
});

module.exports = router;
