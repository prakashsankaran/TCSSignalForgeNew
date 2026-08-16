import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faEnvelopeOpenText,
  faCodeBranch,
  faShieldHalved,
  faFingerprint,
  faComments,
  faVideo,
  faFileLines
} from '@fortawesome/free-solid-svg-icons';

export default function InfoBanner({ source }) {
  if (!source) return null;

  const mode = source.connectorMode || 'SAMPLE_DATA';
  const isJira = mode === 'JIRA';
  const isConfluence = mode === 'CONFLUENCE';
  const isSlack = mode === 'SLACK';
  const isMeet = mode.includes('MEET');
  const isFile = mode.includes('FILE') || mode.includes('TRANS');

  let icon = faEnvelopeOpenText;
  let sourceLabel = 'Physical Messages:';
  let desc = `Ingested 1 physical Gmail payload containing ${source.logicalEmailCount || 10} embedded logical email exchanges + 1 test validator summary block.`;

  if (isJira) {
    icon = faFingerprint;
    sourceLabel = 'Jira Issues:';
    desc = `Ingested Jira Issue Specification containing ${source.logicalEmailCount || 5} story & comment logical sections. Metadata boilerplate & changelog noise stripped.`;
  } else if (isConfluence) {
    icon = faCodeBranch;
    sourceLabel = 'Confluence Pages:';
    desc = `Ingested Confluence PRD/RFC Specification containing ${source.logicalEmailCount || 5} architecture & requirements sections. Breadcrumb & macro noise stripped.`;
  } else if (isSlack) {
    icon = faComments;
    sourceLabel = 'Slack Messages:';
    desc = `Ingested Slack channel thread containing ${source.logicalEmailCount || 6} team messages tagged with #FrugalForge-Candidate + 1 test validator summary block.`;
  } else if (isMeet) {
    icon = faVideo;
    sourceLabel = 'Conference Sections:';
    desc = `Ingested Google Meet conference transcript containing ${source.logicalEmailCount || 8} speaker-attributed dialogue turns + 1 test validator summary block.`;
  } else if (isFile) {
    icon = faFileLines;
    sourceLabel = 'Document Blocks:';
    desc = `Ingested uploaded document containing ${source.logicalEmailCount || 5} segmented logical blocks with cryptographic SHA-256 verification.`;
  }

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E4E7EC] rounded-[16px] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-3 text-[#344054] font-medium max-w-2xl">
        <div className="w-7 h-7 rounded-[8px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
        </div>
        <span className="leading-snug">
          <strong className="font-bold text-[#17181C]">Truthful Evidence Architecture:</strong>{' '}
          {desc}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1.5 bg-[#FAFAF9] px-3 py-1.5 rounded-[10px] border border-[#E4E7EC] text-[#344054]">
          <FontAwesomeIcon icon={icon} className="text-[#7157F5]" />
          <span>{sourceLabel} <strong className="text-[#17181C] font-bold">{source.physicalMessageCount || 1}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAFAF9] px-3 py-1.5 rounded-[10px] border border-[#E4E7EC] text-[#344054]">
          <FontAwesomeIcon icon={faCodeBranch} className="text-[#16B8A6]" />
          <span>Logical Blocks: <strong className="text-[#17181C] font-bold">{source.logicalEmailCount || 10}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FFF1F2] text-[#9F1239] px-3 py-1.5 rounded-[10px] border border-[#FECDD3] font-semibold">
          <FontAwesomeIcon icon={faShieldHalved} className="text-[#E11D48]" />
          <span>Summary Section: <strong className="text-[#881337] font-bold">{source.summarySectionCount || 1} (Excluded)</strong></span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#17181C] text-white px-3.5 py-1.5 rounded-[10px] font-bold shadow-2xs">
          <FontAwesomeIcon icon={faFingerprint} className="text-[#8B74F8] text-xs" />
          <span>{mode}</span>
        </div>
      </div>
    </div>
  );
}
