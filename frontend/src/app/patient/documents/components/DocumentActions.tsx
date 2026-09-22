'use client';

import { FiShare2, FiTrash2, FiArchive } from 'react-icons/fi';
import type { Document } from '../types';

interface DocumentActionsProps {
  doc: Document;
  onClose: () => void;
}

export default function DocumentActions({ doc, onClose }: DocumentActionsProps) {
  return (
    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
      <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
        <FiShare2 className="size-4" />
        Share Document
      </button>
      <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
        <FiArchive className="size-4" />
        Archive
      </button>
      <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
        <FiTrash2 className="size-4" />
        Delete
      </button>
    </div>
  );
}
