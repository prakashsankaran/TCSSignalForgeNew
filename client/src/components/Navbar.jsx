import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlask,
  faShieldHalved,
  faSpinner,
  faHouse,
  faTableColumns,
  faTowerBroadcast,
  faClipboardCheck,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar({
  activeView,
  setActiveView,
  onIngestSample,
  loading,
  currentEnvelope,
  pollerStatus = {}
}) {
  const navItems = [
    { id: 'HOME', label: 'Home', icon: faHouse },
    { id: 'WORKSPACE', label: 'Dual-Pane Review', icon: faTableColumns },
    { id: 'POLLER', label: 'Autonomous Listener', icon: faTowerBroadcast, badge: pollerStatus.isPolling },
    { id: 'AUDIT', label: 'Audit Ledger', icon: faClipboardCheck },
    { id: 'SUMMARY', label: 'Executive Insights', icon: faChartPie }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ECEEF1] px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between select-none">
      {/* Left: SignalForge Brand Logo from /branding */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setActiveView('HOME')}
        title="SignalForge Home"
      >
        <img
          src="/branding/SignalForge_FullLogo_4K.png"
          alt="SignalForge"
          className="h-9 sm:h-10 md:h-11 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
        />
      </div>

      {/* Center: Navigation Menu Links */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'text-[#17181C] bg-[#F4F1FF]/70 font-bold'
                  : 'text-[#667085] hover:text-[#17181C] hover:bg-[#F8F8F7]'
              }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`text-xs ${isActive ? 'text-[#7157F5]' : 'text-[#98A2B3]'}`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#7157F5]" />
              )}
              {item.badge && !isActive && (
                <span className="w-2 h-2 rounded-full bg-[#15966A] animate-pulse" title="Listener Active" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Active Payload Status & Refined Action Button */}
      <div className="flex items-center gap-3">
        {currentEnvelope ? (
          <button
            onClick={() => setActiveView('WORKSPACE')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-xs font-mono font-bold hover:bg-[#D1FADF] transition-colors cursor-pointer"
            title="Click to view in Dual-Pane Workspace"
          >
            <FontAwesomeIcon icon={faShieldHalved} className="text-[#067647] text-[10px]" />
            <span>{currentEnvelope.envelopeId}</span>
          </button>
        ) : (
          <span className="hidden sm:inline text-xs font-medium text-[#667085]">
            Ready for Ingestion
          </span>
        )}

        {/* Refined Secondary Action Button */}
        <button
          onClick={onIngestSample}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[#F4F1FF] hover:bg-[#ECE6FF] text-[#5F46D8] border border-[#E4DCFF] text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
        >
          <FontAwesomeIcon icon={loading ? faSpinner : faFlask} className={loading ? 'animate-spin' : 'text-[#7157F5]'} />
          <span>Load Sample Data</span>
        </button>
      </div>
    </header>
  );
}
