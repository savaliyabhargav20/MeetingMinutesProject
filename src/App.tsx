import React, { useState, useEffect } from 'react';
import {
  Mic,
  Upload,
  FileText,
  ListChecks,
  AlignLeft,
  Sparkles,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { AudioUploader } from './components/AudioUploader';
import { AudioRecorder } from './components/AudioRecorder';
import { SampleRecordings, SAMPLE_MEETINGS } from './components/SampleRecordings';
import { MinutesViewer } from './components/MinutesViewer';
import { ActionItemsTable } from './components/ActionItemsTable';
import { TranscriptViewer } from './components/TranscriptViewer';
import { ExportModal } from './components/ExportModal';
import { MeetingMinutes, ActionItem, ProcessingState, SampleMeeting } from './types';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioInputMode, setAudioInputMode] = useState<'upload' | 'record' | 'paste'>('upload');
  const [pastedTranscript, setPastedTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('Executive Meeting Minutes');
  const [attendees, setAttendees] = useState('');

  // Processing status
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [activeTab, setActiveTab] = useState<'minutes' | 'actions' | 'transcript'>('minutes');
  const [showExportModal, setShowExportModal] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .catch(err => console.warn('Health check error:', err));
  }, []);

  const handleStartAnalysis = async () => {
    setErrorMessage(null);

    let rawTranscript = '';

    if (audioInputMode === 'paste') {
      if (!pastedTranscript.trim()) {
        setErrorMessage('Please enter or paste a meeting transcript first.');
        return;
      }
      rawTranscript = pastedTranscript.trim();
    } else {
      if (!selectedFile) {
        setErrorMessage('Please upload an audio recording or record audio first.');
        return;
      }
    }

    try {
      // Step 1: Transcription (if audio file provided)
      if (!rawTranscript && selectedFile) {
        setProcessingState('transcribing');
        setStatusMessage('Transcribing audio (Whisper / Gemini AI)...');

        const formData = new FormData();
        formData.append('audio', selectedFile);
        if (meetingTitle) formData.append('meetingTitle', meetingTitle);
        if (attendees) formData.append('attendees', attendees);

        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeRes.ok) {
          const errData = await transcribeRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Audio transcription encountered an issue');
        }

        const transcribeData = await transcribeRes.json();
        rawTranscript = transcribeData.transcript || '';
      }

      // Step 2: Summarization & Action Item Extraction
      setProcessingState('summarizing');
      setStatusMessage('Extracting executive summary & action items...');

      const summarizeRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: rawTranscript,
          meetingTitle: meetingTitle || 'Meeting Minutes',
          attendees: attendees || undefined,
        }),
      });

      if (!summarizeRes.ok) {
        const errData = await summarizeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate summary');
      }

      const summaryData = await summarizeRes.json();

      // Format action items with unique IDs
      const formattedActionItems: ActionItem[] = (summaryData.actionItems || []).map((item: any, i: number) => ({
        id: item.id || `task-${Date.now()}-${i}`,
        task: item.task || 'Action item',
        owner: item.owner || 'Unassigned',
        dueDate: item.dueDate || 'TBD',
        priority: item.priority || 'Medium',
        status: item.status || 'Pending'
      }));

      setMinutes({
        title: summaryData.title || meetingTitle || 'Executive Meeting Minutes',
        date: summaryData.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        attendees: attendees || summaryData.attendees,
        executiveSummary: summaryData.executiveSummary || '',
        keyDecisions: summaryData.keyDecisions || [],
        discussionTopics: summaryData.discussionTopics || [],
        actionItems: formattedActionItems,
        nextSteps: summaryData.nextSteps || [],
        transcript: rawTranscript
      });

      setProcessingState('complete');
      setActiveTab('minutes');

    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setProcessingState('error');
    }
  };

  const handleSelectSample = (sample: SampleMeeting) => {
    setAudioInputMode('paste');
    setPastedTranscript(sample.transcript);
    setMeetingTitle(sample.title);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPastedTranscript('');
    setMinutes(null);
    setProcessingState('idle');
    setErrorMessage(null);
  };

  const handleQuickDownloadDocx = async () => {
    if (!minutes) return;
    try {
      setDownloadingDocx(true);
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minutes),
      });

      if (!res.ok) throw new Error('Failed to generate Word document');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${minutes.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Minutes.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error downloading Word Doc: ' + err.message);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const isBusy = processingState === 'transcribing' || processingState === 'summarizing';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12" id="ai-minutes-pro-app">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-none">
                  AI Minutes Pro
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  Whisper & Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                Automatic Meeting Minutes, Action Items & Word Doc Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {minutes && (
              <>
                <button
                  type="button"
                  onClick={handleQuickDownloadDocx}
                  disabled={downloadingDocx}
                  id="btn-quick-download-docx"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                  title="Download Word Document (.docx)"
                >
                  {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download Word Doc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  id="btn-open-export-modal"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export...</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  id="btn-start-new-meeting"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Start New Meeting"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-rose-900">Processing Notice</h4>
              <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* If No Minutes Generated Yet: Input & Configuration Stage */}
        {!minutes && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Hero / Instruction Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
                  <Sparkles className="w-3.5 h-3.5" /> AI Meeting Secretary
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Turn Recordings into Actionable Minutes
                </h2>
                <p className="text-sm text-indigo-100 mt-2 max-w-xl leading-relaxed">
                  Upload audio from Zoom, Teams, or Google Meet. Our AI pipeline transcribes speech, extracts key decisions, assigns action item owners, and generates Word documents (.docx).
                </p>
              </div>
            </div>

            {/* Input Selection Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Optional Meeting Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Sprint & Product Alignment"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    disabled={isBusy}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attendees (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex, Sarah, David, Elena"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    disabled={isBusy}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mode Tabs */}
              <div>
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setAudioInputMode('upload')}
                    disabled={isBusy}
                    id="tab-mode-upload"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      audioInputMode === 'upload'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioInputMode('record')}
                    disabled={isBusy}
                    id="tab-mode-record"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      audioInputMode === 'record'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Live Mic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudioInputMode('paste')}
                    disabled={isBusy}
                    id="tab-mode-paste"
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      audioInputMode === 'paste'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Paste Transcript Text</span>
                  </button>
                </div>

                {/* Tab 1: Upload */}
                {audioInputMode === 'upload' && (
                  <AudioUploader
                    selectedFile={selectedFile}
                    onFileSelect={setSelectedFile}
                    disabled={isBusy}
                  />
                )}

                {/* Tab 2: Record */}
                {audioInputMode === 'record' && (
                  <AudioRecorder
                    onRecordingComplete={(file, liveText) => {
                      setSelectedFile(file);
                      if (liveText && liveText.trim()) {
                        setPastedTranscript(liveText.trim());
                      }
                      setAudioInputMode('upload');
                    }}
                    disabled={isBusy}
                  />
                )}

                {/* Tab 3: Paste Text */}
                {audioInputMode === 'paste' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Paste Meeting Transcript or Notes
                    </label>
                    <textarea
                      rows={7}
                      placeholder="Alex: Welcome everyone. Let's discuss our roadmap...&#10;Sarah: Database migration is completed...&#10;David: We'll deliver designs by Tuesday..."
                      value={pastedTranscript}
                      onChange={(e) => setPastedTranscript(e.target.value)}
                      disabled={isBusy}
                      className="w-full p-3 text-xs font-mono leading-relaxed border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                )}
              </div>

              {/* Progress / Status Display */}
              {isBusy && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 animate-pulse" id="analysis-progress-indicator">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                      {processingState === 'transcribing' ? 'Step 1 of 2: Whisper Transcription' : 'Step 2 of 2: AI Summarization & Action Extraction'}
                    </p>
                    <p className="text-xs text-indigo-700 mt-0.5">{statusMessage}</p>
                  </div>
                </div>
              )}

              {/* Main Submit Action */}
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={isBusy || (audioInputMode !== 'paste' && !selectedFile) || (audioInputMode === 'paste' && !pastedTranscript.trim())}
                id="btn-start-ai-analysis"
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Meeting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Meeting Minutes & Word Doc</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Presets */}
            <SampleRecordings
              onSelectSample={handleSelectSample}
              disabled={isBusy}
            />
          </div>
        )}

        {/* If Minutes Are Ready: Multi-tab Results View */}
        {minutes && (
          <div className="space-y-6">
            {/* Navigation Tabs Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('minutes')}
                  id="tab-view-minutes"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'minutes'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Executive Minutes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  id="tab-view-actions"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'actions'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Action Items ({minutes.actionItems.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  id="tab-view-transcript"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'transcript'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  <span>Full Transcript</span>
                </button>
              </div>

              {/* Direct Download Word Doc Banner Button */}
              <div className="flex items-center gap-2 px-2">
                <button
                  type="button"
                  onClick={handleQuickDownloadDocx}
                  disabled={downloadingDocx}
                  id="btn-download-docx-tab-bar"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {downloadingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Download .docx</span>
                </button>
              </div>
            </div>

            {/* Active Tab Content */}
            {activeTab === 'minutes' && (
              <MinutesViewer
                minutes={minutes}
                onUpdateMinutes={setMinutes}
              />
            )}

            {activeTab === 'actions' && (
              <ActionItemsTable
                actionItems={minutes.actionItems}
                onUpdateActionItems={(updatedItems) => {
                  setMinutes({
                    ...minutes,
                    actionItems: updatedItems
                  });
                }}
              />
            )}

            {activeTab === 'transcript' && (
              <TranscriptViewer
                transcript={minutes.transcript || 'No transcript text available.'}
                onUpdateTranscript={(newTranscript) => {
                  setMinutes({
                    ...minutes,
                    transcript: newTranscript
                  });
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Export Modal */}
      {showExportModal && minutes && (
        <ExportModal
          minutes={minutes}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
