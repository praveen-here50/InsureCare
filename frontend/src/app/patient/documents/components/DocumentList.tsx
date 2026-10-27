'use client';

import { useState } from 'react';
import { FiDownload, FiEye, FiFileText, FiImage, FiSearch, FiTrash2 } from 'react-icons/fi';
import { IconBadge, Pill, Surface } from '@/components/portal/ui';
import { CATEGORY_TONE, formatDocDate } from '../data';
import type { Document } from '../types';
import DocumentPreview from './DocumentPreview';

interface DocumentListProps {
  documents: Document[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDelete: (doc: Document) => void;
}

const iconBtn = 'inline-flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export default function DocumentList({ documents, searchQuery, onSearchChange, onDelete }: DocumentListProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <Surface className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="relative w-full sm:max-w-sm">
          <span className="sr-only">Search documents</span>
          <FiSearch aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search documents"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:bg-white focus:ring-4 focus:ring-care-100"
          />
        </label>
        <p className="text-sm text-slate-400">{documents.length} {documents.length === 1 ? 'document' : 'documents'}</p>
      </div>

      {documents.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <IconBadge icon={FiFileText} className="mx-auto size-12" />
          <p className="mt-4 font-bold text-ink">No documents found</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or category, or upload a new document.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50/70 sm:px-5">
              <IconBadge icon={doc.type === 'PDF' ? FiFileText : FiImage} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{doc.type} · {doc.size.toFixed(1)} MB · Added {formatDocDate(doc.dateAdded)}</p>
              </div>
              <div className="hidden w-40 md:block"><Pill tone={CATEGORY_TONE[doc.category]}>{doc.category}</Pill></div>
              <div className="hidden w-28 lg:block">{doc.status === 'verified' ? <Pill tone="green" dot>Verified</Pill> : <Pill tone="amber" dot>In review</Pill>}</div>
              <div className="flex items-center gap-0.5">
                <button type="button" onClick={() => setSelectedDoc(doc)} className={iconBtn} aria-label={`Preview ${doc.name}`} title="Preview"><FiEye className="size-4" /></button>
                {doc.url ? (
                  <a href={doc.url} download={doc.name} className={iconBtn} aria-label={`Download ${doc.name}`} title="Download"><FiDownload className="size-4" /></a>
                ) : (
                  <button type="button" disabled className={iconBtn} aria-label={`Download ${doc.name}`} title="No stored file for this sample record"><FiDownload className="size-4" /></button>
                )}
                <button type="button" onClick={() => onDelete(doc)} className={`${iconBtn} hover:!bg-rose-50 hover:!text-rose-600`} aria-label={`Delete ${doc.name}`} title="Delete"><FiTrash2 className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedDoc && <DocumentPreview doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </Surface>
  );
}
