const crypto = require('crypto');
const config = require('../config');

// Derive 32-byte key from TOKEN_ENCRYPTION_KEY using SHA-256
function getDerivedKey(passphrase) {
  return crypto.createHash('sha256').update(passphrase || config.TOKEN_ENCRYPTION_KEY).digest();
}

/**
 * Encrypt token/text using AES-256-GCM
 */
function encrypt(text, customKey) {
  if (!text) return null;
  const key = getDerivedKey(customKey);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedText: encrypted,
    iv: iv.toString('hex'),
    tag: tag
  };
}

/**
 * Decrypt token/text using AES-256-GCM with tamper detection
 */
function decrypt(encryptedText, ivHex, tagHex, customKey) {
  if (!encryptedText || !ivHex || !tagHex) return null;
  const key = getDerivedKey(customKey);
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * SHA-256 deterministic hash calculation for raw text evidence
 */
function sha256Hash(text) {
  if (typeof text !== 'string') text = JSON.stringify(text || '');
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

module.exports = {
  encrypt,
  decrypt,
  sha256Hash,
  getDerivedKey
};
