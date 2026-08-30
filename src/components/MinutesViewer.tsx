import React, { useState } from 'react';
import { FileText, CheckCircle2, MessageSquare, ArrowRight, Copy, Check, Edit2, FileDown } from 'lucide-react';
import { MeetingMinutes } from '../types';
import { exportMeetingMinutesToPdf } from '../utils/pdfExport';

interface MinutesViewerProps {
  minutes: MeetingMinutes;
  onUpdateMinutes?: (updated: MeetingMinutes) => void;
  onOpenExport?: () => void;
}

export const MinutesViewer: React.FC<MinutesViewerProps> = ({
  minutes,
  onUpdateMinutes,
  onOpenExport
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editableSummary, setEditableSummary] = useState(minutes.executiveSummary);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleCopy = () => {
    const text = `
# ${minutes.title || 'Meeting Minutes'}
Date: ${minutes.date || new Date().toLocaleDateString()}
${minutes.attendees ? `Attendees: ${minutes.attendees}\n` : ''}

## Executive Summary
${minutes.executiveSummary}

## Key Decisions
${(minutes.keyDecisions || []).map(d => `- ${d}`).join('\n')}

## Discussion Details
${(minutes.discussionTopics || []).map(t => `### ${t.topic}\n${t.summary}`).join('\n\n')}

## Action Items
${(minutes.actionItems || []).map(a => `- [${a.status}] ${a.task} (Owner: ${a.owner}, Due: ${a.dueDate}, Priority: ${a.priority})`).join('\n')}

## Next Steps
${(minutes.nextSteps || []).map(s => `- ${s}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    try {
      setDownloadingPdf(true);
      exportMeetingMinutesToPdf(minutes);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert('Error exporting PDF: ' + err.message);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 600);
    }
  };

  const handleSaveSummary = () => {
    if (onUpdateMinutes) {
      onUpdateMinutes({
        ...minutes,
        executiveSummary: editableSummary
      });
    }
    setIsEditingSummary(false);
  };

  return (
    <div className="space-y-6" id="minutes-viewer">
      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Official Meeting Minutes
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                PDF Ready
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {minutes.title || 'Executive Meeting'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Date: <span className="font-medium text-slate-700">{minutes.date}</span>
              {minutes.attendees && (
                <> • Attendees: <span className="font-medium text-slate-700">{minutes.attendees}</span></>
              )}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Direct 1-Click PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              id="btn-quick-download-pdf"
              title="Download clean formatted PDF document"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {onOpenExport && (
              <button
                type="button"
                onClick={onOpenExport}
                id="btn-open-export-formats"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                <span>Export Options</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              id="btn-copy-minutes-summary"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              1. Executive Summary
            </h3>
            {!isEditingSummary ? (
              <button
                type="button"
                onClick={() => setIsEditingSummary(true)}
                id="btn-edit-summary"
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSummary}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditableSummary(minutes.executiveSummary);
                    setIsEditingSummary(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingSummary ? (
            <textarea
              value={editableSummary}
              onChange={(e) => setEditableSummary(e.target.value)}
              className="w-full p-3 text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[120px]"
            />
          ) : (
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/60 rounded-lg p-4 border border-slate-100 whitespace-pre-line">
              {minutes.executiveSummary}
            </div>
          )}
        </div>
      </div>

      {/* Key Decisions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          2. Key Decisions Made
        </h3>
        <ul className="space-y-2.5">
          {minutes.keyDecisions && minutes.keyDecisions.length > 0 ? (
            minutes.keyDecisions.map((decision, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-sm text-slate-800 leading-normal"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1">{decision}</span>
              </li>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No explicit decisions recorded.</p>
          )}
        </ul>
      </div>

      {/* Discussion Breakdown */}
      {minutes.discussionTopics && minutes.discussionTopics.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            3. Discussion Topics & Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {minutes.discussionTopics.map((topic, i) => (
              <div key={i} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <h4 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  {topic.topic}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {topic.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {minutes.nextSteps && minutes.nextSteps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-3">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            4. Next Steps
          </h3>
          <div className="space-y-2">
            {minutes.nextSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
