"use client";

import { cn } from "@/lib/cn";

export default function Tabs<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar -mb-px flex gap-6 overflow-x-auto border-b border-slate-200">
      {options.map((o) => (
        <button key={o} role="tab" aria-selected={o === value} type="button" onClick={() => onChange(o)} className={cn("relative shrink-0 pb-3 pt-1 text-sm font-medium transition-colors", o === value ? "text-slate-900" : "text-slate-500 hover:text-slate-800")}>
          {o}
          <span className={cn("absolute inset-x-0 -bottom-px h-0.5 origin-left rounded bg-brand-600 transition-transform duration-300", o === value ? "scale-x-100" : "scale-x-0")} />
        </button>
      ))}
    </div>
  );
}
