'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Link as LinkIcon, AlertCircle, CheckCircle2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import CatchImage from './CatchImage';

interface CatchImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export default function CatchImageUploader({
  value,
  onChange,
  className = '',
}: CatchImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(value && value.startsWith('http') ? value : '');
  const [urlError, setUrlError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please select a JPG, PNG, or WebP photo.');
      return;
    }

    // Validate size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/fisherman/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed. Please try again.');
      }

      setUploadSuccess('Catch photo uploaded successfully!');
      onChange(data.url);
      setUrlInput(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Network error during image upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setUrlError(null);

    if (!val.trim()) {
      onChange('');
      return;
    }

    // Must be secure HTTPS URL
    if (!val.startsWith('https://')) {
      setUrlError('Please enter a secure HTTPS URL (starting with https://).');
      return;
    }

    try {
      new URL(val);
      onChange(val.trim());
    } catch {
      setUrlError('Please enter a valid, well-formed HTTPS URL.');
    }
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setUploadError(null);
    setUploadSuccess(null);
    setUrlError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode Toggle Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-teal-600 dark:text-[#00D2C4]" />
          Catch Photo <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-1 bg-[var(--surface-elevated)] p-0.5 rounded-lg border border-[var(--border)] text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-[var(--surface)] text-teal-600 dark:text-[#00D2C4] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-[var(--surface)] text-teal-600 dark:text-[#00D2C4] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-[#00D2C4] bg-teal-500/5'
                : 'border-[var(--border)] hover:border-teal-500/40 bg-[var(--surface-elevated)]/50'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <Loader2 className="w-7 h-7 text-[#00D2C4] animate-spin" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  Uploading catch photo to storage...
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">Optimizing and storing asset</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-[#00D2C4] flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    Click to select or drag & drop catch photo
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    JPG, PNG, or WebP up to 5 MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
            {urlInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {urlError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          <p className="text-[11px] text-[var(--text-secondary)]">
            Tip: You can use high-resolution seafood photos hosted on secure HTTPS domains (e.g. Unsplash, Supabase Storage).
          </p>
        </div>
      )}

      {/* Live Preview Card */}
      {value && (
        <div className="flex items-center justify-between p-3 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface)] flex-shrink-0 border border-[var(--border)]">
              <CatchImage
                src={value}
                alt="Catch photo preview"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[var(--text-primary)] block">Catch Photo Attached</span>
              <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-xs block font-mono">
                {value.length > 50 ? value.substring(0, 47) + '...' : value}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                ✓ Ready for marketplace display
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
