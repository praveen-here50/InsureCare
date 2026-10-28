'use client';

import { cn } from '@/lib/cn';
import { useT } from '@/components/portal/LanguageContext';
import { CATEGORIES } from '../data';
import type { Document } from '../types';

interface DocumentCategoriesProps {
  documents: Document[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function DocumentCategories({ documents, selectedCategory, onSelectCategory }: DocumentCategoriesProps) {
  const t = useT();
  const options = [{ label: 'All documents', value: null, count: documents.length }, ...CATEGORIES.map((c) => ({ label: c, value: c, count: documents.filter((d) => d.category === c).length }))];

  return (
    <div role="tablist" aria-label={t("Document categories")} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => {
        const active = selectedCategory === o.value;
        return (
          <button
            key={o.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelectCategory(active ? null : o.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              active ? 'bg-ink text-white shadow-soft' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
            )}
          >
            {t(o.label)}
            <span className={cn('rounded-full px-1.5 text-[11px] font-semibold', active ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}
