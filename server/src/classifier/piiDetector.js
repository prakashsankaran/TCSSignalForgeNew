/**
 * PII Category Scanner
 * Scans atomic text statements for sensitive personal data categories
 * without logging or leaking raw values.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PAYMENT_INFO_REGEX = /\b(?:card|acc|account|iban|upi|cvv|credit|debit|payment ref|transaction id)\s*[:#\s]?\s*[A-Z0-9-]{4,}\b/i;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

function scanPII(text) {
  if (!text || typeof text !== 'string') {
    return { containsPotentialPII: false, piiCategories: [] };
  }

  const piiCategories = [];

  if (EMAIL_REGEX.test(text)) {
    piiCategories.push('EMAIL_ADDRESS');
  }

  if (PAYMENT_INFO_REGEX.test(text)) {
    piiCategories.push('PAYMENT_INFORMATION_REFERENCE');
  }

  if (PHONE_REGEX.test(text)) {
    piiCategories.push('PHONE_NUMBER');
  }

  // Check for explicit mention of customer or person names e.g. "Customer Rahul Mehta" or "Ananya's email"
  if (/\b(?:customer|user|client|employee)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text)) {
    piiCategories.push('PERSON_NAME');
  }

  return {
    containsPotentialPII: piiCategories.length > 0,
    piiCategories: Array.from(new Set(piiCategories))
  };
}

module.exports = {
  scanPII
};
