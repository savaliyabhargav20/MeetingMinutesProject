import React, { useRef, useState } from 'react';
import { Upload, Music, X, Play, Pause, AlertCircle } from 'lucide-react';

interface AudioUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  selectedFile,
  onFileSelect,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateAudioFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateAudioFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const validateAudioFile = (file: File) => {
    const validExtensions = ['.m4a', '.mp3', '.wav', '.webm', '.ogg', '.aac', '.mp4'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const isAudioType = file.type.startsWith('audio/') || file.type.startsWith('video/') || hasValidExt;
    
    if (!isAudioType) {
      alert('Please upload a valid audio file (.m4a, .mp3, .wav, .webm, .ogg)');
      return false;
    }
    return true;
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.m4a,.mp3,.wav,.webm,.ogg,.aac"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        id="audio-file-input"
      />

      {!selectedFile ? (
        <div
          id="upload-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/70'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Click to upload or drag & drop recording
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Supports Zoom, Teams & Google Meet recordings (M4A, MP3, WAV, WebM)
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
            <span>Max file size: 50MB</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm" id="selected-audio-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={togglePlayback}
                id="btn-toggle-audio-playback"
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
                title={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} • Ready for AI transcription
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                setIsPlaying(false);
                onFileSelect(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              id="btn-remove-audio"
              disabled={disabled}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remove audio file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <audio
            ref={audioRef}
            src={URL.createObjectURL(selectedFile)}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
