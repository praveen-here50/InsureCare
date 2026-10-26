"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiRepeat, FiSearch, FiSidebar, FiUser } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { getPortal, isActive } from "@/lib/portals";
import Popover from "./Popover";

const NOTES: Record<string, { id: string; text: string; time: string }[]> = {
  patient: [{ id: "a", text: "Claim CLM-1038 needs additional documents", time: "2h ago" }, { id: "b", text: "Accidental Death Benefit renews in 82 days", time: "Yesterday" }, { id: "c", text: "Claim CLM-1042 was settled", time: "28 Aug" }],
  hospital: [{ id: "a", text: "Meera Joshi admitted to ER-02. Documents pending", time: "12m ago" }, { id: "b", text: "Lakshmi Devi’s documents are verified and ready to send", time: "1h ago" }, { id: "c", text: "ICU has 2 beds left", time: "3h ago" }],
  insurer: [{ id: "a", text: "CLM-2046 pre-authorisation received from Apex Neuro Centre", time: "20m ago" }, { id: "b", text: "CLM-2031 query is waiting on the hospital", time: "2h ago" }, { id: "c", text: "CLM-2038 is a high-value claim awaiting review", time: "Yesterday" }],
};

export default function Header({ onToggleMobile, onToggleSidebar, onSearch }: { onToggleMobile: () => void; onToggleSidebar: () => void; onSearch: () => void }) {
  const pathname = usePathname();
  const portal = getPortal(pathname);
  const [read, setRead] = useState<Record<string, boolean>>({});
  const notes = NOTES[portal.key] ?? [];
  const unread = notes.filter((n) => !read[n.id]).length;
  const current = [...portal.nav, ...(portal.footer ? [portal.footer] : [])].filter((i) => isActive(portal, i.href, pathname)).sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" aria-label="Open navigation" onClick={onToggleMobile} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"><FiMenu className="size-5" /></button>
        <button type="button" aria-label="Collapse sidebar" onClick={onToggleSidebar} className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:block"><FiSidebar className="size-[18px]" /></button>
        <p className="hidden text-sm text-slate-500 sm:block">{portal.title}<span className="mx-2 text-slate-300">/</span><span className="font-medium text-slate-900">{current?.label ?? "Overview"}</span></p>

        <button type="button" onClick={onSearch} className="ml-auto flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white sm:w-64">
          <FiSearch className="shrink-0" /><span className="hidden flex-1 text-left sm:block">Search</span><kbd className="hidden rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-400 sm:block">Ctrl K</kbd>
        </button>

        <Popover className="w-80" trigger={({ toggle }) => (
          <button type="button" aria-label="Notifications" onClick={toggle} className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><FiBell className="size-[18px]" />{unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded bg-brand-600 px-1 text-[10px] font-semibold text-white">{unread}</span>}</button>
        )}>{() => (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p className="text-sm font-semibold text-slate-900">Notifications</p><button type="button" onClick={() => setRead(Object.fromEntries(notes.map((n) => [n.id, true])))} className="text-xs font-medium text-slate-500 hover:text-slate-900">Mark all read</button></div>
            <ul>{notes.map((n) => <li key={n.id}><button type="button" onClick={() => setRead((r) => ({ ...r, [n.id]: true }))} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"><span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", read[n.id] ? "bg-transparent" : "bg-brand-600")} /><span><span className={cn("block text-sm", read[n.id] ? "text-slate-500" : "text-slate-900")}>{n.text}</span><span className="text-xs text-slate-400">{n.time}</span></span></button></li>)}</ul>
          </div>
        )}</Popover>

        <Popover className="w-64" trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className="flex items-center gap-2.5 rounded-lg p-1.5 pr-2 text-left transition hover:bg-slate-100">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><FiUser className="size-4" /></span>
            <span className="hidden leading-tight md:block"><span className="block text-sm font-medium text-slate-900">{portal.user.name}</span><span className="block text-[11px] text-slate-500">{portal.user.role}</span></span>
            <FiChevronDown className="hidden text-slate-400 md:block" />
          </button>
        )}>{(close) => (
          <div className="p-1.5">
            <div className="px-3 py-2.5"><p className="text-sm font-semibold text-slate-900">{portal.user.name}</p><p className="text-xs text-slate-500">{portal.user.role}</p></div>
            <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">Switch portal</p>
            {portal.switchTo.map((t) => <Link key={t.href} href={t.href} onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><FiRepeat className="text-slate-400" />{t.label}</Link>)}
            <div className="my-1.5 border-t border-slate-100" />
            <Link href="/" onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"><FiLogOut className="text-slate-400" />Sign out</Link>
          </div>
        )}</Popover>
      </div>
    </header>
  );
}

