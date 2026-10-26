"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";

export type SearchEntry = { type: "Policyholder" | "Claim" | "Hospital"; title: string; sub: string; href: string; keywords: string };

export default function GlobalSearch({ entries, title }: { entries: SearchEntry[]; title: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const results = useMemo(() => { const t = q.trim().toLowerCase(); return t ? entries.filter((e) => e.keywords.includes(t)).slice(0, 7) : []; }, [q, entries]);
  return (
    <section className="relative z-10 rounded-xl">
      <div className="absolute inset-0 overflow-hidden rounded-xl"><Photo src={IMG.office} alt="Claims team" className="size-full" position="center 35%" /><span className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/25" /></div>
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        <form onSubmit={(e) => { e.preventDefault(); if (results[0]) router.push(results[0].href); }} className="relative mt-6 max-w-xl">
          <label><span className="sr-only">Search</span><FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Member ID, patient, claim or hospital" autoComplete="off" className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400" /></label>
          {q && (
            <div className="absolute inset-x-0 top-full z-30 mt-2 animate-fade-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.3)]">
              {results.length === 0 ? <p className="px-4 py-5 text-sm text-slate-500">No results</p> : results.map((r) => (
                <Link key={r.href} href={r.href} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition last:border-0 hover:bg-slate-50"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-900">{r.title}</span><span className="block truncate text-xs text-slate-500">{r.sub}</span></span><span className="text-xs text-slate-400">{r.type}</span></Link>
              ))}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
