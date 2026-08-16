import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faCircleCheck,
  faHourglassHalf,
  faEnvelope,
  faLightbulb,
  faCalendarDay,
  faUsers,
  faTriangleExclamation,
  faQuoteLeft
} from '@fortawesome/free-solid-svg-icons';

export default function EnterpriseSummaryTab({ envelope }) {
  if (!envelope) return null;

  const { extractedSignals = [], stakeholderViewpoints = [], source = {} } = envelope;

  const confirmedCount = extractedSignals.filter(s => s.userStatus === 'CONFIRMED' || s.userStatus === 'EDITED').length;
  const pendingCount = extractedSignals.filter(s => !s.userStatus || s.userStatus === 'PENDING').length;
  const decisions = extractedSignals.filter(s => s.primaryCategory === 'DECISION');
  const deadlines = extractedSignals.filter(s => s.primaryCategory === 'DEADLINE');
  const risks = extractedSignals.filter(s => s.primaryCategory === 'RISK' || s.containsPotentialPII);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Executive KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Signals</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{extractedSignals.length}</div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-[12px] border border-emerald-200 shadow-xs">
          <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Confirmed Ready</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{confirmedCount}</div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-[12px] border border-amber-200 shadow-xs">
          <div className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{pendingCount}</div>
        </div>

        <div className="bg-indigo-50/70 p-4 rounded-[12px] border border-indigo-200 shadow-xs">
          <div className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider">Logical Thread</div>
          <div className="text-2xl font-extrabold text-indigo-800 mt-1">{source.logicalEmailCount || 10} Units</div>
        </div>
      </div>

      {/* Key Architectural Decisions & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
            <FontAwesomeIcon icon={faLightbulb} className="text-indigo-600" />
            <span>Key Decisions & Threshold Updates</span>
          </div>
          <ul className="space-y-2 text-xs">
            {decisions.length > 0 ? (
              decisions.map((d, i) => (
                <li key={i} className="bg-slate-50 p-3 rounded-[12px] border border-slate-200 text-slate-700 font-medium">
                  "{d.statement}"
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic py-2">No explicit decision signals flagged.</li>
            )}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
            <FontAwesomeIcon icon={faCalendarDay} className="text-purple-600" />
            <span>Project Milestones & Deadlines</span>
          </div>
          <ul className="space-y-2 text-xs">
            {deadlines.length > 0 ? (
              deadlines.map((d, i) => (
                <li key={i} className="bg-slate-50 p-3 rounded-[12px] border border-slate-200 text-slate-700 font-medium">
                  "{d.statement}"
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic py-2">No target deadlines identified.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Stakeholder Viewpoints Section */}
      <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
          <FontAwesomeIcon icon={faUsers} className="text-indigo-600" />
          <span>Stakeholder Viewpoint Perspectives (6 Enterprise Roles)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stakeholderViewpoints.map((vp, idx) => (
            <div key={idx} className="bg-slate-50 p-3.5 rounded-[12px] border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-indigo-700 text-xs">{vp.role}</div>
              <p className="text-slate-700 text-[11px] leading-relaxed">{vp.summary}</p>
              <div className="text-[10px] text-slate-500 bg-white p-2 rounded-[8px] border border-slate-200">
                <span className="font-bold text-slate-700">Key Concern:</span> {vp.keyConcerns[0] || 'Standard Operational Flow'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
