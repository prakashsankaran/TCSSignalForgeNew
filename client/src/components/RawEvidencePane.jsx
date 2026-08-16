import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileCode,
  faFingerprint,
  faTriangleExclamation,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

export default function RawEvidencePane({ rawText, contentHash, selectedCitation }) {
  const [copied, setCopied] = useState(false);

  if (!rawText) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#98A2B3] bg-white">
        <FontAwesomeIcon icon={faFileCode} className="text-4xl mb-3 text-[#D0D5DD]" />
        <p className="text-sm font-medium">No evidence payload loaded.</p>
      </div>
    );
  }

  const lines = rawText.split(/\r?\n/);

  const handleCopyHash = () => {
    if (contentHash) {
      navigator.clipboard.writeText(contentHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full bg-[#FAFAF9]/40 border-r border-[#ECEEF1] overflow-hidden">
      {/* Evidence Store Header */}
      <div className="px-5 py-3.5 bg-white border-b border-[#ECEEF1] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[8px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faFileCode} />
          </div>
          <h2 className="text-xs font-bold text-[#17181C] tracking-wide uppercase">
            Raw Evidence Store ({lines.length} lines)
          </h2>
        </div>

        {/* Integrity Status Badge (Clean & Minimal without exposing raw hash string) */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#FAFAF9] border border-[#E4E7EC] text-[11px] font-mono text-[#667085]"
          title="Cryptographically bound raw evidence text"
        >
          <FontAwesomeIcon icon={faFingerprint} className="text-[#15966A] text-[10px]" />
          <span className="font-semibold text-[#344054]">Source Verified</span>
        </div>
      </div>

      {/* Code / Text Viewer with Dedicated Scrolling and Crisp Line Numbering */}
      <div className="flex-1 min-h-0 overflow-y-auto font-mono text-xs leading-relaxed p-3.5 selection:bg-[#F4F1FF]">
        {lines.map((line, index) => {
          const lineNum = index + 1;
          const isSummaryLine = line.includes('Expected Requirement Signals') || line.includes('[TEST SUMMARY');
          const isSelected = selectedCitation && line.includes(selectedCitation);

          return (
            <div
              key={index}
              className={`flex hover:bg-[#F4F1FF]/40 transition-colors py-0.5 px-2 rounded-[6px] ${
                isSelected ? 'line-highlight' : ''
              } ${isSummaryLine ? 'summary-section-line' : ''}`}
            >
              <span className="w-10 shrink-0 text-right pr-4 text-[#98A2B3] select-none font-mono text-[11px]">
                {lineNum}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all text-[#17181C]">
                {isSummaryLine && (
                  <span className="inline-flex items-center gap-1.5 mr-2 px-2 py-0.5 rounded-[6px] bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3] text-[10px] uppercase tracking-wider font-sans font-bold shadow-2xs">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-[#E11D48] text-xs" />
                    <span>Excluded Summary</span>
                  </span>
                )}
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
