'use client';

import { useRef, useState } from 'react';
import { FiCheckCircle, FiFile, FiLock, FiUploadCloud, FiX } from 'react-icons/fi';
import { cn } from '@/lib/cn';
import { buttonClass, Surface } from '@/components/portal/ui';
import { send } from '@/lib/api';
import { MEMBER_REF } from '../../portal';
import { ACCEPTED_TYPES, CATEGORIES, MAX_SIZE_MB } from '../data';
import type { DocumentCategory } from '../types';

interface UploadSectionProps {
  onUploaded: () => void;
  onClose: () => void;
}

const fieldClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:ring-4 focus:ring-care-100';

/** Picks a file and uploads it to the member's document vault on the backend. */
export default function UploadSection({ onUploaded, onClose }: UploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('Medical');
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type)) { setError('Please choose a PDF, JPG or PNG file.'); return; }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) { setError(`That file is larger than ${MAX_SIZE_MB} MB.`); return; }
    setError(null);
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Choose a file to upload.'); return; }
    const form = new FormData();
    form.append('file', file);
    form.append('name', name.trim() || file.name);
    form.append('category', category);
    setUploading(true);
    try {
      await send('POST', `/api/members/${MEMBER_REF}/documents`, form);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Surface className="animate-fade-up p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink">Upload a document</h2>
          <p className="mt-0.5 text-sm text-slate-500">Add a report, bill or prescription to your vault.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label="Close upload"><FiX className="size-5" /></button>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); pick(e.dataTransfer.files[0]); }}
          className={cn('flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition', dragActive ? 'border-care-400 bg-care-50' : file ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/70 hover:border-care-300 hover:bg-care-50/40')}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          {file ? (
            <>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><FiCheckCircle className="size-6" /></span>
              <p className="mt-4 flex max-w-full items-center gap-2 truncate font-bold text-ink"><FiFile className="shrink-0" /><span className="truncate">{file.name}</span></p>
              <p className="mt-1 text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB · click to choose another</p>
            </>
          ) : (
            <>
              <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-care-600 shadow-soft"><FiUploadCloud className="size-6" /></span>
              <p className="mt-4 font-bold text-ink">Drag and drop your file here</p>
              <p className="mt-1 text-sm text-slate-500">or <span className="font-semibold text-care-600">browse from your device</span></p>
              <p className="mt-3 text-xs text-slate-400">PDF, JPG or PNG · up to {MAX_SIZE_MB} MB</p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <label className="block text-sm font-semibold text-slate-700">
            Document name
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Discharge summary" className={fieldClass} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} className={fieldClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-400"><FiLock className="mt-0.5 shrink-0" />Files are stored securely in your InsureCare document vault.</p>
          <div className="mt-auto flex gap-3">
            <button type="button" onClick={onClose} className={buttonClass('secondary', 'flex-1')}>Cancel</button>
            <button type="submit" disabled={uploading} className={buttonClass('primary', 'flex-1')}>{uploading ? 'Uploading…' : 'Add document'}</button>
          </div>
        </div>
      </form>
    </Surface>
  );
}
