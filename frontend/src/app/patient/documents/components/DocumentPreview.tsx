'use client';

import { FiX, FiDownload } from 'react-icons/fi';
import type { Document } from '../types';

interface DocumentPreviewProps {
  doc: Document;
  onClose: () => void;
}

export default function DocumentPreview({ doc, onClose }: DocumentPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h3 className="font-semibold text-slate-900">{doc.name}</h3>
            <p className="text-xs text-slate-500">
              Added on{' '}
              {doc.dateAdded.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <FiX className="size-6" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center bg-slate-50 p-12 text-center">
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-12">
            <p className="text-sm font-medium text-slate-600">Document Preview</p>
            <p className="mt-2 text-xs text-slate-500">
              {doc.type} • {doc.size.toFixed(1)} MB
            </p>
            <p className="mt-4 text-xs text-slate-400">
              This synthetic demo document cannot be displayed. In production, your documents would be securely previewed here.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 p-4">
          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <FiDownload className="size-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
