'use client';

import { useEffect } from 'react';
import { FiDownload, FiFileText, FiX } from 'react-icons/fi';
import { buttonClass, Pill } from '@/components/portal/ui';
import { useT } from '@/components/portal/LanguageContext';
import { CATEGORY_TONE, formatDocDate } from '../data';
import type { Document } from '../types';

export default function DocumentPreview({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 font-display backdrop-blur-sm" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={doc.name} className="flex max-h-[90vh] w-full max-w-2xl animate-fade-up flex-col overflow-hidden rounded-3xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">{doc.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Pill tone={CATEGORY_TONE[doc.category]}>{t(doc.category)}</Pill>
              <span>{doc.type} · {doc.size.toFixed(1)} MB · {t("Added {date}", { date: formatDocDate(doc.dateAdded) })}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={t("Close preview")} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><FiX className="size-5" /></button>
        </div>

        <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto bg-slate-50 p-6">
          {doc.url && doc.type !== 'PDF' ? (
            // eslint-disable-next-line @next/next/no-img-element -- the member's own file, served by the API
            <img src={doc.url} alt={doc.name} className="max-h-[60vh] rounded-xl object-contain shadow-soft" />
          ) : doc.url ? (
            <iframe src={doc.url} title={doc.name} className="h-[60vh] w-full rounded-xl bg-white" />
          ) : (
            <div className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-care-600 shadow-soft"><FiFileText className="size-7" /></span>
              <p className="mt-4 font-semibold text-slate-900">{t("Sample document")}</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">{t("This record has no stored file. Upload the document to preview and download it here.")}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-4">
          {doc.url ? <a href={doc.url} download={doc.name} className={buttonClass('secondary', 'flex-1')}><FiDownload />{t("Download")}</a> : <button type="button" disabled className={buttonClass('secondary', 'flex-1')}><FiDownload />{t("Download")}</button>}
          <button type="button" onClick={onClose} className={buttonClass('primary', 'flex-1')}>{t("Done")}</button>
        </div>
      </div>
    </div>
  );
}
