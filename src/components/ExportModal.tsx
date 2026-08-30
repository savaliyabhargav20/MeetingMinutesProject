import React, { useState } from 'react';
import { Download, FileText, FileCode, Check, Loader2, Printer, Share2 } from 'lucide-react';
import { MeetingMinutes } from '../types';

interface ExportModalProps {
  minutes: MeetingMinutes;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  minutes,
  onClose
}) => {
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const handleDownloadDocx = async () => {
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
      console.error('Docx download error:', err);
      alert('Error generating Word document: ' + err.message);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const getMarkdownContent = () => {
    return `# ${minutes.title}
**Date:** ${minutes.date}
${minutes.attendees ? `**Attendees:** ${minutes.attendees}\n` : ''}
---

## 1. Executive Summary
${minutes.executiveSummary}

---

## 2. Key Decisions
${minutes.keyDecisions.map(d => `- ${d}`).join('\n')}

---

## 3. Action Items & Deliverables

| Task | Owner | Due Date | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
${minutes.actionItems.map(a => `| ${a.task} | ${a.owner} | ${a.dueDate} | ${a.priority} | ${a.status} |`).join('\n')}

---

## 4. Discussion Details
${minutes.discussionTopics.map(t => `### ${t.topic}\n${t.summary}`).join('\n\n')}

---

## 5. Next Steps
${minutes.nextSteps.map(s => `- ${s}`).join('\n')}

---
*Generated with AI Minutes Pro*
`;
  };

  const handleDownloadMarkdown = () => {
    const md = getMarkdownContent();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${minutes.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Minutes.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(getMarkdownContent());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200" id="export-modal-dialog">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Export Meeting Minutes</h3>
            <p className="text-xs text-slate-500">Download formatted files or copy directly</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 my-4">
          {/* Primary Word Doc (.docx) */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            id="btn-download-docx-modal"
            className="w-full p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                {downloadingDocx ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                  Microsoft Word Document (.docx)
                </h4>
                <p className="text-xs text-slate-500">
                  Formatted tables, headings, and executive summary
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-indigo-600 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Markdown (.md) */}
          <button
            type="button"
            onClick={handleDownloadMarkdown}
            id="btn-download-markdown-modal"
            className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Markdown File (.md)
                </h4>
                <p className="text-xs text-slate-500">
                  Ideal for Notion, GitHub, Obsidian & Jira
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            id="btn-print-minutes"
            className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Print or Save as PDF
                </h4>
                <p className="text-xs text-slate-500">
                  Use browser print dialog to generate PDF
                </p>
              </div>
            </div>
            <Share2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            id="btn-copy-md-clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedMd ? 'Copied Markdown' : 'Copy Markdown Text'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
