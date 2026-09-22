'use client';

import { useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';

interface UploadSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadSection({ open, onOpenChange }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Medical');

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="mb-8 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700"
      >
        <FiUploadCloud className="size-4" />
        Upload Document
      </button>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Upload Document</h3>
        <button
          onClick={() => onOpenChange(false)}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close"
        >
          <FiX className="size-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <FiUploadCloud className={`mx-auto size-10 ${dragActive ? 'text-teal-600' : 'text-slate-400'}`} />
          <p className="mt-2 font-medium text-slate-900">Drag and drop your document here</p>
          <p className="mt-1 text-sm text-slate-500">or click to browse</p>
          <p className="mt-2 text-xs text-slate-400">Supported: PDF, JPG, PNG (Max 10MB)</p>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Document Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
          >
            <option>Insurance</option>
            <option>Medical</option>
            <option>Government / KYC</option>
            <option>Prescriptions</option>
            <option>Reports</option>
            <option>Other</option>
          </select>
        </div>

        {/* Document Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Document Name</label>
          <input
            type="text"
            placeholder="e.g., Hospital Discharge Summary"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700">
            Upload Document
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
