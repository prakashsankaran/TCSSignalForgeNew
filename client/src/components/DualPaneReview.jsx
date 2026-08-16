import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelopeOpenText,
  faComments,
  faVideo,
  faCloudArrowUp,
  faFlask,
  faTableColumns,
  faShieldHalved,
  faSpinner,
  faArrowRight,
  faFolderOpen,
  faFingerprint,
  faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import RawEvidencePane from './RawEvidencePane';
import ExtractedSignalsPane from './ExtractedSignalsPane';
import GovernancePanel from './GovernancePanel';

export default function DualPaneReview({
  envelope,
  onUpdateSignal,
  onBatchUpdateSignals,
  onDeleteSignal,
  onCommitReview,
  onDownloadJSON,
  onDownloadMD,
  onPublishFrugalForge,
  onIngestGmail,
  onIngestSlack,
  onIngestMeet,
  onIngestJira,
  onIngestConfluence,
  onIngestSample,
  onOpenUpload,
  envelopesList = [],
  onSelectEnvelope,
  loading = false
}) {
  const [selectedCitation, setSelectedCitation] = useState(null);

  if (!envelope) {
    return (
      <div
        className="w-full flex-1 min-h-[580px] bg-white rounded-[18px] border border-[#E8EAED] p-6 sm:p-10 flex flex-col justify-between"
        style={{
          boxShadow: '0 1px 2px rgba(16,24,40,0.03), 0 8px 30px rgba(16,24,40,0.04)'
        }}
      >
        <div className="max-w-3xl mx-auto w-full text-center space-y-4 pt-4">
          <div className="w-14 h-14 mx-auto rounded-[16px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-2xl shadow-xs">
            <FontAwesomeIcon icon={faTableColumns} />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#F4F1FF] text-[#5F46D8] border border-[#E4DCFF] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7157F5]" />
              <span>Workspace Ready • Awaiting Signal Ingestion</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#17181C] tracking-tight">
              Dual-Pane Review Workspace is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] max-w-xl mx-auto leading-relaxed">
              No signal payload is currently loaded. Ingest live candidate signals from Jira, Confluence, Gmail, Slack, or Google Meet, or click sample data to populate the dual pane.
            </p>
          </div>
        </div>

        {/* Quick Ingestion Channels Grid */}
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {/* Card 1: Jira */}
          <button
            onClick={onIngestJira}
            disabled={loading}
            className="text-left bg-[#FAFAF9] hover:bg-[#EBF3FF]/50 border border-[#E4E7EC] hover:border-[#0052CC]/50 p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-white text-[#0052CC] border border-[#ECEEF1] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={faFingerprint} />
              </div>
              <h3 className="text-xs font-bold text-[#17181C] group-hover:text-[#0052CC] transition-colors">
                Jira Stories & Tickets
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                Acceptance criteria, user stories & technical constraints
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#0052CC] flex items-center gap-1">
              Ingest Jira <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 2: Confluence */}
          <button
            onClick={onIngestConfluence}
            disabled={loading}
            className="text-left bg-[#FAFAF9] hover:bg-[#E6FCFF]/50 border border-[#E4E7EC] hover:border-[#00B8D9]/50 p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-white text-[#008DA6] border border-[#ECEEF1] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={faCodeBranch} />
              </div>
              <h3 className="text-xs font-bold text-[#17181C] group-hover:text-[#008DA6] transition-colors">
                Confluence Architecture RFC
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                Architecture Decision Records, PRDs & NFR specs
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#008DA6] flex items-center gap-1">
              Ingest Confluence <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 3: Gmail */}
          <button
            onClick={onIngestGmail}
            disabled={loading}
            className="text-left bg-[#FAFAF9] hover:bg-[#F4F1FF]/40 border border-[#E4E7EC] hover:border-[#7157F5]/50 p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-white text-[#7157F5] border border-[#ECEEF1] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={faEnvelopeOpenText} />
              </div>
              <h3 className="text-xs font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                Gmail Threads
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                OAuth candidate thread ingestion & segmentation
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#7157F5] flex items-center gap-1">
              Ingest Gmail <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 4: Slack */}
          <button
            onClick={onIngestSlack}
            disabled={loading}
            className="text-left bg-[#FAFAF9] hover:bg-[#F4F1FF]/40 border border-[#E4E7EC] hover:border-[#7157F5]/50 p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-white text-[#7157F5] border border-[#ECEEF1] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <h3 className="text-xs font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                Slack Channel
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                Fetch #FrugalForge-Candidate threads
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#7157F5] flex items-center gap-1">
              Fetch Slack <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 5: Google Meet */}
          <button
            onClick={onIngestMeet}
            disabled={loading}
            className="text-left bg-[#FAFAF9] hover:bg-[#16B8A6]/20 border border-[#E4E7EC] hover:border-[#16B8A6]/50 p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-white text-[#16B8A6] border border-[#ECEEF1] flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <h3 className="text-xs font-bold text-[#17181C] group-hover:text-[#16B8A6] transition-colors">
                Google Meet
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                Speaker-attributed conference transcripts
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#16B8A6] flex items-center gap-1">
              Ingest Meet <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          {/* Card 6: Load Sample Data */}
          <button
            onClick={onIngestSample}
            disabled={loading}
            className="text-left bg-[#F4F1FF]/50 hover:bg-[#F4F1FF] border border-[#E4DCFF] hover:border-[#7157F5] p-4 rounded-[14px] transition-all group cursor-pointer flex flex-col justify-between h-40 disabled:opacity-50"
          >
            <div>
              <div className="w-8 h-8 rounded-[10px] bg-[#7157F5] text-white flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform mb-3">
                <FontAwesomeIcon icon={loading ? faSpinner : faFlask} className={loading ? 'animate-spin' : ''} />
              </div>
              <h3 className="text-xs font-bold text-[#5F46D8] transition-colors">
                Load Sample Thread
              </h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-snug">
                10-turn multi-stakeholder reference candidate thread
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#5F46D8] flex items-center gap-1">
              Load Sample <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Previously Ingested Threads History Drawer (Hidden from view as thread switching is handled via top header dropdown) */}
        {/*
        {false && envelopesList && envelopesList.length > 0 && (
          <div className="max-w-5xl mx-auto w-full pt-4 border-t border-[#ECEEF1]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#17181C]">
                <FontAwesomeIcon icon={faFolderOpen} className="text-[#7157F5]" />
                <span>Previously Ingested Threads ({envelopesList.length})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {envelopesList.map(env => (
                <button
                  key={env.envelope_id}
                  onClick={() => onSelectEnvelope && onSelectEnvelope(env.envelope_id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FAFAF9] hover:bg-[#F4F1FF] border border-[#E4E7EC] hover:border-[#7157F5] text-xs font-mono font-bold text-[#344054] transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[10px] text-[#15966A]" />
                  <span>{env.envelope_id}</span>
                  <span className="text-[10px] font-sans font-normal text-[#667085]">({env.source_type})</span>
                </button>
              ))}
            </div>
          </div>
        )}
        */}
      </div>
    );
  }

  return (
    <div
      className="w-full flex-1 min-h-[640px] h-[720px] lg:h-[780px] flex flex-col overflow-hidden bg-white rounded-[18px] border border-[#E8EAED]"
      style={{
        boxShadow: '0 1px 2px rgba(16,24,40,0.03), 0 8px 30px rgba(16,24,40,0.04)'
      }}
    >
      {/* Governance Bar at Top of Dual-Pane Card */}
      <GovernancePanel
        envelope={envelope}
        onCommitReview={onCommitReview}
        onDownloadJSON={onDownloadJSON}
        onDownloadMD={onDownloadMD}
        onPublishFrugalForge={onPublishFrugalForge}
      />

      {/* Dual Pane Main Workspace: Left Evidence + Right Extracted Signals */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#ECEEF1] overflow-hidden">
        {/* Left Pane: Raw Evidence Store (Dedicated smooth internal scroll) */}
        <RawEvidencePane
          rawText={envelope.source ? envelope.source.rawText : ''}
          contentHash={envelope.contentHash}
          selectedCitation={selectedCitation}
        />

        {/* Right Pane: Extracted Context & 22 Categories (Dedicated smooth internal scroll) */}
        <ExtractedSignalsPane
          envelope={envelope}
          onUpdateSignal={onUpdateSignal}
          onBatchUpdateSignals={onBatchUpdateSignals}
          onDeleteSignal={onDeleteSignal}
          onSelectCitation={setSelectedCitation}
          selectedCitation={selectedCitation}
        />
      </div>
    </div>
  );
}
