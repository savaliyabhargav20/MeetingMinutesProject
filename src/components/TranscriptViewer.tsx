import React, { useState } from 'react';
import { AlignLeft, Search, Copy, Check, Edit3, Save } from 'lucide-react';

interface TranscriptViewerProps {
  transcript: string;
  onUpdateTranscript?: (newTranscript: string) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  onUpdateTranscript
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState(transcript);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onUpdateTranscript) {
      onUpdateTranscript(editableText);
    }
    setIsEditing(false);
  };

  const lines = transcript.split('\n').filter(line => line.trim().length > 0);

  const filteredLines = searchQuery.trim()
    ? lines.filter(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="transcript-viewer">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-indigo-600" />
            Full Audio Transcript
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Original Whisper / Gemini transcription with speaker tags
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditableText(transcript);
                  setIsEditing(true);
                }}
                id="btn-edit-transcript"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                title="Edit transcript text"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                id="btn-copy-raw-transcript"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          className="w-full p-4 text-sm font-mono leading-relaxed bg-slate-50 border border-slate-300 rounded-lg min-h-[300px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredLines.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No transcript lines match your search.</p>
          ) : (
            filteredLines.map((line, idx) => {
              const colonIndex = line.indexOf(':');
              const hasSpeaker = colonIndex > 0 && colonIndex < 35;
              const speaker = hasSpeaker ? line.substring(0, colonIndex) : null;
              const text = hasSpeaker ? line.substring(colonIndex + 1).trim() : line;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/20 border border-slate-100 transition-colors text-sm"
                >
                  {speaker ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-semibold text-xs text-indigo-700 uppercase tracking-wide bg-indigo-50/80 px-2 py-0.5 rounded shrink-0">
                        {speaker}
                      </span>
                      <span className="text-slate-800 leading-relaxed">{text}</span>
                    </div>
                  ) : (
                    <p className="text-slate-800 leading-relaxed">{text}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
