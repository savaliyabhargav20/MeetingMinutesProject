import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (file: File, liveTranscript?: string) => void;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  disabled
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setPermissionError(null);
    setRecordedBlob(null);
    setLiveTranscript('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200); // 200ms slice
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript + ' ';
            }
            setLiveTranscript(fullText.trim());
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition notice:', e?.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Speech recognition initialization skipped:', e);
        }
      }

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setPermissionError('Microphone permission denied or not available. Please allow microphone access in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleUseRecording = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `meeting_recording_${Date.now()}.webm`, {
      type: recordedBlob.type || 'audio/webm',
    });
    onRecordingComplete(file, liveTranscript);
    // Reset state
    setRecordedBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setLiveTranscript('');
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setLiveTranscript('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="audio-recorder-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
          <h4 className="text-sm font-semibold text-slate-800">
            {isRecording ? 'Recording Live Meeting...' : 'Record In-Person or Live Audio'}
          </h4>
        </div>
        <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {formatTime(recordingTime)}
        </span>
      </div>

      {permissionError && (
        <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Dynamic Visualizer Bar & Live Caption */}
      {isRecording && (
        <div className="my-3 space-y-2">
          <div className="py-2 flex items-center justify-center gap-1.5 h-10 bg-slate-50 rounded-lg">
            {[40, 70, 30, 90, 50, 80, 45, 95, 60, 35, 85, 40].map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-indigo-500 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s',
                }}
              />
            ))}
          </div>

          {liveTranscript && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg">
              <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                Live Speech Recognition:
              </p>
              <p className="text-xs text-slate-800 italic leading-relaxed">
                "{liveTranscript}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recorded Audio Preview */}
      {audioUrl && !isRecording && (
        <div className="my-3 space-y-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <audio controls src={audioUrl} className="w-full h-8" />
          </div>
          {liveTranscript && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Detected Live Speech Preview:
              </span>
              <p className="text-xs text-slate-700 italic">{liveTranscript}</p>
            </div>
          )}
        </div>
      )}

      {/* Control Actions */}
      <div className="flex items-center gap-2 mt-2">
        {!isRecording && !recordedBlob && (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            id="btn-start-record"
            className="flex-1 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Mic className="w-4 h-4" />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            id="btn-stop-record"
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Stop Recording</span>
          </button>
        )}

        {recordedBlob && !isRecording && (
          <>
            <button
              type="button"
              onClick={handleUseRecording}
              id="btn-use-recorded-audio"
              className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Use Recorded Audio</span>
            </button>
            <button
              type="button"
              onClick={resetRecording}
              id="btn-reset-record"
              className="p-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Record again"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
