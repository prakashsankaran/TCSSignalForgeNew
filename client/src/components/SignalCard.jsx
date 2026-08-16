import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faXmark,
  faPenToSquare,
  faTriangleExclamation,
  faClock,
  faArrowRight,
  faTag,
  faFloppyDisk,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons';

// Clean refined category tag colors
const CATEGORY_COLORS = {
  BUSINESS_PROBLEM: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
  MEASURABLE_IMPACT: 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]',
  BUSINESS_OBJECTIVE: 'bg-[#F4F1FF] text-[#5F46D8] border-[#E4DCFF]',
  BUSINESS_RULE: 'bg-[#EEF4FF] text-[#3538CD] border-[#D1E0FF]',
  DECISION: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  DEADLINE: 'bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE]',
  OPEN_QUESTION: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  NFR: 'bg-[#F0FDF9] text-[#0E7090] border-[#CFFAFE]',
  SECURITY_REQUIREMENT: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  COMPLIANCE_REQUIREMENT: 'bg-[#ECFDFF] text-[#087F8C] border-[#B9F5FD]',
  UX_REQUIREMENT: 'bg-[#FDF2FA] text-[#C11574] border-[#FCCEEE]',
  INTEGRATION: 'bg-[#F0F9FF] text-[#026AA2] border-[#B9E6FE]',
  DEPENDENCY: 'bg-[#F8F9FC] text-[#363F72] border-[#D5D9EB]',
  PROPOSED_SOLUTION: 'bg-[#F6FEF9] text-[#087443] border-[#A6F4C5]',
  REQUEST: 'bg-[#F4F3FF] text-[#5925DC] border-[#D9D6FE]',
  ACTION_ITEM: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  RISK: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
  CONSTRAINT: 'bg-[#F8F9FA] text-[#344054] border-[#EAECF0]'
};

export default function SignalCard({ signal, onUpdateSignal, onDeleteSignal, onSelectCitation, isSelected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(signal.editedStatement || signal.statement);
  const [editedCategory, setEditedCategory] = useState(signal.primaryCategory);

  const handleSaveEdit = () => {
    onUpdateSignal(signal.signalId, {
      userStatus: 'EDITED',
      editedStatement: editedText,
      primaryCategory: editedCategory
    });
    setIsEditing(false);
  };

  const handleConfirm = () => {
    onUpdateSignal(signal.signalId, { userStatus: 'CONFIRMED' });
  };

  const handleReject = () => {
    onUpdateSignal(signal.signalId, { userStatus: 'REJECTED' });
  };

  const handleDelete = () => {
    if (onDeleteSignal) {
      onDeleteSignal(signal.signalId);
    }
  };

  const statusBorder = {
    CONFIRMED: 'border-[#ABEFC6] bg-[#ECFDF3]/25',
    REJECTED: 'border-[#FECDD3] bg-[#FFF1F2]/20 opacity-65',
    EDITED: 'border-[#E4DCFF] bg-[#F4F1FF]/30',
    PENDING: 'border-[#E4E7EC] bg-white hover:border-[#D0D5DD]'
  }[signal.userStatus || 'PENDING'];

  const categoryBadgeClass = CATEGORY_COLORS[signal.primaryCategory] || 'bg-[#F8F9FA] text-[#344054] border-[#EAECF0]';

  return (
    <div
      className={`p-4 sm:p-5 rounded-[14px] border transition-all shadow-2xs ${statusBorder} ${
        isSelected ? 'ring-2 ring-[#7157F5] shadow-sm' : ''
      }`}
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Signal ID Indicator */}
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-[#FAFAF9] text-[#475467] border border-[#E4E7EC]">
            {signal.signalId}
          </span>

          {/* Primary Category Tag */}
          <span className={`px-2.5 py-0.5 rounded-[8px] text-xs font-bold border ${categoryBadgeClass}`}>
            {signal.primaryCategory}
          </span>

          {/* Temporal Status Badge */}
          {signal.temporalStatus === 'RESOLVED' && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[8px] bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]">
              <FontAwesomeIcon icon={faClock} className="text-[#15966A]" />
              <span>RESOLVED</span>
            </span>
          )}
          {signal.temporalStatus === 'SUPERSEDED' && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[8px] bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89] line-through">
              <FontAwesomeIcon icon={faArrowRight} className="text-[#D97706]" />
              <span>SUPERSEDED</span>
            </span>
          )}

          {/* PII Alert Badge */}
          {signal.containsPotentialPII && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[8px] bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-[#E11D48]" />
              <span>PII ({signal.piiCategories.join(', ')})</span>
            </span>
          )}
        </div>

        {/* Compound Citation Button */}
        <button
          onClick={() => onSelectCitation && onSelectCitation(signal.sourceUnitId)}
          className="text-[11px] font-mono font-medium text-[#475467] hover:text-[#7157F5] hover:bg-[#F4F1FF] transition-colors bg-[#FAFAF9] px-2.5 py-1 rounded-[8px] border border-[#E4E7EC] cursor-pointer shadow-2xs"
          title="Click to highlight raw evidence source line"
        >
          {signal.sourceUnitId}
        </button>
      </div>

      {/* Statement Text or Edit Field */}
      {isEditing ? (
        <div className="mt-2 space-y-3">
          <textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            className="w-full bg-white border border-[#7157F5] rounded-[10px] p-3 text-xs text-[#17181C] focus:outline-none focus:ring-1 focus:ring-[#7157F5] font-medium leading-relaxed"
            rows={3}
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={editedCategory}
              onChange={e => setEditedCategory(e.target.value)}
              className="bg-white border border-[#E4E7EC] rounded-[10px] px-3 py-1.5 text-xs text-[#7157F5] font-bold"
              placeholder="Category"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#17181C] hover:bg-[#292B30] text-white rounded-[10px] text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-[#FAFAF9] hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] rounded-[10px] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-[13px] text-[#17181C] leading-relaxed font-normal my-2.5 bg-[#FAFAF9] p-3.5 rounded-[10px] border border-[#EAECF0]">
          "{signal.editedStatement || signal.statement}"
        </p>
      )}

      {/* Secondary Tags & Action Controls */}
      <div className="mt-3 pt-3 border-t border-[#ECEEF1] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <FontAwesomeIcon icon={faTag} className="text-[#98A2B3] text-xs" />
          {signal.secondaryTags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono text-[#475467] bg-[#FAFAF9] border border-[#E4E7EC] px-2 py-0.5 rounded-[6px] font-semibold">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className={`px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
              signal.userStatus === 'CONFIRMED'
                ? 'bg-[#15966A] text-white border-[#15966A] shadow-xs'
                : 'bg-white text-[#344054] border-[#E4E7EC] hover:bg-[#ECFDF3] hover:text-[#067647] hover:border-[#ABEFC6]'
            }`}
            title="Confirm Signal for ValueThread handoff"
          >
            <FontAwesomeIcon icon={faCheck} className={signal.userStatus === 'CONFIRMED' ? 'text-white text-xs' : 'text-[#15966A] text-xs'} />
            <span>Confirm</span>
          </button>

          {/* Reject Button */}
          <button
            onClick={handleReject}
            className={`px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
              signal.userStatus === 'REJECTED'
                ? 'bg-[#E11D48] text-white border-[#E11D48] shadow-xs'
                : 'bg-white text-[#344054] border-[#E4E7EC] hover:bg-[#FFF1F2] hover:text-[#9F1239] hover:border-[#FECDD3]'
            }`}
            title="Reject Signal (Excludes from ValueThread handoff)"
          >
            <FontAwesomeIcon icon={faXmark} className={signal.userStatus === 'REJECTED' ? 'text-white text-xs' : 'text-[#E11D48] text-xs'} />
            <span>Reject</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className={`p-2 px-2.5 rounded-[10px] border text-xs font-semibold transition-all cursor-pointer shadow-2xs flex items-center gap-1 ${
              signal.userStatus === 'EDITED'
                ? 'bg-[#7157F5] text-white border-[#7157F5] shadow-xs'
                : 'bg-white text-[#667085] border-[#E4E7EC] hover:bg-[#F8F8F7] hover:text-[#17181C]'
            }`}
            title="Edit Statement"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 px-2.5 rounded-[10px] border border-[#E4E7EC] bg-white text-[#98A2B3] hover:text-[#E11D48] hover:bg-[#FFF1F2] hover:border-[#FECDD3] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Delete this signal completely"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
