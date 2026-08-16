import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelopeOpenText,
  faComments,
  faVideo,
  faCloudArrowUp,
  faArrowRight,
  faXmark,
  faSitemap,
  faShieldHalved,
  faFingerprint,
  faCodeBranch,
  faLock,
  faEnvelope,
  faGlobe,
  faLocationDot,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import signalForgeWhiteBanner from '../../assets/SignalForge_White.png';

export default function HomePage({
  setActiveView,
  onIngestSample,
  onOpenUpload,
  onIngestGmail,
  onIngestMeet,
  onIngestSlack,
  onIngestJira,
  onIngestConfluence,
  loading
}) {
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const handleTriggerAndOpenWorkspace = async (ingestFn) => {
    try {
      await ingestFn();
      setActiveView('WORKSPACE');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-65px)] select-none">
      {/* Main Home Content Sections */}
      <div className="w-full space-y-16 sm:space-y-20 px-4 sm:px-8 lg:px-12 pt-6 pb-16">
        {/* 1. HERO SECTION WITH BLENDED ARCHITECTURE WATERMARK & SUBTLE GLOW */}
        <section className="relative pt-12 sm:pt-16 pb-6 text-center max-w-5xl mx-auto px-4 overflow-hidden rounded-[24px]">
          {/* Subtle Ambient Violet & Teal Radial Glow */}
          <div
            className="absolute inset-0 pointer-events-none -z-10"
            style={{
              background: `
                radial-gradient(circle at 58% 38%, rgba(113, 87, 245, 0.07) 0%, transparent 45%),
                radial-gradient(circle at 42% 44%, rgba(22, 184, 166, 0.035) 0%, transparent 40%)
              `
            }}
          />

          {/* Faded Atmospheric Architecture Watermark behind Hero */}
          <div
            className="hero-background-architecture"
            style={{
              backgroundImage: `url(${signalForgeWhiteBanner})`
            }}
          />

          {/* Hero Content */}
          <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
            {/* Version / Category Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[12px] bg-[#F4F1FF] border border-[#E4DCFF] text-[#5F46D8] text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7157F5]" />
              <span>Multi-Source Enterprise Signal Intake Engine v1.0</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#17181C] tracking-tight leading-[1.18]">
              Automate Your Signal Discovery with <br className="hidden sm:inline" />
              <span>Enterprise </span>
              <span className="text-[#7157F5]">AI Solutions</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[720px] mx-auto text-base sm:text-[17px] text-[#667085] font-normal leading-[1.6]">
              Transform unstructured business communication into structured, actionable requirement signals with pre-built AI agents, atomic line citations, and human-in-the-loop review.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 space-y-4 max-w-4xl mx-auto">
              {/* Primary Action & Architecture Row */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Primary CTA Button (Graphite #17181C) */}
                <button
                  onClick={() => handleTriggerAndOpenWorkspace(onIngestSample)}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-[12px] bg-[#17181C] hover:bg-[#292B30] active:bg-[#000000] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  <span>{loading ? 'Processing Signals...' : 'Start Sample Discovery'}</span>
                </button>

                {/* View Architecture Action Button */}
                <button
                  onClick={() => setFullscreenImage(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#D0D5DD] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
                  title="View full architectural pipeline diagram in high-resolution lightbox"
                >
                  <FontAwesomeIcon icon={faSitemap} className="text-[#7157F5] text-xs" />
                  <span>View Architecture</span>
                </button>
              </div>

              {/* Direct Signal Connectors Toolbar */}
              <div className="pt-1">
                <div className="flex items-center justify-center gap-2 mb-2.5 text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider">
                  <span className="w-6 h-[1px] bg-[#E4E7EC]" />
                  <span>Direct Signal Connectors</span>
                  <span className="w-6 h-[1px] bg-[#E4E7EC]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestJira)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#0052CC]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faFingerprint} className="text-[#0052CC] text-xs shrink-0" />
                    <span className="truncate">Jira Story</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestConfluence)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#00B8D9]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faCodeBranch} className="text-[#008DA6] text-xs shrink-0" />
                    <span className="truncate">Confluence</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestSlack)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#7157F5]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faComments} className="text-[#7157F5] text-xs shrink-0" />
                    <span className="truncate">Slack Channel</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestMeet)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#16B8A6]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faVideo} className="text-[#16B8A6] text-xs shrink-0" />
                    <span className="truncate">Google Meet</span>
                  </button>

                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestGmail)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#7157F5]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-[#667085] text-xs shrink-0" />
                    <span className="truncate">Gmail OAuth</span>
                  </button>

                  <button
                    onClick={onOpenUpload}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] hover:border-[#7157F5]/50 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-[#667085] text-xs shrink-0" />
                    <span className="truncate">Upload File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PRE-BUILT SOLUTIONS FOR EVERY CHANNEL */}
        <section className="max-w-6xl mx-auto px-4 space-y-6">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-[#17181C] tracking-tight">
            Pre-built Ingestion Solutions for Every Channel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Jira Issues & Stories */}
            <div
              onClick={() => handleTriggerAndOpenWorkspace(onIngestJira)}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#0052CC]/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#EBF3FF] text-[#0052CC] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faFingerprint} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#0052CC] transition-colors">
                  Jira Stories & Tickets
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Ingest User Stories, Acceptance Criteria, and technical tasks. Strips reporter/assignee boilerplate and changelog transitions automatically.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#0052CC]">
                <span>Ingest Jira Story</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: Confluence Specs */}
            <div
              onClick={() => handleTriggerAndOpenWorkspace(onIngestConfluence)}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#00B8D9]/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#E6FCFF] text-[#008DA6] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faCodeBranch} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#008DA6] transition-colors">
                  Confluence PRD & Architecture RFC
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Ingest product requirements and Architecture Decision Records (ADR). Filters out breadcrumbs, space IDs, and formatting macros.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#008DA6]">
                <span>Ingest Confluence Spec</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: Email & Gmail */}
            <div
              onClick={() => handleTriggerAndOpenWorkspace(onIngestGmail)}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#D0D5DD] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faEnvelopeOpenText} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                  Email & Gmail Threads
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Streamline physical-to-logical email segmentation, remove greeting/closing noise, and scan PII automatically with AES-256 integrity.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#7157F5]">
                <span>Ingest & Open Review</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 4: Slack Conversations */}
            <div
              onClick={() => handleTriggerAndOpenWorkspace(onIngestSlack)}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#D0D5DD] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                  Slack Team Channels
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Automate channel message discovery for <code className="text-[#5F46D8] bg-[#F4F1FF] px-1 py-0.5 rounded text-[11px]">#FrugalForge-Candidate</code> threads with atomic timestamps and verifiable citations.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#7157F5]">
                <span>Fetch Slack Messages</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 5: Google Meet Transcripts */}
            <div
              onClick={() => handleTriggerAndOpenWorkspace(onIngestMeet)}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#D0D5DD] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faVideo} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                  Google Meet Transcripts
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Manage speaker-attributed transcripts, extract architectural decisions, deadlines, and action items effortlessly without hallucinations.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#7157F5]">
                <span>Import Conference Record</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 6: Universal Document Upload */}
            <div
              onClick={onOpenUpload}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] hover:border-[#D0D5DD] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-base group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                </div>
                <h3 className="text-base font-bold text-[#17181C] group-hover:text-[#7157F5] transition-colors">
                  Document & Transcript Upload
                </h3>
                <p className="text-xs text-[#667085] leading-relaxed font-normal">
                  Upload raw Jira exports, Confluence markdown, .vtt, .srt, .eml, or .json files with automatic channel detection.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-[#ECEEF1] flex items-center justify-between text-xs font-semibold text-[#7157F5]">
                <span>Upload Document File</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. FOUR CORE ARCHITECTURAL PILLARS */}
        <section className="max-w-6xl mx-auto px-4 pt-2">
          <div className="bg-[#17181C] text-white rounded-[20px] p-8 lg:p-10 space-y-8 shadow-xl">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                Enterprise-Grade Architectural Rigor
              </h3>
              <p className="text-xs sm:text-sm text-[#98A2B3]">
                Built from first principles for auditability, privacy, and zero hallucination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#7157F5]/20 text-[#8B74F8] flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faCodeBranch} />
                </div>
                <h4 className="text-sm font-bold text-white">Physical vs Logical</h4>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  Separates 1 physical envelope into individual logical turns and isolates summary blocks.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#16B8A6]/20 text-[#16B8A6] flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faFingerprint} />
                </div>
                <h4 className="text-sm font-bold text-white">Atomic Line Citation</h4>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  Every extracted requirement links directly to its source unit ID and line number.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#7157F5]/20 text-[#8B74F8] flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <h4 className="text-sm font-bold text-white">AES-256 Cryptography</h4>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  Deterministic SHA-256 payload hashing and AES-256-GCM token protection.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#15966A]/20 text-[#15966A] flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <h4 className="text-sm font-bold text-white">Human Review Gate</h4>
                <p className="text-xs text-[#98A2B3] leading-relaxed">
                  Mandatory statement-level verification and consent confirmation before handoff.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. NATIVE RESPONSIVE HTML/CSS FOOTER (Full Bleed End-to-End, Integrated with #E4E7EC Border) */}
      <footer className="w-full bg-white border-t border-[#E4E7EC] mt-auto relative overflow-hidden">
        {/* Main Footer Navigation & Equidistant Columns */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Brand & Mission */}
            <div className="space-y-4">
              <div
                onClick={() => {
                  setActiveView('HOME');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer inline-block group"
              >
                <img
                  src="/branding/signalforge-logo.png"
                  alt="SignalForge"
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                />
              </div>

              <p className="text-[13px] text-[#667085] leading-relaxed max-w-xs font-normal">
                From scattered signals to actionable insight.<br />
                Automate discovery. Ensure clarity. Drive outcomes.
              </p>

              {/* Social Channels / Community Badges */}
              <div className="flex items-center gap-2 pt-1">
                {/* LinkedIn Badge */}
                <span
                  className="w-8 h-8 rounded-full border border-[#E4E7EC] bg-[#FAFAF9] hover:bg-[#F4F1FF] hover:border-[#E4DCFF] text-[#667085] hover:text-[#7157F5] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="LinkedIn"
                >
                  <span className="font-bold text-[11px]">in</span>
                </span>

                {/* Slack Badge */}
                <span
                  onClick={() => handleTriggerAndOpenWorkspace(onIngestSlack)}
                  className="w-8 h-8 rounded-full border border-[#E4E7EC] bg-[#FAFAF9] hover:bg-[#F4F1FF] hover:border-[#E4DCFF] text-[#667085] hover:text-[#7157F5] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Slack Community"
                >
                  <FontAwesomeIcon icon={faComments} className="text-[11px]" />
                </span>

                {/* Architecture Diagram Trigger */}
                <span
                  onClick={() => setFullscreenImage(true)}
                  className="w-8 h-8 rounded-full border border-[#E4E7EC] bg-[#FAFAF9] hover:bg-[#F4F1FF] hover:border-[#E4DCFF] text-[#667085] hover:text-[#7157F5] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Pipeline Specs"
                >
                  <FontAwesomeIcon icon={faSitemap} className="text-[11px]" />
                </span>

                {/* Contact Email */}
                <a
                  href="mailto:hello@signalforge.ai"
                  className="w-8 h-8 rounded-full border border-[#E4E7EC] bg-[#FAFAF9] hover:bg-[#F4F1FF] hover:border-[#E4DCFF] text-[#667085] hover:text-[#7157F5] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Contact Support"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="text-[11px]" />
                </a>
              </div>
            </div>

            {/* Column 2: Product Routes (Equidistant) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7157F5]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">Product</h4>
              </div>
              <ul className="space-y-2.5 text-[13px] font-normal text-[#475467]">
                <li>
                  <button
                    onClick={() => {
                      setActiveView('HOME');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Home Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('WORKSPACE')}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Dual-Pane Review Workspace
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('POLLER')}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Autonomous Gmail Listener
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('AUDIT')}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Audit Ledger & Governance
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveView('SUMMARY')}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Executive Insights & Reports
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Ingestion Solutions (Equidistant) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7157F5]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">Ingestion</h4>
              </div>
              <ul className="space-y-2.5 text-[13px] font-normal text-[#475467]">
                <li>
                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestGmail)}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Gmail OAuth Poller
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestSlack)}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Slack Channels
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleTriggerAndOpenWorkspace(onIngestMeet)}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Google Meet VTT
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenUpload}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left block"
                  >
                    Transcript Upload
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setFullscreenImage(true)}
                    className="hover:text-[#7157F5] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>Architecture</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-[#7157F5]" />
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Enterprise Connect & Status (Equidistant) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16B8A6]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#17181C]">Connect</h4>
              </div>
              <div className="space-y-2.5 text-[13px] text-[#475467] font-normal">
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faEnvelope} className="text-[#7157F5] text-xs w-3.5" />
                  <a href="mailto:hello@signalforge.ai" className="hover:text-[#7157F5] transition-colors">
                    hello@signalforge.ai
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faGlobe} className="text-[#7157F5] text-xs w-3.5" />
                  <span className="text-[#344054]">www.signalforge.ai</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#16B8A6] text-xs w-3.5" />
                  <span>Chennai, India</span>
                </div>
                <div className="pt-2.5 border-t border-[#ECEEF1] space-y-0.5">
                  <p className="text-xs font-bold text-[#7157F5]">Enterprise Ready.</p>
                  <p className="text-xs font-semibold text-[#16B8A6]">Built for Scale.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Violet-to-Teal Signal-Flow Motif (Positioned near bottom) */}
        <div className="w-full relative py-2 overflow-hidden pointer-events-none">
          {/* Signal Stream Flow Line */}
          <div
            className="w-full h-[1.5px]"
            style={{
              background: 'linear-gradient(90deg, rgba(113,87,245,0.02) 0%, rgba(113,87,245,0.3) 25%, rgba(22,184,166,0.6) 50%, rgba(113,87,245,0.3) 75%, rgba(113,87,245,0.02) 100%)'
            }}
          />
          {/* Glowing Center Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16B8A6] shadow-[0_0_8px_rgba(22,184,166,0.8)]" />
            <span className="absolute w-6 h-6 rounded-full bg-[#7157F5]/20 animate-ping" />
          </div>
        </div>

        {/* Lower Row: Trust Badges & Copyright (Guaranteed Single Row on Desktop) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-3 pb-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#667085]">
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 lg:gap-8 text-[12px]">
            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[#7157F5] text-xs" />
              <span className="font-semibold text-[#17181C]">Zero-Hallucination</span>
              <span className="text-[#98A2B3]">• Human-in-the-Loop</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLock} className="text-[#7157F5] text-xs" />
              <span className="font-semibold text-[#17181C]">Enterprise Security</span>
              <span className="text-[#98A2B3]">• Your Data, Your Control</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFingerprint} className="text-[#16B8A6] text-xs" />
              <span className="font-semibold text-[#17181C]">Trusted by Teams</span>
              <span className="text-[#98A2B3]">• Built for Impact</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-[12px] text-[#98A2B3] text-center md:text-right shrink-0">
            © 2026 SignalForge Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(false)}
          className="fixed inset-0 z-50 bg-[#17181C]/80 backdrop-blur-sm p-4 sm:p-8 flex flex-col items-center justify-center animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            className="relative max-w-7xl w-full bg-white p-4 sm:p-6 rounded-[18px] shadow-2xl border border-[#E8EAED] space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-3">
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon icon={faSitemap} className="text-[#7157F5] text-sm" />
                <h3 className="text-sm font-bold text-[#17181C]">
                  Signal Intake Engine Architecture & Processing Pipeline
                </h3>
              </div>
              <button
                onClick={() => setFullscreenImage(false)}
                className="p-1.5 rounded-[8px] text-[#667085] hover:text-[#17181C] hover:bg-[#F8F8F7] transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
              <img
                src={signalForgeWhiteBanner}
                alt="SignalForge Architecture High Resolution"
                className="w-full h-auto object-contain rounded-[10px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
