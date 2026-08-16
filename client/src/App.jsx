import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import DualPaneReview from './components/DualPaneReview';
import InfoBanner from './components/InfoBanner';
import AutonomousListenerView from './components/AutonomousListenerView';
import AuditLedgerView from './components/AuditLedgerView';
import ExecutiveInsightsView from './components/ExecutiveInsightsView';
import FileUploadModal from './components/FileUploadModal';
import { API_BASE_URL } from './config';

export default function App() {
  const [currentEnvelope, setCurrentEnvelope] = useState(null);
  const [envelopesList, setEnvelopesList] = useState([]);
  const [activeView, setActiveView] = useState('HOME'); // 'HOME', 'WORKSPACE', 'POLLER', 'AUDIT', 'SUMMARY'
  const [loading, setLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const [pollerStatus, setPollerStatus] = useState({
    isPolling: false,
    pollFrequencyMs: 30000,
    lastPollTime: null,
    lastPollStatus: 'Idle',
    newIngestedCount: 0
  });

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch list of stored envelopes & poller status on startup (without auto-loading sample data)
  useEffect(() => {
    fetchEnvelopesList();
    fetchPollerStatus();

    // Poll status updates every 10s
    const timer = setInterval(() => {
      fetchPollerStatus();
      fetchEnvelopesList();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchEnvelopesList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/envelopes`);
      const data = await res.json();
      setEnvelopesList(data || []);
    } catch (e) {
      console.error('Failed to fetch envelopes list:', e);
    }
  };

  const fetchPollerStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/poller/status`);
      const data = await res.json();
      setPollerStatus(data);
    } catch (e) {
      console.error('Failed to fetch poller status:', e);
    }
  };

  const handleSelectEnvelope = async (envelopeId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load envelope.');
      setCurrentEnvelope(data);
      showToast(`Loaded payload ${envelopeId}`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnvelope = async (envelopeId) => {
    if (!envelopeId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/envelopes/${envelopeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete envelope.');
      
      showToast(`Envelope ${envelopeId} deleted.`, 'info');
      await fetchEnvelopesList();

      if (currentEnvelope && currentEnvelope.envelopeId === envelopeId) {
        // Load next envelope or sample
        const remaining = envelopesList.filter(e => e.envelope_id !== envelopeId);
        if (remaining.length > 0) {
          handleSelectEnvelope(remaining[0].envelope_id);
        } else {
          setCurrentEnvelope(null);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/envelopes`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear database.');
      setCurrentEnvelope(null);
      setEnvelopesList([]);
      showToast('Database reset: All envelopes cleared.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleIngestSample = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/sample`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sample data.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast('Sample Data (1 physical message, 10 logical emails, 1 summary section) loaded!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestGmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/gmail`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        const errText = (data.error || '').toLowerCase();
        if (errText.includes('sign in with google') || errText.includes('invalid credentials') || errText.includes('invalid_grant') || errText.includes('expired') || errText.includes('no oauth tokens') || errText.includes('permission') || errText.includes('scope')) {
          const authRes = await fetch(`${API_BASE_URL}/api/auth/google/url`);
          const authData = await authRes.json();
          if (authData.url) {
            showToast('Redirecting to Google OAuth Sign-in...', 'info');
            window.location.href = authData.url;
            return;
          }
        }
        throw new Error(data.error || 'Gmail Ingestion Failed.');
      }
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast('Gmail candidate thread ingested successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestMeet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/meet`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google Meet Ingestion Failed.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast('Google Meet conference transcript ingested and classified!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestSlack = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/slack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: 'C0849201', tagFilter: 'FrugalForge-Candidate' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Slack Ingestion Failed.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast('Slack conversation thread (#FrugalForge-Candidate) ingested and classified!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestJira = async (issueKey = 'PROJ-1024') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/jira`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Jira Ingestion Failed.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast(`Jira story "${data.envelope?.envelopeId}" ingested and classified!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIngestConfluence = async (pageId = 'CONF-ARCH-882') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/confluence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Confluence Ingestion Failed.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast(`Confluence specification "${data.envelope?.envelopeId}" ingested and classified!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (file, channelHint = 'AUTO') => {
    setLoading(true);
    const formData = new FormData();
    formData.append('transcriptFile', file);
    if (channelHint && channelHint !== 'AUTO') {
      formData.append('channel', channelHint);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/ingest/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document upload ingestion failed.');
      setCurrentEnvelope(data.envelope);
      fetchEnvelopesList();
      setActiveView('WORKSPACE');
      showToast(`Document "${file.name}" (${data.envelope?.source?.connectorMode || 'UPLOAD'}) ingested and classified!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePoller = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/poller/toggle`, { method: 'POST' });
      const data = await res.json();
      setPollerStatus(data);
      showToast(`Autonomous Gmail Listener is now ${data.isPolling ? 'ACTIVE' : 'STOPPED'}`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleManualPoll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/poller/poll`, { method: 'POST' });
      const data = await res.json();
      setPollerStatus(data);
      fetchEnvelopesList();
      showToast(`Poll complete: ${data.lastPollStatus}`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSignal = (signalId, updates) => {
    setCurrentEnvelope(prev => {
      if (!prev) return prev;
      const updatedSignals = (prev.extractedSignals || []).map(s => {
        if (s.signalId === signalId) {
          return { ...s, ...updates };
        }
        return s;
      });
      return {
        ...prev,
        extractedSignals: updatedSignals
      };
    });
  };

  const handleBatchUpdateSignals = (signalIds, updates) => {
    setCurrentEnvelope(prev => {
      if (!prev) return prev;
      const idSet = new Set(signalIds);
      const updatedSignals = (prev.extractedSignals || []).map(s => {
        if (idSet.has(s.signalId)) {
          return { ...s, ...updates };
        }
        return s;
      });
      return {
        ...prev,
        extractedSignals: updatedSignals
      };
    });
  };

  const handleDeleteSignal = (signalId) => {
    if (!currentEnvelope) return;

    const remainingSignals = currentEnvelope.extractedSignals.filter(s => s.signalId !== signalId);
    setCurrentEnvelope({
      ...currentEnvelope,
      extractedSignals: remainingSignals
    });
    showToast(`Signal ${signalId} deleted.`, 'info');
  };

  const handleCommitReview = async (reviewGatePayload) => {
    if (!currentEnvelope) return;

    const signalUpdates = currentEnvelope.extractedSignals.map(s => ({
      signalId: s.signalId,
      userStatus: s.userStatus || 'PENDING',
      editedStatement: s.editedStatement,
      primaryCategory: s.primaryCategory
    }));

    const body = {
      ...reviewGatePayload,
      signalUpdates
    };

    const res = await fetch(`${API_BASE_URL}/api/envelopes/${currentEnvelope.envelopeId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Review Gate Commitment Failed.');
    }

    setCurrentEnvelope(data.envelope);
    fetchEnvelopesList();
    showToast('Statement-Level Review Gate successfully verified & committed!', 'success');
  };

  const handleDownloadJSON = () => {
    if (!currentEnvelope) return;
    window.open(`${API_BASE_URL}/api/envelopes/${currentEnvelope.envelopeId}/export/json`, '_blank');
  };

  const handleDownloadMD = () => {
    if (!currentEnvelope) return;
    window.open(`${API_BASE_URL}/api/envelopes/${currentEnvelope.envelopeId}/export/md`, '_blank');
  };

  const handlePublishToFrugalForge = async () => {
    if (!currentEnvelope) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/signals/${currentEnvelope.envelopeId}/publish/frugalforge`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish signal to ValueThread.');
      const importId = data.importId || data.result?.importId || data.envelopeId || 'IMP-SIG-OK';
      showToast(`✅ Published to ValueThread Signal Inbox! Import ID: ${importId}`, 'success');
      handleSelectEnvelope(currentEnvelope.envelopeId);
    } catch (err) {
      showToast(`❌ Publication Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#17181C] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-[12px] border shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all animate-bounce ${
            notification.type === 'error'
              ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3] shadow-rose-500/10'
              : 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6] shadow-emerald-500/10'
          }`}
        >
          <FontAwesomeIcon
            icon={notification.type === 'error' ? faCircleExclamation : faCircleCheck}
            className={notification.type === 'error' ? 'text-[#E11D48]' : 'text-[#15966A]'}
          />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Shared Sticky Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onIngestSample={handleIngestSample}
        loading={loading}
        currentEnvelope={currentEnvelope}
        pollerStatus={pollerStatus}
      />

      {/* Main Page Routing Container */}
      <main className={`flex-1 w-full flex flex-col ${activeView === 'HOME' ? 'p-0' : 'px-4 sm:px-8 lg:px-12 py-6'}`}>
        {activeView === 'HOME' && (
          <HomePage
            setActiveView={setActiveView}
            onIngestSample={handleIngestSample}
            onOpenUpload={() => setUploadOpen(true)}
            onIngestGmail={handleIngestGmail}
            onIngestMeet={handleIngestMeet}
            onIngestSlack={handleIngestSlack}
            onIngestJira={handleIngestJira}
            onIngestConfluence={handleIngestConfluence}
            loading={loading}
          />
        )}

        {activeView === 'WORKSPACE' && (
          <div className="w-full flex-1 flex flex-col space-y-4">
            {/* Header with active thread switcher and Delete Thread action */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h1 className="text-xl font-bold text-[#17181C] tracking-tight">
                  Dual-Pane Review & Governance Workspace
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  Statement-level verification with raw line citations and cryptographic integrity
                </p>
              </div>

              {/* Thread Selector & Delete Controls */}
              <div className="flex items-center gap-2.5">
                {envelopesList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#667085] hidden sm:inline">Active Thread:</span>
                    <select
                      value={currentEnvelope ? currentEnvelope.envelopeId : ''}
                      onChange={e => handleSelectEnvelope(e.target.value)}
                      className="bg-white border border-[#E4E7EC] rounded-[10px] px-3 py-2 text-xs text-[#17181C] font-mono font-bold shadow-2xs cursor-pointer focus:outline-none focus:border-[#7157F5]"
                    >
                      <option value="" disabled={!!currentEnvelope}>
                        {currentEnvelope ? 'Switch Thread...' : '-- Select Ingested Thread --'}
                      </option>
                      {envelopesList.map(env => (
                        <option key={env.envelope_id} value={env.envelope_id}>
                          {env.envelope_id} ({env.source_type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentEnvelope && (
                  <button
                    onClick={() => handleDeleteEnvelope(currentEnvelope.envelopeId)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF1F2] text-[#9F1239] hover:text-[#E11D48] border border-[#E4E7EC] hover:border-[#FECDD3] rounded-[10px] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title="Delete this entire thread and envelope"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                    <span className="hidden sm:inline">Delete Thread</span>
                  </button>
                )}
              </div>
            </div>

            {/* Architecture Metrics Info Banner */}
            {currentEnvelope && <InfoBanner source={currentEnvelope.source} />}

            {/* Full-Height, Full-Width Dual-Pane Review */}
            <DualPaneReview
              envelope={currentEnvelope}
              onUpdateSignal={handleUpdateSignal}
              onBatchUpdateSignals={handleBatchUpdateSignals}
              onDeleteSignal={handleDeleteSignal}
              onCommitReview={handleCommitReview}
              onDownloadJSON={handleDownloadJSON}
              onDownloadMD={handleDownloadMD}
              onPublishFrugalForge={handlePublishToFrugalForge}
              onIngestGmail={handleIngestGmail}
              onIngestSlack={handleIngestSlack}
              onIngestMeet={handleIngestMeet}
              onIngestJira={handleIngestJira}
              onIngestConfluence={handleIngestConfluence}
              onIngestSample={handleIngestSample}
              onOpenUpload={() => setUploadOpen(true)}
              envelopesList={envelopesList}
              onSelectEnvelope={handleSelectEnvelope}
              loading={loading}
            />
          </div>
        )}

        {activeView === 'POLLER' && (
          <AutonomousListenerView
            pollerStatus={pollerStatus}
            onTogglePoller={handleTogglePoller}
            onManualPoll={handleManualPoll}
            envelopesList={envelopesList}
            onSelectEnvelope={handleSelectEnvelope}
            setActiveView={setActiveView}
            loading={loading}
          />
        )}

        {activeView === 'AUDIT' && (
          <AuditLedgerView />
        )}

        {activeView === 'SUMMARY' && (
          <ExecutiveInsightsView
            envelope={currentEnvelope}
            onPublishFrugalForge={handlePublishToFrugalForge}
            setActiveView={setActiveView}
          />
        )}
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadFile={handleUploadFile}
        loading={loading}
      />
    </div>
  );
}
