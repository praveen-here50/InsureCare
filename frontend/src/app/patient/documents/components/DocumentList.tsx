'use client';

import { useState } from 'react';
import { FiSearch, FiDownload, FiEye, FiMoreHorizontal } from 'react-icons/fi';
import DocumentPreview from './DocumentPreview';
import DocumentActions from './DocumentActions';
import type { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
}

export default function DocumentList({ documents, searchQuery, onSearchChange, isLoading }: DocumentListProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [moreActionsOpen, setMoreActionsOpen] = useState<string | null>(null);

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Insurance':
        return 'bg-emerald-50 text-emerald-700';
      case 'Medical':
        return 'bg-blue-50 text-blue-700';
      case 'Government / KYC':
        return 'bg-amber-50 text-amber-700';
      case 'Prescriptions':
        return 'bg-purple-50 text-purple-700';
      case 'Reports':
        return 'bg-indigo-50 text-indigo-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Search Bar */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <FiSearch className="size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Document Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Document Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Date Added
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Size
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading documents...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No documents found. Try adjusting your filters or upload a new document.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getCategoryBadgeColor(doc.category)}`}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">
                      {doc.dateAdded.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600">{doc.size.toFixed(1)} MB</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDoc(doc);
                          setPreviewOpen(true);
                        }}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        title="Preview"
                      >
                        <FiEye className="size-4" />
                      </button>
                      <button className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Download">
                        <FiDownload className="size-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setMoreActionsOpen(moreActionsOpen === doc.id ? null : doc.id)}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title="More options"
                        >
                          <FiMoreHorizontal className="size-4" />
                        </button>
                        {moreActionsOpen === doc.id && (
                          <DocumentActions doc={doc} onClose={() => setMoreActionsOpen(null)} />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewOpen && selectedDoc && <DocumentPreview doc={selectedDoc} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
