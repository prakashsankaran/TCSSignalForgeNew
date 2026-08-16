import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faUserTie,
  faCircleCheck,
  faPaperPlane,
  faFileLines,
  faLayerGroup,
  faCalendarCheck,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

export default function ExecutiveInsightsView({
  envelope,
  onPublishFrugalForge,
  setActiveView,
  onSelectCitation
}) {
  if (!envelope) {
    return (
      <div className="w-full py-20 text-center bg-white rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-3">
        <FontAwesomeIcon icon={faChartPie} className="text-4xl text-[#D0D5DD] block mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#17181C]">No active envelope loaded</h3>
        <p className="text-xs text-[#667085]">Load a sample data thread or ingest a conversation to view executive insights.</p>
      </div>
    );
  }

  const {
    extractedSignals = [],
    stakeholderViewpoints = [],
    governance = {},
    source = {}
  } = envelope;

  const confirmedCount = extractedSignals.filter(s => s.userStatus === 'CONFIRMED').length;
  const deadlineCount = extractedSignals.filter(s => s.primaryCategory === 'DEADLINE').length;
  const riskCount = extractedSignals.filter(s => s.primaryCategory === 'RISK').length;
  const piiCount = extractedSignals.filter(s => s.containsPotentialPII).length;

  return (
    <div className="w-full space-y-8 pb-16 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[18px] border border-[#E8EAED] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-lg shadow-xs">
            <FontAwesomeIcon icon={faChartPie} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#17181C] tracking-tight">
                Executive Insights & Stakeholder Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-[6px] bg-[#F4F1FF] text-[#5F46D8] border border-[#E4DCFF] text-xs font-mono font-bold">
                {envelope.envelopeId}
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              Cross-functional alignment synthesis across 6 enterprise stakeholder roles and 22 requirement categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('WORKSPACE')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] rounded-[10px] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faFileLines} className="text-[#667085]" />
            <span>Open Dual-Pane Review</span>
          </button>

          {onPublishFrugalForge && (
            (() => {
              const isPublished = Boolean(
                envelope.publishedToValueThread ||
                envelope.publishedToFrugalforge ||
                envelope.published_to_valuethread ||
                envelope.valueThreadImportId ||
                envelope.frugalforgeImportId
              );
              const importId = envelope.valueThreadImportId || envelope.frugalforgeImportId;

              return isPublished ? (
                <button
                  disabled={true}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] rounded-[10px] text-xs font-semibold shadow-2xs cursor-not-allowed opacity-95 transition-all select-none"
                  title={`Thread was already sent to ValueThread (Import ID: ${importId || 'CONFIRMED'}). Resending is locked.`}
                >
                  <FontAwesomeIcon icon={faCircleCheck} className="text-[#15966A] text-xs" />
                  <span>Sent to ValueThread</span>
                </button>
              ) : (
                <button
                  onClick={onPublishFrugalForge}
                  className="flex items-center gap-2 px-4 py-2 bg-[#17181C] hover:bg-[#292B30] text-white rounded-[10px] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Publish confirmed signals to ValueThread Discovery Inbox"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="text-[#8B74F8] text-xs" />
                  <span>Send to ValueThread</span>
                </button>
              );
            })()
          )}
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Total Signals</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">{extractedSignals.length}</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">22 Enterprise categories classified</p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Review Gate Status</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">
              {confirmedCount}/{extractedSignals.length}
            </span>
            <div className="w-8 h-8 rounded-[10px] bg-[#ECFDF3] text-[#15966A] flex items-center justify-center">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Human statement confirmations</p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Deadlines & Milestones</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">{deadlineCount}</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#F9F5FF] text-[#6941C6] flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Temporal target dates locked</p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">Risk & PII Alerts</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-[#17181C] font-mono">{riskCount + piiCount}</span>
            <div className="w-8 h-8 rounded-[10px] bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
          </div>
          <p className="text-[11px] text-[#667085] font-mono">Scanned & flagged for reviewer</p>
        </div>
      </div>

      {/* 6 Stakeholder Viewpoints Matrix (2x3 Grid) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#17181C] uppercase tracking-wide">
          Cross-Functional Stakeholder Viewpoints ({stakeholderViewpoints.length} Roles)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stakeholderViewpoints.map((viewpoint, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-[16px] border border-[#E4E7EC] shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#D0D5DD] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[8px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-xs font-bold">
                    <FontAwesomeIcon icon={faUserTie} />
                  </div>
                  <h3 className="text-sm font-bold text-[#17181C]">{viewpoint.role}</h3>
                </div>

                <p className="text-xs text-[#344054] leading-relaxed font-normal bg-[#FAFAF9] p-3 rounded-[10px] border border-[#EAECF0]">
                  "{viewpoint.summary}"
                </p>

                {viewpoint.keyConcerns && viewpoint.keyConcerns.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                      Key Requirement Focus:
                    </span>
                    <ul className="space-y-1 text-xs text-[#344054]">
                      {viewpoint.keyConcerns.map((concern, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <span className="text-[#7157F5] font-bold">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {viewpoint.evidenceCitations && viewpoint.evidenceCitations.length > 0 && (
                <div className="pt-3 border-t border-[#ECEEF1] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wide">
                    Evidence Citations:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {viewpoint.evidenceCitations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        onClick={() => {
                          if (onSelectCitation) onSelectCitation(cite);
                          setActiveView('WORKSPACE');
                        }}
                        className="text-[10px] font-mono bg-[#FAFAF9] hover:bg-[#F4F1FF] text-[#475467] hover:text-[#7157F5] px-2 py-0.5 rounded-[6px] border border-[#E4E7EC] cursor-pointer transition-colors"
                        title="Click to jump to line in evidence store"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
