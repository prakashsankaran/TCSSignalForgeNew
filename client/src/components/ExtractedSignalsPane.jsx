import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faMagnifyingGlass,
  faWandMagicSparkles,
  faFolderOpen,
  faCheckDouble,
  faXmark,
  faTableList,
  faIdCard,
  faFilter,
  faCheck,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import SignalCard from './SignalCard';
import EnterpriseSummaryTab from './EnterpriseSummaryTab';

const ENTERPRISE_CATEGORIES = [
  'ALL',
  'SUMMARY',
  'BUSINESS_PROBLEM',
  'BUSINESS_OBJECTIVE',
  'REQUEST',
  'OBLIGATION',
  'PROPOSED_SOLUTION',
  'BUSINESS_RULE',
  'DECISION',
  'ACTION_ITEM',
  'RISK',
  'CONSTRAINT',
  'DEPENDENCY',
  'INTEGRATION',
  'NFR',
  'SECURITY_REQUIREMENT',
  'COMPLIANCE_REQUIREMENT',
  'UX_REQUIREMENT',
  'DEADLINE',
  'MEASURABLE_IMPACT',
  'OPEN_QUESTION',
  'ASSUMPTION',
  'CONFLICT',
  'STAKEHOLDER_VIEWPOINT'
];

export default function ExtractedSignalsPane({
  envelope,
  onUpdateSignal,
  onBatchUpdateSignals,
  onDeleteSignal,
  onSelectCitation,
  selectedCitation
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'CONFIRMED', 'REJECTED'
  const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' or 'TABLE'

  if (!envelope) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#98A2B3] bg-white">
        <FontAwesomeIcon icon={faWandMagicSparkles} className="text-4xl mb-3 text-[#D0D5DD]" />
        <p className="text-sm font-medium">No signals extracted yet.</p>
      </div>
    );
  }

  const { extractedSignals = [] } = envelope;

  // Filter signals based on category tab, search term, and review status
  const filteredSignals = extractedSignals.filter(s => {
    const matchesTab =
      activeTab === 'ALL' ||
      activeTab === 'SUMMARY' ||
      s.primaryCategory === activeTab;

    const matchesSearch =
      !searchTerm ||
      s.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.primaryCategory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (!s.userStatus || s.userStatus === 'PENDING')) ||
      s.userStatus === statusFilter;

    return matchesTab && matchesSearch && matchesStatus;
  });

  const unconfirmedInView = filteredSignals.filter(s => s.userStatus !== 'CONFIRMED');
  const unrejectedInView = filteredSignals.filter(s => s.userStatus !== 'REJECTED');

  // Atomic Batch Actions
  const handleBatchConfirmAll = () => {
    const idsToConfirm = unconfirmedInView.map(s => s.signalId);
    if (idsToConfirm.length === 0) return;

    if (onBatchUpdateSignals) {
      onBatchUpdateSignals(idsToConfirm, { userStatus: 'CONFIRMED' });
    } else {
      idsToConfirm.forEach(id => onUpdateSignal(id, { userStatus: 'CONFIRMED' }));
    }
  };

  const handleBatchRejectAll = () => {
    const idsToReject = unrejectedInView.map(s => s.signalId);
    if (idsToReject.length === 0) return;

    if (onBatchUpdateSignals) {
      onBatchUpdateSignals(idsToReject, { userStatus: 'REJECTED' });
    } else {
      idsToReject.forEach(id => onUpdateSignal(id, { userStatus: 'REJECTED' }));
    }
  };

  // Calculate count for each category
  const getCategoryCount = (cat) => {
    if (cat === 'ALL') return extractedSignals.length;
    if (cat === 'SUMMARY') return 'Executive';
    return extractedSignals.filter(s => s.primaryCategory === cat).length;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full bg-[#FAFAF9]/40 overflow-hidden">
      {/* 1. Sleek & Crisp Header Bar */}
      <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-b border-[#ECEEF1] space-y-2.5">
        {/* Row 1: Title, Search, Status Dropdown, View Toggle & Batch Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Title & Total Count */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[8px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <h2 className="text-xs font-bold text-[#17181C] tracking-wide uppercase flex items-center gap-1.5">
              <span>Extracted Signals</span>
              <span className="px-2 py-0.5 rounded-full bg-[#F4F1FF] text-[#5F46D8] font-mono text-[11px] font-bold">
                {filteredSignals.length}
              </span>
            </h2>
          </div>

          {/* Unified Actions Toolbar */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] text-xs" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[8px] pl-7 pr-6 py-1 text-xs text-[#17181C] placeholder-[#98A2B3] focus:outline-none focus:border-[#7157F5] focus:bg-white w-32 sm:w-44 font-medium transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#17181C] cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[8px] px-2 py-1 text-xs font-semibold text-[#344054] cursor-pointer focus:outline-none focus:border-[#7157F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-[#FAFAF9] border border-[#E4E7EC] rounded-[8px] p-0.5">
              <button
                onClick={() => setViewMode('CARDS')}
                className={`px-2 py-0.5 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'CARDS'
                    ? 'bg-white text-[#17181C] shadow-2xs font-bold'
                    : 'text-[#667085] hover:text-[#17181C]'
                }`}
                title="Cards View"
              >
                <FontAwesomeIcon icon={faIdCard} className="text-[11px]" />
                <span className="hidden md:inline">Cards</span>
              </button>

              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-2 py-0.5 rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-[#17181C] shadow-2xs font-bold'
                    : 'text-[#667085] hover:text-[#17181C]'
                }`}
                title="Table View"
              >
                <FontAwesomeIcon icon={faTableList} className="text-[11px]" />
                <span className="hidden md:inline">Table</span>
              </button>
            </div>

            {/* 1-Click Batch Confirm & Reject Buttons */}
            {unconfirmedInView.length > 0 && (
              <button
                onClick={handleBatchConfirmAll}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#15966A] hover:bg-[#0E704D] text-white text-xs font-bold rounded-[8px] shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Confirm all remaining signals in current view"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="text-[11px]" />
                <span>Confirm All</span>
              </button>
            )}

            {unrejectedInView.length > 0 && (
              <button
                onClick={handleBatchRejectAll}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FFF1F2] text-[#9F1239] hover:text-[#E11D48] border border-[#FECDD3] text-xs font-semibold rounded-[8px] shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Reject all remaining signals in current view"
              >
                <FontAwesomeIcon icon={faXmark} className="text-[11px]" />
                <span>Reject All</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Filter Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
          {ENTERPRISE_CATEGORIES.map(cat => {
            const count = getCategoryCount(cat);
            if (count === 0 && cat !== 'ALL' && cat !== 'SUMMARY') return null;

            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-2.5 py-1 rounded-[8px] text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#17181C] text-white shadow-2xs'
                    : 'bg-[#FAFAF9] text-[#475467] hover:bg-[#F2F4F7] hover:text-[#17181C] border border-[#E4E7EC]'
                }`}
              >
                <span>{cat === 'SUMMARY' ? 'Executive Summary' : cat.replace(/_/g, ' ')}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[6px] font-bold ${
                    isActive ? 'bg-[#292B30] text-[#F4F1FF]' : 'bg-white text-[#667085] border border-[#E4E7EC]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dedicated Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
        {activeTab === 'SUMMARY' ? (
          <EnterpriseSummaryTab envelope={envelope} />
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[14px] border border-[#E4E7EC] text-[#98A2B3] text-xs space-y-2 shadow-2xs">
            <FontAwesomeIcon icon={faFolderOpen} className="text-3xl text-[#D0D5DD]" />
            <p>No signals match the current filters.</p>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* High-Density Quick Triage Table View */
          <div className="w-full overflow-x-auto rounded-[14px] border border-[#E4E7EC] bg-white shadow-2xs">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse table-auto">
              <thead className="bg-[#FAFAF9] border-b border-[#ECEEF1] text-[#667085] text-[10px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="w-20 px-3.5 py-2.5 font-bold">ID</th>
                  <th className="w-36 px-3.5 py-2.5 font-bold">Category</th>
                  <th className="min-w-[200px] px-3.5 py-2.5 font-bold">Statement Requirement</th>
                  <th className="w-28 px-3.5 py-2.5 font-bold">Citation</th>
                  <th className="w-24 px-3.5 py-2.5 font-bold text-center">Status</th>
                  <th className="w-32 px-4 py-2.5 font-bold text-right shrink-0">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {filteredSignals.map(sig => {
                  const isConfirmed = sig.userStatus === 'CONFIRMED';
                  const isRejected = sig.userStatus === 'REJECTED';

                  return (
                    <tr
                      key={sig.signalId}
                      className={`hover:bg-[#F4F1FF]/30 transition-colors ${
                        selectedCitation && sig.sourceUnitId === selectedCitation ? 'bg-[#F4F1FF]' : ''
                      }`}
                    >
                      <td className="w-20 px-3.5 py-2.5 font-mono font-bold text-[#475467] text-[11px] whitespace-nowrap">
                        {sig.signalId}
                      </td>
                      <td className="w-36 px-3.5 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-[#F4F1FF] text-[#5F46D8] border border-[#E4DCFF]">
                          {sig.primaryCategory}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#17181C] font-medium leading-relaxed">
                        {sig.editedStatement || sig.statement}
                      </td>
                      <td className="w-28 px-3.5 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => onSelectCitation && onSelectCitation(sig.sourceUnitId)}
                          className="text-[10px] font-mono text-[#7157F5] hover:underline cursor-pointer"
                          title="Jump to source line"
                        >
                          {sig.sourceUnitId.split('#').pop()}
                        </button>
                      </td>
                      <td className="w-24 px-3.5 py-2.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-bold ${
                          isConfirmed
                            ? 'bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]'
                            : isRejected
                            ? 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]'
                            : 'bg-[#FAFAF9] text-[#667085] border border-[#E4E7EC]'
                        }`}>
                          {sig.userStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="w-32 px-4 py-2.5 text-right shrink-0 whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateSignal(sig.signalId, { userStatus: 'CONFIRMED' })}
                            className={`w-7 h-7 flex items-center justify-center rounded-[8px] text-xs font-semibold cursor-pointer transition-colors ${
                              isConfirmed
                                ? 'bg-[#15966A] text-white shadow-2xs'
                                : 'bg-white hover:bg-[#ECFDF3] text-[#15966A] border border-[#E4E7EC]'
                            }`}
                            title="Confirm"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>

                          <button
                            onClick={() => onUpdateSignal(sig.signalId, { userStatus: 'REJECTED' })}
                            className={`w-7 h-7 flex items-center justify-center rounded-[8px] text-xs font-semibold cursor-pointer transition-colors ${
                              isRejected
                                ? 'bg-[#E11D48] text-white shadow-2xs'
                                : 'bg-white hover:bg-[#FFF1F2] text-[#E11D48] border border-[#E4E7EC]'
                            }`}
                            title="Reject"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>

                          <button
                            onClick={() => onDeleteSignal && onDeleteSignal(sig.signalId)}
                            className="w-7 h-7 flex items-center justify-center rounded-[8px] bg-white hover:bg-[#FFF1F2] text-[#98A2B3] hover:text-[#E11D48] border border-[#E4E7EC] text-xs cursor-pointer transition-colors"
                            title="Delete Signal"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Rich Statement Cards View */
          filteredSignals.map(signal => (
            <SignalCard
              key={signal.signalId}
              signal={signal}
              onUpdateSignal={onUpdateSignal}
              onDeleteSignal={onDeleteSignal}
              onSelectCitation={onSelectCitation}
              isSelected={selectedCitation && signal.sourceUnitId === selectedCitation}
            />
          ))
        )}
      </div>
    </div>
  );
}
