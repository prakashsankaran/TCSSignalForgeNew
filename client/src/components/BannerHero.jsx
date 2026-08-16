import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faEnvelopeOpenText,
  faComments,
  faVideo,
  faCloudArrowUp,
  faFlask,
  faShieldHalved,
  faSpinner,
  faArrowRight,
  faMaximize,
  faXmark,
  faSitemap,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import signalForgeWhiteBanner from '../../assets/SignalForge_White.png';

export default function BannerHero({
  activeView,
  setActiveView,
  onIngestSample,
  onOpenUpload,
  onIngestGmail,
  onIngestMeet,
  onIngestSlack,
  loading,
  currentEnvelope,
  envelopesCount = 0,
  pollerStatus = {}
}) {
  const [showArchitecture, setShowArchitecture] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  return (
    <div className="w-full bg-gradient-to-b from-blue-50/40 via-white to-white border-b border-slate-200 select-none">
      {/* 1. TOP NAVBAR (Clean, Minimal SaaS Header matching reference image) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('WORKSPACE')}>
          <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-xs">
            <FontAwesomeIcon icon={faBolt} className="text-white text-xs" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
            Signal<span className="text-blue-600">Forge</span>
          </span>
        </div>

        {/* Center: Navigation Menu Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveView('WORKSPACE')}
            className={`transition-colors cursor-pointer ${
              activeView === 'WORKSPACE' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Dual-Pane Review
          </button>

          <button
            onClick={() => setActiveView('POLLER')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeView === 'POLLER' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            <span>Autonomous Listener</span>
            {pollerStatus.isPolling && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveView('AUDIT')}
            className={`transition-colors cursor-pointer ${
              activeView === 'AUDIT' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Audit Ledger
          </button>

          <button
            onClick={() => setActiveView('SUMMARY')}
            className={`transition-colors cursor-pointer ${
              activeView === 'SUMMARY' ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Executive Insights
          </button>
        </nav>

        {/* Right: Active Status & Primary CTA Button */}
        <div className="flex items-center gap-3">
          {currentEnvelope ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-[12px] bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold">
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600 text-xs" />
              <span>{currentEnvelope.envelopeId}</span>
            </div>
          ) : (
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              Ready for Ingestion
            </span>
          )}

          {/* Primary Action Button */}
          <button
            onClick={onIngestSample}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <FontAwesomeIcon icon={loading ? faSpinner : faFlask} className={loading ? 'animate-spin' : ''} />
            <span>Load Sample Data</span>
          </button>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION (Centered bold typography matching reference image) */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center space-y-5">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Automate Your Signal Discovery with <br className="hidden sm:inline" />
          <span className="text-blue-600">Enterprise AI Solutions</span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          Transform unstructured business communication into structured, actionable requirement signals with pre-built AI agents, atomic line citations, and human-in-the-loop review.
        </p>

        {/* Hero CTA & Quick Channels Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={onIngestSample}
            disabled={loading}
            className="px-6 py-3 rounded-[12px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing Signals...' : 'Start Sample Discovery'}
          </button>

          <button
            onClick={onIngestSlack}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faComments} className="text-slate-500" />
            <span>Fetch Slack</span>
          </button>

          <button
            onClick={onIngestMeet}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faVideo} className="text-slate-500" />
            <span>Google Meet</span>
          </button>

          <button
            onClick={onIngestGmail}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-slate-500" />
            <span>Gmail OAuth</span>
          </button>

          <button
            onClick={onOpenUpload}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-slate-500" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* 3. ARCHITECTURE PIPELINE SHOWCASE (Using SignalForge_White.png wisely and fitting cleanly) */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-[16px] border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden">
          {/* Architecture Showcase Header */}
          <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSitemap} className="text-blue-600 text-xs" />
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                Signal Intake Engine Architecture & Processing Pipeline
              </span>
              <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-[10px] bg-blue-100/80 text-blue-800 font-bold">
                Zero-Hallucination Pipeline
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFullscreenImage(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-[8px] hover:bg-slate-100 cursor-pointer"
                title="View Full Resolution"
              >
                <FontAwesomeIcon icon={faMaximize} className="text-xs" />
                <span className="hidden sm:inline">Zoom</span>
              </button>

              <button
                onClick={() => setShowArchitecture(!showArchitecture)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded-[8px] hover:bg-slate-100 cursor-pointer"
                title={showArchitecture ? 'Collapse Architecture' : 'Expand Architecture'}
              >
                <FontAwesomeIcon icon={showArchitecture ? faEyeSlash : faEye} className="text-xs" />
                <span>{showArchitecture ? 'Hide Diagram' : 'Show Diagram'}</span>
              </button>
            </div>
          </div>

          {/* Architecture Graphic Container - Perfectly fitting end-to-end without cropping */}
          {showArchitecture && (
            <div
              onClick={() => setFullscreenImage(true)}
              className="p-3 sm:p-5 bg-white flex items-center justify-center cursor-zoom-in group relative"
            >
              <img
                src={signalForgeWhiteBanner}
                alt="SignalForge Intake Engine Architecture Diagram"
                className="w-full h-auto object-contain max-h-[380px] rounded-[10px] transition-transform duration-200 group-hover:scale-[1.008]"
              />
              <div className="absolute bottom-4 right-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-[8px] shadow-sm backdrop-blur-xs flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMaximize} className="text-xs" />
                <span>Click to expand full screen</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. PRE-BUILT SOLUTIONS CARDS (3 Cards matching the reference image) */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-center text-lg sm:text-xl font-extrabold text-slate-900 mb-6">
          Pre-built Ingestion Solutions for Every Channel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Email & Gmail */}
          <div
            onClick={onIngestGmail}
            className="bg-white p-6 rounded-[16px] border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faEnvelopeOpenText} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Email & Gmail Threads
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Streamline physical-to-logical email segmentation, remove greeting/closing noise, and scan PII automatically with AES-256 integrity.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Ingest Live Thread</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Slack Conversations */}
          <div
            onClick={onIngestSlack}
            className="bg-white p-6 rounded-[16px] border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Slack Team Channels
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Automate channel message discovery for <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-[11px]">#FrugalForge-Candidate</code> threads with atomic timestamps and verifiable citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Fetch Slack Messages</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Google Meet Transcripts */}
          <div
            onClick={onIngestMeet}
            className="bg-white p-6 rounded-[16px] border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[12px] bg-blue-50 text-blue-600 flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Google Meet Transcripts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Manage speaker-attributed transcripts, extract architectural decisions, deadlines, and action items effortlessly without hallucinations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Import Conference Record</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Diagram Zoom */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(false)}
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm p-4 sm:p-8 flex flex-col items-center justify-center animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-7xl w-full bg-white p-4 sm:p-6 rounded-[16px] shadow-2xl border border-slate-200 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSitemap} className="text-blue-600 text-sm" />
                <h3 className="text-sm font-bold text-slate-900">
                  Signal Intake Engine Architecture & Processing Pipeline
                </h3>
              </div>
              <button
                onClick={() => setFullscreenImage(false)}
                className="p-1.5 rounded-[10px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
              <img
                src={signalForgeWhiteBanner}
                alt="SignalForge Architecture High Resolution"
                className="w-full h-auto object-contain rounded-[8px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
