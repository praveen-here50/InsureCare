"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdMenu, MdNotificationsNone } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";

const PAGE_LABELS: Record<string, string> = {
  "/patient": "Dashboard",
  "/patient/policies": "My Policies",
  "/patient/hospitals": "Hospitals",
  "/patient/claims": "Claims",
  "/patient/documents": "Documents",
  "/patient/assistant": "AI Assistant",
  "/patient/settings": "Settings",
};

export default function Header({ onToggleMobile = () => {} }: { onToggleMobile?: () => void }) {
  const pathname = usePathname();
  const pageLabel = PAGE_LABELS[pathname] ?? (pathname.startsWith("/patient/policies/") ? "Policy details" : "Patient portal");

  return <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl"><div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-10"><div className="flex items-center gap-3 lg:hidden"><button type="button" aria-label="Open navigation" onClick={onToggleMobile} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-teal-50 hover:text-teal-800"><MdMenu className="size-5" /></button><Link href="/patient" className="text-lg font-bold tracking-tight text-teal-800">InsureCare</Link></div><div className="hidden lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Patient portal</p><p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{pageLabel}</p></div><div className="ml-auto flex items-center gap-3"><button type="button" aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"><MdNotificationsNone className="size-5" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-teal-600 ring-2 ring-white" /></button><button type="button" className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 pr-2 text-left transition hover:border-slate-200 hover:bg-white"><span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-xs font-semibold text-white shadow-md">PS</span><span className="hidden text-sm font-semibold text-slate-700 sm:block">Priya Sharma</span><FiChevronDown className="hidden text-slate-400 sm:block" /></button></div></div></header>;
}
