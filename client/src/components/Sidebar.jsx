import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGrip,
  faFolderOpen,
  faTowerBroadcast,
  faShieldHalved,
  faChartPie,
  faEnvelope,
  faComments,
  faVideo,
  faCloudArrowUp,
  faCircleQuestion,
  faTrashCan,
  faArrowsRotate,
  faXmark,
  faMagnifyingGlass,
  faBolt,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({
  activeView,
  setActiveView,
  envelopesList,
  currentEnvelope,
  onSelectEnvelope,
  onDeleteEnvelope,
  onClearAll,
  onIngestSample,
  onIngestGmail,
  onIngestMeet,
  onIngestSlack,
  onOpenUpload,
  pollerStatus,
  onTogglePoller,
  onManualPoll
}) {
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  return (
    <>
      {/* Sleek Vertical Icon Rail matching Image 1 */}
      <aside className="w-[72px] lg:w-[76px] bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-4 select-none shrink-0 z-30 shadow-xs h-screen">
        {/* Top Group: Brand Mark & Search */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Brand Mark Icon */}
          <div
            onClick={() => setActiveView('WORKSPACE')}
            className="w-10 h-10 rounded-[14px] bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center cursor-pointer transition-all shadow-md shadow-slate-900/20 group"
            title="Signal Intake Engine - Workspace"
          >
            <FontAwesomeIcon icon={faBolt} className="text-base text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
            title="Search & Browse Envelopes"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
          </button>

          {/* Section: General */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
              General
            </span>

            {/* Workspace / Dashboard Button */}
            <button
              onClick={() => setActiveView('WORKSPACE')}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all cursor-pointer relative ${
                activeView === 'WORKSPACE'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Dual-Pane Review Workspace"
            >
              <FontAwesomeIcon icon={faGrip} className="text-sm" />
              {currentEnvelope && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Envelopes History Drawer Toggle */}
            <button
              onClick={() => setHistoryDrawerOpen(!historyDrawerOpen)}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all cursor-pointer relative ${
                activeView === 'HISTORY' || historyDrawerOpen
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={`Ingested Envelopes (${envelopesList.length})`}
            >
              <FontAwesomeIcon icon={faFolderOpen} className="text-sm" />
              {envelopesList.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-slate-900 text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {envelopesList.length}
                </span>
              )}
            </button>

            {/* Autonomous Listener Button */}
            <button
              onClick={() => setActiveView('POLLER')}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all cursor-pointer relative ${
                activeView === 'POLLER'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Autonomous Gmail Poller Listener"
            >
              <FontAwesomeIcon
                icon={faTowerBroadcast}
                className={`text-sm ${pollerStatus.isPolling ? 'text-emerald-500 animate-pulse' : ''}`}
              />
              {pollerStatus.isPolling && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
              )}
            </button>

            {/* Governance & Audit Ledger Button */}
            <button
              onClick={() => setActiveView('AUDIT')}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all cursor-pointer ${
                activeView === 'AUDIT'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Governance Audit Compliance Ledger"
            >
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </button>

            {/* Executive Summary Button */}
            <button
              onClick={() => setActiveView('SUMMARY')}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all cursor-pointer ${
                activeView === 'SUMMARY'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Enterprise Summary & KPI Insights"
            >
              <FontAwesomeIcon icon={faChartPie} className="text-sm" />
            </button>
          </div>

          {/* Section: Sources (Unified neutral style) */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Sources
            </span>

            {/* Gmail Ingest */}
            <button
              onClick={onIngestGmail}
              className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Fetch Live Gmail Thread"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-sm" />
            </button>

            {/* Slack Ingest */}
            <button
              onClick={onIngestSlack}
              className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Fetch Live Slack Channel Thread"
            >
              <FontAwesomeIcon icon={faComments} className="text-sm" />
            </button>

            {/* Google Meet Ingest */}
            <button
              onClick={onIngestMeet}
              className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Fetch Google Meet Conference Transcript"
            >
              <FontAwesomeIcon icon={faVideo} className="text-sm" />
            </button>

            {/* File Upload Ingest */}
            <button
              onClick={onOpenUpload}
              className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
              title="Upload Transcript File (.vtt, .srt, .txt, .json)"
            >
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Bottom Group: Support & Profile */}
        <div className="flex flex-col items-center gap-2 w-full pt-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Support
          </span>

          {/* Settings / Immediate Poll Trigger */}
          <button
            onClick={onManualPoll}
            className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
            title="Poll Gmail Listener Immediately"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="text-sm" />
          </button>

          {/* Schema Help & Info */}
          <button
            onClick={() => window.open('https://github.com', '_blank')}
            className="w-10 h-10 rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
            title="Schema v1.0 & Contract Documentation"
          >
            <FontAwesomeIcon icon={faCircleQuestion} className="text-sm" />
          </button>

          {/* User Profile Avatar */}
          <div className="pt-2 border-t border-slate-100 w-full flex justify-center">
            <div
              className="w-10 h-10 rounded-[14px] bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer relative group"
              title="Prakash (Lead Architect)"
            >
              <span>PS</span>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>
        </div>
      </aside>

      {/* Slide-out Flyout Drawer for Ingested Payload History */}
      {historyDrawerOpen && (
        <div className="fixed inset-y-0 left-[72px] lg:left-[76px] w-80 bg-white border-r border-slate-200 z-40 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFolderOpen} className="text-slate-700 text-sm" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Payload History ({envelopesList.length})
              </h3>
            </div>
            <button
              onClick={() => setHistoryDrawerOpen(false)}
              className="p-1.5 rounded-[12px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={onIngestSample}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] text-xs font-semibold shadow-xs cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Load Sample</span>
            </button>
            {envelopesList.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* List of Envelopes */}
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {envelopesList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <FontAwesomeIcon icon={faFolderOpen} className="text-3xl text-slate-300 block mb-2" />
                <p>No ingested payloads found.</p>
              </div>
            ) : (
              envelopesList.map(item => {
                const isCurrent = currentEnvelope && currentEnvelope.envelopeId === item.envelope_id;
                const isConfirmed = item.review_status === 'CONFIRMED';

                return (
                  <div
                    key={item.envelope_id}
                    className={`p-3 rounded-[12px] border transition-all cursor-pointer shadow-2xs group ${
                      isCurrent
                        ? 'bg-slate-100 border-slate-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      onSelectEnvelope(item.envelope_id);
                      setActiveView('WORKSPACE');
                      setHistoryDrawerOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[170px]">
                        {item.envelope_id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isConfirmed && (
                          <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-xs" title="Governance Verified" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEnvelope(item.envelope_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 rounded-[8px] hover:bg-rose-50 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-[8px] font-semibold border border-slate-200">
                        {item.source_type}
                      </span>
                      <span className="text-slate-400">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
