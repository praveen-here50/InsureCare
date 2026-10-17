'use client';

import { FiActivity, FiFileText, FiHeart, FiShield, FiUserCheck } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import type { Document, DocumentCategory } from '../types';

type Category = { label: DocumentCategory | 'All Documents'; icon: IconType; tone: string };

const CATEGORIES: Category[] = [
  { label: 'All Documents', icon: FiFileText, tone: 'teal' },
  { label: 'Insurance', icon: FiShield, tone: 'emerald' },
  { label: 'Medical', icon: FiHeart, tone: 'blue' },
  { label: 'Government / KYC', icon: FiUserCheck, tone: 'amber' },
  { label: 'Prescriptions', icon: FiActivity, tone: 'violet' },
  { label: 'Reports', icon: FiFileText, tone: 'indigo' },
  { label: 'Other', icon: FiFileText, tone: 'slate' },
];

interface DocumentCategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function DocumentCategories({ selectedCategory, onSelectCategory, documents = [] }: DocumentCategoriesProps & { documents?: Document[] }) {
  return (
    <section className="mb-8" aria-labelledby="document-categories-heading">
      <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Organize your care records</p><h2 id="document-categories-heading" className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Browse by category</h2></div><span className="hidden text-xs text-slate-500 sm:block">{documents.length} documents</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {CATEGORIES.map(({ label, icon: Icon, tone }) => {
          const active = label === 'All Documents' ? selectedCategory === null : selectedCategory === label;
          const count = label === 'All Documents' ? documents.length : documents.filter((document) => document.category === label).length;
          const toneClass = { teal: 'bg-teal-50 text-teal-700', emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700', indigo: 'bg-indigo-50 text-indigo-700', slate: 'bg-slate-100 text-slate-600' }[tone];
          return <button key={label} onClick={() => onSelectCategory(label === 'All Documents' || selectedCategory === label ? null : label)} aria-pressed={active} className={`group rounded-2xl border p-3.5 text-left transition-all ${active ? 'border-teal-500 bg-teal-50/70 shadow-md shadow-teal-900/10 ring-1 ring-teal-500' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-200/60'}`}><span className={`flex size-9 items-center justify-center rounded-xl ${toneClass}`}><Icon className="size-[18px]" /></span><span className="mt-3 block truncate text-xs font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs text-slate-500">{count} {count === 1 ? 'file' : 'files'}</span></button>;
        })}
      </div>
    </section>
  );
}
