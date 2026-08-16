/**
 * Autonomous Gmail Background Polling Listener
 * Continuously listens for incoming Gmail threads matching label:FrugalForge-Candidate,
 * normalizes new threads into SignalEnvelopes, and persists them to SQLite DB.
 */

const { fetchGmailThread } = require('../ingestion/gmailConnector');
const { processRawEvidence } = require('../services/signalService');
const { sha256Hash } = require('../crypto/encryption');
const db = require('../db/database');
const config = require('../config');

let pollerInterval = null;
let isPolling = false;
let pollFrequencyMs = 30000; // 30 seconds default
let lastPollTime = null;
let lastPollStatus = 'Idle';
let newIngestedCount = 0;

async function executePollCycle() {
  lastPollTime = new Date().toISOString();
  try {
    lastPollStatus = 'Polling Gmail...';
    // Check if OAuth tokens exist
    const tokenRow = db.prepare('SELECT * FROM encrypted_oauth_tokens WHERE user_id = ?').get('default_user');
    if (!tokenRow) {
      lastPollStatus = 'Waiting for Google OAuth Login';
      return;
    }

    const gmailInput = await fetchGmailThread('default_user');
    const contentHash = sha256Hash(gmailInput.rawText);

    // Check if thread with this content hash already exists in DB
    const existing = db.prepare('SELECT envelope_id FROM signal_envelopes WHERE content_hash = ?').get(contentHash);
    if (!existing) {
      const envelope = processRawEvidence(gmailInput);
      newIngestedCount++;
      lastPollStatus = `Ingested candidate thread ${envelope.envelopeId}`;
      console.log(`[Autonomous Listener] Ingested new thread: ${envelope.envelopeId}`);
    } else {
      lastPollStatus = `Active (Up to date, hash ${contentHash.slice(0, 8)}...)`;
    }
  } catch (err) {
    if (err.message.includes('No threads found')) {
      lastPollStatus = `Listening (No new threads matching ${config.GMAIL_POLL_LABEL})`;
    } else {
      lastPollStatus = `Listening (Error: ${err.message})`;
    }
  }
}

function startPoller(frequencyMs = 30000) {
  if (isPolling) return;
  pollFrequencyMs = frequencyMs;
  isPolling = true;
  lastPollStatus = 'Autonomous Listener Started';
  
  // Execute first poll immediately
  executePollCycle();

  pollerInterval = setInterval(executePollCycle, pollFrequencyMs);
}

function stopPoller() {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
  isPolling = false;
  lastPollStatus = 'Listener Stopped';
}

function getPollerStatus() {
  return {
    isPolling,
    pollFrequencyMs,
    lastPollTime,
    lastPollStatus,
    newIngestedCount
  };
}

module.exports = {
  startPoller,
  stopPoller,
  getPollerStatus,
  executePollCycle
};
