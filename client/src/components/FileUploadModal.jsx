import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faXmark,
  faFileLines,
  faCircleExclamation,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

export default function FileUploadModal({ isOpen, onClose, onUploadFile, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [channelHint, setChannelHint] = useState('AUTO');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      const validExts = ['vtt', 'srt', 'txt', 'json', 'md', 'xml', 'csv', 'html', 'eml'];
      if (!validExts.includes(ext)) {
        setErrorMsg(`Invalid file type (.${ext}). Supported formats: ${validExts.map(x => '.' + x).join(', ')}`);
        setSelectedFile(null);
      } else {
        setErrorMsg('');
        setSelectedFile(file);
        // Auto-suggest channel hint from filename
        const fname = file.name.toLowerCase();
        if (fname.includes('jira') || fname.includes('story') || fname.includes('issue')) {
          setChannelHint('JIRA');
        } else if (fname.includes('confluence') || fname.includes('prd') || fname.includes('adr') || fname.includes('spec')) {
          setChannelHint('CONFLUENCE');
        } else if (fname.includes('meet') || fname.endsWith('.vtt') || fname.endsWith('.srt')) {
          setChannelHint('MEET');
        } else if (fname.includes('slack')) {
          setChannelHint('SLACK');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a document or transcript file to upload.');
      return;
    }

    try {
      await onUploadFile(selectedFile, channelHint);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'File ingestion failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17181C]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white border border-[#E8EAED] rounded-[18px] max-w-md w-full p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#ECEEF1] pb-3">
          <div className="flex items-center gap-2.5 text-[#17181C] font-bold text-sm">
            <div className="w-7 h-7 rounded-[8px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faCloudArrowUp} />
            </div>
            <span>Universal Document & Signal Ingestion</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] text-[#667085] hover:text-[#17181C] hover:bg-[#F8F8F7] transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-[10px] bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] text-xs flex items-center gap-2 font-medium">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-[#E11D48] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">Document Channel / Format</label>
            <select
              value={channelHint}
              onChange={e => setChannelHint(e.target.value)}
              className="w-full bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs text-[#17181C] font-semibold focus:outline-none focus:border-[#7157F5]"
            >
              <option value="AUTO">Auto-Detect Channel</option>
              <option value="JIRA">Jira Story / Issue Export</option>
              <option value="CONFLUENCE">Confluence PRD / Architecture RFC</option>
              <option value="MEET">Google Meet / Call Transcript</option>
              <option value="SLACK">Slack Conversation Thread</option>
              <option value="EMAIL">Email Thread / EML</option>
            </select>
          </div>

          <div className="border-2 border-dashed border-[#E4E7EC] hover:border-[#7157F5] bg-[#FAFAF9] hover:bg-[#F4F1FF]/20 rounded-[12px] p-6 text-center cursor-pointer transition-colors">
            <input
              type="file"
              accept=".vtt,.srt,.txt,.json,.md,.xml,.csv,.html,.eml"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
              <FontAwesomeIcon icon={faFileLines} className="text-3xl text-[#98A2B3] mx-auto block" />
              <div className="text-xs font-bold text-[#17181C]">
                {selectedFile ? selectedFile.name : 'Click to browse Jira, Confluence, or transcript file'}
              </div>
              <p className="text-[11px] text-[#667085]">Supports .md, .txt, .json, .xml, .vtt, .srt, .html, .eml</p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#FAFAF9] hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] rounded-[10px] text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="flex items-center gap-2 px-4 py-2 bg-[#17181C] hover:bg-[#292B30] text-white rounded-[10px] text-xs font-semibold shadow-2xs disabled:opacity-50 cursor-pointer transition-all"
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs text-[#7157F5]" />}
              <span>{loading ? 'Processing...' : 'Ingest & Classify'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
