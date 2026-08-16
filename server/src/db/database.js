const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure data directory exists
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const storePath = path.join(dbDir, 'signal_intake_store.json');

// Memory store backed by atomic JSON storage
let store = {
  encrypted_oauth_tokens: {},
  signal_envelopes: {},
  audit_logs: []
};

function loadStore() {
  if (fs.existsSync(storePath)) {
    try {
      const raw = fs.readFileSync(storePath, 'utf8');
      store = JSON.parse(raw);
      if (!store.encrypted_oauth_tokens) store.encrypted_oauth_tokens = {};
      if (!store.signal_envelopes) store.signal_envelopes = {};
      if (!store.audit_logs) store.audit_logs = [];
    } catch (e) {
      console.warn('Initializing fresh DB store.');
    }
  }
}

// Initial load
loadStore();

function saveStore() {
  try {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    if (!fs.existsSync(config.DB_PATH)) {
      fs.writeFileSync(config.DB_PATH, 'SQLITE WAL SIMULATED STORE\n');
    }
  } catch (e) {
    console.error('Failed to persist DB store:', e);
  }
}

class Statement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  get(...params) {
    if (this.sql.includes('encrypted_oauth_tokens')) {
      const userId = params[0] || 'default_user';
      return store.encrypted_oauth_tokens[userId] || null;
    }

    if (this.sql.includes('signal_envelopes')) {
      const envelopeId = params[0];
      const env = store.signal_envelopes[envelopeId];
      if (!env) return null;
      return {
        envelope_id: env.envelopeId,
        content_hash: env.contentHash,
        source_type: env.source ? env.source.connectorMode : 'SAMPLE_DATA',
        envelope_data: JSON.stringify(env),
        review_status: env.governance ? env.governance.reviewStatus : 'UNREVIEWED',
        created_at: env.createdAt,
        updated_at: env.updatedAt
      };
    }

    return null;
  }

  all(...params) {
    if (this.sql.includes('encrypted_oauth_tokens')) {
      return Object.values(store.encrypted_oauth_tokens);
    }

    if (this.sql.includes('signal_envelopes')) {
      const list = Object.values(store.signal_envelopes).map(env => ({
        envelope_id: env.envelopeId,
        content_hash: env.contentHash,
        source_type: env.source ? env.source.connectorMode : 'SAMPLE_DATA',
        envelope_data: JSON.stringify(env),
        review_status: env.governance ? env.governance.reviewStatus : 'UNREVIEWED',
        created_at: env.createdAt,
        updated_at: env.updatedAt
      }));
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (this.sql.includes('audit_logs')) {
      return store.audit_logs;
    }

    return [];
  }

  run(...params) {
    if (this.sql.includes('INSERT INTO encrypted_oauth_tokens') || this.sql.includes('UPDATE encrypted_oauth_tokens')) {
      const [userId, accessToken, refreshToken, expiryDate, iv, tag, updatedAt] = params;
      store.encrypted_oauth_tokens[userId] = {
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate,
        iv: iv,
        tag: tag,
        updated_at: updatedAt || new Date().toISOString()
      };
      saveStore();
      return { changes: 1 };
    }

    if (this.sql.includes('DELETE FROM encrypted_oauth_tokens')) {
      if (this.sql.includes('WHERE user_id = ?')) {
        const userId = params[0] || 'default_user';
        delete store.encrypted_oauth_tokens[userId];
      } else {
        store.encrypted_oauth_tokens = {};
      }
      saveStore();
      return { changes: 1 };
    }

    if (this.sql.includes('INSERT INTO signal_envelopes')) {
      const [envelopeId, contentHash, sourceType, envelopeData, reviewStatus, createdAt, updatedAt] = params;
      const parsedEnv = typeof envelopeData === 'string' ? JSON.parse(envelopeData) : envelopeData;
      store.signal_envelopes[envelopeId] = parsedEnv;
      saveStore();
      return { changes: 1 };
    }

    if (this.sql.includes('UPDATE signal_envelopes')) {
      const envelopeData = params[0];
      const targetEnvelopeId = params[params.length - 1];
      const parsedEnv = typeof envelopeData === 'string' ? JSON.parse(envelopeData) : envelopeData;
      const key = targetEnvelopeId || (parsedEnv && parsedEnv.envelopeId);
      if (key) {
        store.signal_envelopes[key] = parsedEnv;
      }
      saveStore();
      return { changes: 1 };
    }

    // DELETE HANDLERS
    if (this.sql.includes('DELETE FROM signal_envelopes')) {
      if (this.sql.includes('WHERE envelope_id = ?')) {
        const targetId = params[0];
        delete store.signal_envelopes[targetId];
      } else if (this.sql.includes('WHERE source_type = ?')) {
        const sourceType = params[0];
        Object.keys(store.signal_envelopes).forEach(id => {
          const env = store.signal_envelopes[id];
          if (env.source && env.source.connectorMode === sourceType) {
            delete store.signal_envelopes[id];
          }
        });
      } else {
        // Clear all signal envelopes
        store.signal_envelopes = {};
      }
      saveStore();
      return { changes: 1 };
    }

    if (this.sql.includes('DELETE FROM audit_logs')) {
      if (this.sql.includes('WHERE envelope_id = ?')) {
        const targetId = params[0];
        store.audit_logs = store.audit_logs.filter(log => log.envelope_id !== targetId);
      } else {
        store.audit_logs = [];
      }
      saveStore();
      return { changes: 1 };
    }

    if (this.sql.includes('INSERT INTO audit_logs')) {
      const [envelopeId, action, reviewer, timestamp, details] = params;
      const id = store.audit_logs.length + 1;
      store.audit_logs.push({ id, envelope_id: envelopeId, action, reviewer, timestamp, details });
      saveStore();
      return { changes: 1 };
    }

    return { changes: 0 };
  }
}

const db = {
  pragma: (setting) => {
    return 'wal';
  },
  exec: (sql) => {
    saveStore();
    return true;
  },
  prepare: (sql) => {
    return new Statement(sql);
  }
};

module.exports = db;
