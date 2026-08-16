import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faScroll,
  faShieldHalved,
  faArrowsRotate,
  faClock,
  faUserTie,
  faFileLines,
  faLock,
  faFingerprint,
  faCircleCheck,
  faDownload,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
  faMagnifyingGlass,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../config';

export default function AuditLedgerView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/audit-logs`);
      const data = await res.json();
      setLogs(data || []);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!filterTerm.trim()) return logs;
    const term = filterTerm.toLowerCase().trim();
    return logs.filter(log => (
      (log.envelope_id && log.envelope_id.toLowerCase().includes(term)) ||
      (log.reviewer && log.reviewer.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term))
    ));
  }, [logs, filterTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLogs = useMemo(() => {
    const startIdx = (validCurrentPage - 1) * pageSize;
    return filteredLogs.slice(startIdx, startIdx + pageSize);
  }, [filteredLogs, validCurrentPage, pageSize]);

  return (
    <div className="w-full space-y-8 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[18px] border border-[#E8EAED] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#F4F1FF] text-[#7157F5] flex items-center justify-center text-lg shadow-xs">
            <FontAwesomeIcon icon={faScroll} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#17181C] tracking-tight">
              Governance & Compliance Audit Ledger
            </h1>
            <p className="text-xs text-[#667085]">
              Immutable audit trail of statement-level review gate commitments, sensitivity tags, and reviewer verifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3]" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={filterTerm}
              onChange={e => {
                setFilterTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[10px] pl-8 pr-8 py-2 text-xs text-[#17181C] placeholder-[#98A2B3] focus:outline-none focus:border-[#7157F5] focus:bg-white w-48 sm:w-60 font-medium shadow-2xs transition-colors"
            />
            {filterTerm && (
              <button
                onClick={() => setFilterTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#17181C] cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8F8F7] text-[#344054] border border-[#E4E7EC] rounded-[10px] text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="text-[#7157F5] text-xs" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3 Cryptographic Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17181C]">
            <FontAwesomeIcon icon={faFingerprint} className="text-[#0052CC]" />
            <span>Deterministic SHA-256 Hashing</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Every payload envelope is cryptographically bound to its raw evidence text via deterministic SHA-256 hashing.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17181C]">
            <FontAwesomeIcon icon={faLock} className="text-[#7157F5]" />
            <span>AES-256-GCM Token Encryption</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Google OAuth refresh and access tokens are secured at rest with authenticated AES-256-GCM cryptographic ciphers.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E4E7EC] shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#17181C]">
            <FontAwesomeIcon icon={faCircleCheck} className="text-[#15966A]" />
            <span>Zero-Hallucination Review Gate</span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            100% human-verified statement review gate with verified line-level source citations and consent enforcement.
          </p>
        </div>
      </div>

      {/* Audit Log Table with Pagination */}
      <div className="bg-white rounded-[16px] border border-[#E4E7EC] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ECEEF1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-bold text-[#17181C] uppercase tracking-wide">
              Immutable Audit Trail ({filteredLogs.length})
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-[10px] font-mono font-bold">
              SOC2 / ISO 27001 Ready
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#667085]">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#FAFAF9] border border-[#E4E7EC] rounded-[8px] px-2 py-1 text-xs font-bold text-[#17181C] cursor-pointer focus:outline-none focus:border-[#7157F5]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#98A2B3] text-xs font-medium">
            Loading audit ledger entries...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-[#667085] text-xs space-y-2">
            <FontAwesomeIcon icon={faShieldHalved} className="text-4xl mx-auto text-[#D0D5DD] block mb-2" />
            <p className="font-semibold text-[#17181C]">No audit log entries recorded yet.</p>
            <p className="text-[11px] text-[#667085]">
              Commit a review in the Dual-Pane Review workspace to record an immutable audit entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAF9] text-[#667085] border-b border-[#ECEEF1] uppercase font-mono text-[10px] sticky top-0">
                  <th className="px-6 py-3 font-bold">Audit ID</th>
                  <th className="px-6 py-3 font-bold">Envelope ID</th>
                  <th className="px-6 py-3 font-bold">Action</th>
                  <th className="px-6 py-3 font-bold">Reviewer Identity</th>
                  <th className="px-6 py-3 font-bold">Timestamp</th>
                  <th className="px-6 py-3 font-bold">Governance Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF1]">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#F8F8F7] transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[#7157F5] font-bold">#{log.id}</td>
                    <td className="px-6 py-3.5 font-mono text-[#17181C] font-bold">{log.envelope_id}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 rounded-[6px] bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-[10px] font-mono font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#17181C] font-semibold">{log.reviewer}</td>
                    <td className="px-6 py-3.5 font-mono text-[#667085] text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-[#344054] text-[11px] font-medium">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Navigation Footer */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-3.5 border-t border-[#ECEEF1] bg-[#FAFAF9] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-[#667085]">
              Showing <strong className="text-[#17181C] font-semibold">{(validCurrentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-[#17181C] font-semibold">
                {Math.min(validCurrentPage * pageSize, filteredLogs.length)}
              </strong>{' '}
              of <strong className="text-[#17181C] font-semibold">{filteredLogs.length}</strong> records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="w-8 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-xs transition-colors cursor-pointer shadow-2xs"
                title="First Page"
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="px-3 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
                <span>Prev</span>
              </button>

              <div className="px-3 py-1 font-mono text-xs font-bold text-[#17181C]">
                Page {validCurrentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-3 h-8 rounded-[8px] bg-white hover:bg-[#F2F4F7] text-[#344054] border border-[#E4E7EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <span>Next</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </button>

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
