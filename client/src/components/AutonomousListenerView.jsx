import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTowerBroadcast,
  faEnvelopeOpenText,
  faComments,
  faVideo,
  faArrowsRotate,
  faCircleCheck,
  faCircleStop,
  faPlay,
  faClock,
  faShieldHalved,
  faSpinner,
  faArrowRight,
  faMagnifyingGlass,
  faFilter,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
  faFingerprint,
  faCodeBranch,
  faXmark
} from '@fortawesome/free-solid-svg-icons';

export default function AutonomousListenerView({
  pollerStatus,
  onTogglePoller,
  onManualPoll,
  envelopesList = [],
  onSelectEnvelope,
  setActiveView,
  loading
}) {
  const isPolling = pollerStatus?.isPolling ?? false;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered & Sorted Envelopes
  const filteredEnvelopes = useMemo(() => {
    let result = [...envelopesList];

    // Filter by Source Connector
    if (selectedSource !== 'ALL') {
      result = result.filter(env => (env.source_type || '').toUpperCase() === selectedSource);
    }

    // Filter by Review Status
    if (selectedStatus !== 'ALL') {
      result = result.filter(env => (env.review_status || '').toUpperCase() === selectedStatus);
    }

    // Filter by Search Term (Envelope ID, source, status, date)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(env => {
        const id = (env.envelope_id || '').toLowerCase();
        const src = (env.source_type || '').toLowerCase();
        const status = (env.review_status || '').toLowerCase();
        const date = new Date(env.created_at).toLocaleString().toLowerCase();
        return id.includes(term) || src.includes(term) || status.includes(term) || date.includes(term);
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'ID_ASC') {
        return (a.envelope_id || '').localeCompare(b.envelope_id || '');
      }
      if (sortBy === 'ID_DESC') {
        return (b.envelope_id || '').localeCompare(a.envelope_id || '');
      }
      return 0;
    });

    return result;
  }, [envelopesList, searchTerm, selectedSource, selectedStatus, sortBy]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredEnvelopes.length / pageSize));

  // Ensure current page is valid when filters change
  const validCurrentPage = Math.min(currentPage, totalPages);
  if (validCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(validCurrentPage);
  }

  // Paginated Slice
  const paginatedEnvelopes = useMemo(() => {
    const startIdx = (validCurrentPage - 1) * pageSize;
    return filteredEnvelopes.slice(startIdx, startIdx + pageSize);
  }, [filteredEnvelopes, validCurrentPage, pageSize]);

  // Helpers
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSource('ALL');
    setSelectedStatus('ALL');
    setSortBy('NEWEST');
    setCurrentPage(1);
  };

  const getConnectorBadge = (sourceType = '') => {
    const src = sourceType.toUpperCase();
    if (src.includes('JIRA')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#EBF3FF] text-[#0052CC] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#CCE0FF]">
          <FontAwesomeIcon icon={faFingerprint} className="text-[10px]" />
          <span>JIRA</span>
        </span>
      );
    }
    if (src.includes('CONF')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#E6FCFF] text-[#008DA6] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#B3F5FF]">
          <FontAwesomeIcon icon={faCodeBranch} className="text-[10px]" />
          <span>CONFLUENCE</span>
        </span>
      );
    }
    if (src.includes('SLACK')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#F4F1FF] text-[#5F46D8] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#E4DCFF]">
          <FontAwesomeIcon icon={faComments} className="text-[10px]" />
          <span>SLACK</span>
        </span>
      );
    }
    if (src.includes('MEET')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#F0FDF9] text-[#0E7090] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#CFFAFE]">
          <FontAwesomeIcon icon={faVideo} className="text-[10px]" />
          <span>GOOGLE MEET</span>
        </span>
      );
    }
    if (src.includes('GMAIL')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#F4F1FF] text-[#7157F5] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#E4DCFF]">
          <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-[10px]" />
          <span>GMAIL</span>
        </span>
      );
    }
    return (
      <span className="bg-[#FAFAF9] text-[#344054] px-2.5 py-1 rounded-[6px] font-mono font-semibold border border-[#E4E7EC]">
        {sourceType}
      </span>
    );
  };

  return (
    <div className="w-full space-y-8 pb-16 select-none">
      {/* Top Header & Master Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[18px] border border-[#E8EAED] shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isPolling ? 'bg-[#15966A] animate-ping' : 'bg-[#D0D5DD]'}`} />
            <h1 className="text-xl font-bold text-[#17181C] tracking-tight">
              Autonomous Ingestion Listener
            </h1>
            <span className={`px-2.5 py-0.5 rounded-[8px] text-[11px] font-mono font-bold border ${
              isPolling ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]' : 'bg-[#FAFAF9] text-[#667085] border-[#E4E7EC]'
            }`}>
              {isPolling ? 'DAEMON ACTIVE' : 'DAEMON STOPPED'}
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Continuous background polling daemon monitoring Gmail, Slack, Jira, Confluence, and Meet for <code className="text-[#5F46D8] font-bold bg-[#F4F1FF] px-1 py-0.5 rounded">#FrugalForge-Candidate</code> tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onManualPoll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <FontAwesomeIcon icon={loading ? faSpinner : faArrowsRotate} className={loading ? 'animate-spin' : 'text-[#7157F5]'} />
            <span>Poll Immediately</span>
          </button>

          <button
            onClick={onTogglePoller}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-semibold text-white transition-all cursor-pointer shadow-2xs ${
              isPolling
                ? 'bg-[#E11D48] hover:bg-[#BE123C]'
                : 'bg-[#17181C] hover:bg-[#292B30]'
            }`}
          >
            <FontAwesomeIcon icon={isPolling ? faCircleStop : faPlay} />
            <span>{isPolling ? 'Stop Listener' : 'Start Listener'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Daemon Status */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Listener State</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">
              {isPolling ? 'Running' : 'Standby'}
            </span>
            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${
              isPolling ? 'bg-[#ECFDF3] text-[#15966A]' : 'bg-[#FAFAF9] text-[#98A2B3]'
            }`}>
              <FontAwesomeIcon icon={faTowerBroadcast} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Auto-recovers on network glitches</p>
        </div>

        {/* Card 2: Polling Frequency */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Polling Interval</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">30s</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Continuous cron cycle</p>
        </div>

        {/* Card 3: Ingested Payloads */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Total Payloads</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">{envelopesList.length}</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Cryptographically signed envelopes</p>
        </div>

        {/* Card 4: Last Status */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Last Sync Status</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17181C] truncate max-w-[170px]">
              {pollerStatus?.lastPollStatus || 'System Ready'}
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[#ECFDF3] text-[#15966A] flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">{new Date().toLocaleTimeString()} (Active)</p>
        </div>
      </div>

      {/* Configured Channel Daemons Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#17181C] uppercase tracking-wide">Configured Channel Daemons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Channel 1: Gmail */}
          <div className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17181C]">Gmail Connector</h3>
                  <p className="text-[11px] text-[#667085]">Google OAuth 2.0 API</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-[10px] font-mono font-bold">
                POLLING
              </span>
            </div>
            <div className="p-3 bg-[#FAFAF9] rounded-[10px] text-xs font-mono space-y-1 text-[#344054]">
              <div>Query: <strong className="text-[#17181C]">label:FrugalForge-Candidate</strong></div>
              <div>Scope: <strong className="text-[#17181C]">gmail.readonly</strong></div>
            </div>
          </div>

          {/* Channel 2: Slack */}
          <div className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center">
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17181C]">Slack Webhook</h3>
                  <p className="text-[11px] text-[#667085]">Bot Events & Conversations</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#F4F1FF] text-[#5F46D8] border border-[#E4DCFF] text-[10px] font-mono font-bold">
                READY
              </span>
            </div>
            <div className="p-3 bg-[#FAFAF9] rounded-[10px] text-xs font-mono space-y-1 text-[#344054]">
              <div>Channel: <strong className="text-[#17181C]">#all-tcs-valuethread</strong></div>
              <div>Filter Tag: <strong className="text-[#17181C]">#FrugalForge-Candidate</strong></div>
            </div>
          </div>

          {/* Channel 3: Meet */}
          <div className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#F0FDF9] text-[#0E7090] flex items-center justify-center">
                  <FontAwesomeIcon icon={faVideo} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#17181C]">Google Meet Sync</h3>
                  <p className="text-[11px] text-[#667085]">Conference Transcripts</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#F0FDF9] text-[#0E7090] border border-[#CFFAFE] text-[10px] font-mono font-bold">
                READY
              </span>
            </div>
            <div className="p-3 bg-[#FAFAF9] rounded-[10px] text-xs font-mono space-y-1 text-[#344054]">
              <div>Space: <strong className="text-[#17181C]">meetings.space.readonly</strong></div>
              <div>Speaker Attribution: <strong className="text-[#17181C]">Enabled</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingested Payloads Table with Search, Filters, & Scalable Pagination */}
      <div className="bg-white rounded-[16px] border border-[#E4E7EC] shadow-2xs overflow-hidden">
        {/* Table Header with Title & Live Filters */}
        <div className="p-5 border-b border-[#ECEEF1] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#17181C] uppercase tracking-wide flex items-center gap-2">
                <span>Autonomous Ingestion Event Log</span>
                <span className="px-2 py-0.5 rounded-full bg-[#F4F1FF] text-[#5F46D8] text-xs font-mono font-bold">
                  {filteredEnvelopes.length} {filteredEnvelopes.length !== envelopesList.length && `of ${envelopesList.length}`}
                </span>
              </h3>
              <p className="text-xs text-[#667085] mt-0.5">
                Click any row to open and inspect in the Dual-Pane Workspace
              </p>
            </div>

            {/* Records per page selector */}
            <div className="flex items-center gap-2 text-xs text-[#667085]">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[8px] px-2.5 py-1 text-xs font-bold text-[#17181C] cursor-pointer focus:outline-none focus:border-[#7157F5]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Filter Toolbar Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Search Input */}
            <div className="relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search envelope ID, date..."
                className="w-full pl-9 pr-8 py-2 bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] text-xs text-[#17181C] placeholder-[#98A2B3] focus:outline-none focus:border-[#7157F5] focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#17181C] cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {/* Source Connector Filter */}
            <select
              value={selectedSource}
              onChange={e => {
                setSelectedSource(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs font-medium text-[#344054] cursor-pointer focus:outline-none focus:border-[#7157F5]"
            >
              <option value="ALL">All Source Connectors</option>
              <option value="JIRA">Jira Stories & Tickets</option>
              <option value="CONFLUENCE">Confluence PRD / Specs</option>
              <option value="SLACK">Slack Channels</option>
              <option value="MEET_REST">Google Meet Transcripts</option>
              <option value="GMAIL">Gmail OAuth Threads</option>
              <option value="SAMPLE_DATA">Sample Reference Data</option>
            </select>

            {/* Review Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs font-medium text-[#344054] cursor-pointer focus:outline-none focus:border-[#7157F5]"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="UNREVIEWED">Unreviewed (Pending Gate)</option>
              <option value="CONFIRMED">Confirmed (Handoff Ready)</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs font-medium text-[#344054] cursor-pointer focus:outline-none focus:border-[#7157F5]"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="OLDEST">Sort: Oldest First</option>
              <option value="ID_ASC">Sort: Envelope ID (A → Z)</option>
              <option value="ID_DESC">Sort: Envelope ID (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        {filteredEnvelopes.length === 0 ? (
          <div className="p-12 text-center text-[#98A2B3] text-xs space-y-3">
            <FontAwesomeIcon icon={faTowerBroadcast} className="text-3xl text-[#D0D5DD] block mx-auto mb-2" />
            <p className="font-semibold text-[#344054]">No matching ingestion payloads found.</p>
            <p className="text-[#667085]">Try adjusting your search criteria or reset filters.</p>
            {(searchTerm || selectedSource !== 'ALL' || selectedStatus !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 bg-[#F4F1FF] text-[#5F46D8] hover:bg-[#E4DCFF] rounded-[8px] text-xs font-semibold cursor-pointer transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAFAF9] border-b border-[#ECEEF1] text-[#667085] uppercase tracking-wider text-[10px] sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-bold">Envelope ID</th>
                  <th className="px-6 py-3 font-bold">Source Connector</th>
                  <th className="px-6 py-3 font-bold">Review Status</th>
                  <th className="px-6 py-3 font-bold">ValueThread Sync</th>
                  <th className="px-6 py-3 font-bold">Ingested Timestamp</th>
                  <th className="px-6 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {paginatedEnvelopes.map(item => {
                  const isSent = Boolean(item.published_to_valuethread || item.publishedToValueThread || item.publishedToFrugalforge);
                  return (
                    <tr
                      key={item.envelope_id}
                      onClick={() => {
                        onSelectEnvelope(item.envelope_id);
                        setActiveView('WORKSPACE');
                      }}
                      className="hover:bg-[#F8F8F7] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                        {item.envelope_id}
                      </td>
                      <td className="px-6 py-3.5">
                        {getConnectorBadge(item.source_type)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-[6px] font-mono font-bold text-[10px] ${
                          item.review_status === 'CONFIRMED'
                            ? 'bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]'
                            : 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]'
                        }`}>
                          {item.review_status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {isSent ? (
                          <span
                            className="px-2.5 py-1 rounded-[6px] font-mono font-bold text-[10px] bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] inline-flex items-center gap-1.5 shadow-2xs"
                            title={`Import ID: ${item.valuethread_import_id || 'CONFIRMED'}`}
                          >
                            <FontAwesomeIcon icon={faCircleCheck} className="text-[#15966A] text-[10px]" />
                            <span>Sent to ValueThread</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-[6px] font-mono font-semibold text-[10px] bg-[#FAFAF9] text-[#667085] border border-[#E4E7EC] inline-flex items-center gap-1">
                            <span>Ready to Send</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-[#667085] font-mono">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[#7157F5]">
                        <span className="inline-flex items-center justify-end gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Review</span>
                          <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Navigation Footer */}
        {filteredEnvelopes.length > 0 && (
          <div className="px-6 py-3.5 border-t border-[#ECEEF1] bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Range indicator */}
            <div className="text-[#667085]">
              Showing <strong className="text-[#17181C] font-semibold">{(validCurrentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#17181C] font-semibold">
                {Math.min(validCurrentPage * pageSize, filteredEnvelopes.length)}
              </strong>{' '}
              of <strong className="text-[#17181C] font-semibold">{filteredEnvelopes.length}</strong> events
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="w-8 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
                title="First Page"
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="px-3 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                <span>Prev</span>
              </button>

              {/* Page Number Indicator */}
              <div className="px-3 py-1 font-mono text-xs font-bold text-[#17181C]">
                Page {validCurrentPage} of {totalPages}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-3 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <span>Next</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="w-8 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
                title="Last Page"
              >
                <FontAwesomeIcon icon={faAnglesRight} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
