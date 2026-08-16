import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCircleCheck,
  faPaperPlane,
  faFileCode,
  faFileLines,
  faCircleExclamation,
  faUserTie,
  faLock,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function GovernancePanel({
  envelope,
  onCommitReview,
  onDownloadJSON,
  onDownloadMD,
  onPublishFrugalForge
}) {
  if (!envelope) return null;

  const { governance = {} } = envelope;

  const [sensitivity, setSensitivity] = useState(governance.sensitivity || 'CONFIDENTIAL');
  const [consentGiven, setConsentGiven] = useState(governance.consentGiven ?? true);
  const [reviewerName, setReviewerName] = useState(governance.reviewerName || 'Prakash (Architect)');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPublished = Boolean(
    envelope.publishedToValueThread ||
    envelope.publishedToFrugalforge ||
    envelope.published_to_valuethread ||
    envelope.valueThreadImportId ||
    envelope.frugalforgeImportId
  );
  const importId = envelope.valueThreadImportId || envelope.frugalforgeImportId;

  const isConfirmed = governance.reviewStatus === 'CONFIRMED' || isPublished;

  const handleCommit = async () => {
    setErrorMsg('');
    try {
      setSubmitting(true);
      await onCommitReview({
        sensitivity,
        consentGiven,
        reviewerName
      });
    } catch (err) {
      setErrorMsg(err.message || 'Review Gate Validation Failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (isPublished) {
      setErrorMsg(`This thread was already sent to ValueThread (Import ID: ${importId}). Resending is disabled.`);
      return;
    }
    setErrorMsg('');
    try {
      setSubmitting(true);
      if (!isConfirmed) {
        await onCommitReview({
          sensitivity,
          consentGiven: true,
          reviewerName: reviewerName || 'Prakash (Architect)'
        });
      }
      if (onPublishFrugalForge) {
        await onPublishFrugalForge();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Review Gate Validation or Publication Failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shrink-0 bg-white border-b border-[#ECEEF1] px-6 py-3.5 space-y-2.5">
      {/* Primary Governance Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Inputs Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sensitivity Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#667085] flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLock} className="text-[#98A2B3]" />
              <span>Sensitivity:</span>
            </span>
            <select
              value={sensitivity}
              onChange={e => setSensitivity(e.target.value)}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs text-[#17181C] focus:outline-none focus:border-[#7157F5] cursor-pointer font-mono font-bold shadow-2xs"
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="RESTRICTED">RESTRICTED</option>
            </select>
          </div>

          {/* Reviewer Input */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#667085] flex items-center gap-1.5">
              <FontAwesomeIcon icon={faUserTie} className="text-[#98A2B3]" />
              <span>Reviewer:</span>
            </span>
            <input
              type="text"
              placeholder="Reviewer Name"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs text-[#17181C] focus:outline-none focus:border-[#7157F5] w-48 font-medium shadow-2xs"
            />
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#344054] bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 shadow-2xs hover:bg-[#F2F4F7] transition-colors">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={e => setConsentGiven(e.target.checked)}
              className="w-4 h-4 rounded text-[#7157F5] focus:ring-[#7157F5] border-[#D0D5DD] cursor-pointer"
            />
            <span>Consent Confirmed</span>
          </label>
        </div>

        {/* Right Actions Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Commit Review Button (Graphite #17181C) */}
          <button
            onClick={handleCommit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#17181C] hover:bg-[#292B30] active:bg-[#000000] text-white text-xs font-semibold rounded-[10px] transition-all cursor-pointer disabled:opacity-50"
            style={{
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
            }}
            title="Confirm & Commit Governance Review Gate"
          >
            <FontAwesomeIcon icon={submitting ? faSpinner : faCheck} className={submitting ? 'animate-spin' : 'text-[#16B8A6]'} />
            <span>{isConfirmed ? 'Re-Commit Gate' : 'Confirm & Commit'}</span>
          </button>

          {/* Send to ValueThread Button (Active Violet vs Disabled Green Synced) */}
          {onPublishFrugalForge && (
            isPublished ? (
              <button
                disabled={true}
                className="flex items-center gap-2 px-4 py-2 bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] text-xs font-semibold rounded-[10px] shadow-2xs cursor-not-allowed opacity-95 transition-all select-none"
                title={`This thread was already sent to ValueThread (Import ID: ${importId || 'CONFIRMED'}). Resending is locked to prevent duplicate submissions.`}
              >
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#15966A] text-xs" />
                <span>Sent to ValueThread</span>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#7157F5] hover:bg-[#5E44E6] text-white text-xs font-semibold rounded-[10px] shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Publish SignalEnvelope directly to ValueThread Signal Inbox"
              >
                <FontAwesomeIcon icon={submitting ? faSpinner : faPaperPlane} className={submitting ? 'animate-spin' : 'text-white text-xs'} />
                <span>Send to ValueThread</span>
              </button>
            )
          )}

          {/* Export JSON */}
          <button
            onClick={onDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] text-xs font-mono font-semibold rounded-[10px] transition-all cursor-pointer shadow-2xs"
            title="Download SignalEnvelope.json"
          >
            <FontAwesomeIcon icon={faFileCode} className="text-[#667085]" />
            <span>.JSON</span>
          </button>

          {/* Export Markdown */}
          <button
            onClick={onDownloadMD}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] text-xs font-mono font-semibold rounded-[10px] transition-all cursor-pointer shadow-2xs"
            title="Download Candidate_Signal.md"
          >
            <FontAwesomeIcon icon={faFileLines} className="text-[#667085]" />
            <span>.MD</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="px-4 py-2.5 rounded-[10px] bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] text-xs flex items-center gap-2">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-[#E11D48] shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
