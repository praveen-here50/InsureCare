'use client';

import type { DocumentCategory } from '../types';

const CATEGORIES: DocumentCategory[] = [
  'Insurance',
  'Medical',
  'Government / KYC',
  'Prescriptions',
  'Reports',
  'Other',
];

interface DocumentCategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function DocumentCategories({ selectedCategory, onSelectCategory }: DocumentCategoriesProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategory === null
            ? 'bg-teal-50 text-teal-700'
            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        All Documents
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(selectedCategory === category ? null : category)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-teal-50 text-teal-700'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
