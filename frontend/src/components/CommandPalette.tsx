"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCornerDownLeft, FiSearch } from "react-icons/fi";
import { cn } from "@/lib/cn";
import type { Portal } from "@/lib/portals";
import { pageEntries, paletteEntries, type PaletteEntry } from "./palette-data";

export default function CommandPalette({ portal, open, onClose }: { portal: Portal; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<PaletteEntry[]>(() => pageEntries(portal));
  // Load records each time the palette opens, so search reflects the latest data. Pages still work offline.
  useEffect(() => {
    if (!open) return;
    let live = true;
    setEntries(pageEntries(portal));
    paletteEntries(portal).then((e) => { if (live) setEntries(e); }).catch(() => {});
    return () => { live = false; };
  }, [open, portal]);
  const results = useMemo(() => { const t = q.trim().toLowerCase(); return (t ? entries.filter((e) => e.keywords.includes(t)) : entries.filter((e) => e.group === "Pages")).slice(0, 9); }, [q, entries]);

  useEffect(() => { if (open) { setQ(""); setCursor(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);
  useEffect(() => setCursor(0), [q]);
  if (!open) return null;

  const go = (href: string) => { onClose(); router.push(href); };
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/40 px-4 pt-[14vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-label="Search" className="w-full max-w-xl animate-fade-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <FiSearch className="shrink-0 text-slate-400" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages, patients, claims" className="h-14 flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
              if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
              if (e.key === "Escape") onClose();
            }} />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-400">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">No results</li>}
          {results.map((r, i) => (
            <li key={r.href + r.title}>
              <button type="button" onMouseEnter={() => setCursor(i)} onClick={() => go(r.href)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors", i === cursor ? "bg-slate-100" : "")}>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{r.title}</span>{r.sub && <span className="block truncate text-xs text-slate-500">{r.sub}</span>}</span>
                <span className="text-xs text-slate-400">{r.group}</span>
                {i === cursor && <FiCornerDownLeft className="text-slate-400" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
