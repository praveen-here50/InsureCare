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

  return <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3 lg:hidden"><button type="button" aria-label="Open navigation" onClick={onToggleMobile} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><MdMenu className="size-5" /></button><Link href="/patient" className="text-lg font-bold tracking-tight text-teal-800">InsureCare</Link></div><div className="hidden text-sm text-slate-500 lg:block">Patient portal <span className="mx-2 text-slate-300">/</span> <span className="font-medium text-slate-800">{pageLabel}</span></div><div className="ml-auto flex items-center gap-2"><button type="button" aria-label="Notifications" className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><MdNotificationsNone className="size-5" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-teal-600" /></button><button type="button" className="flex items-center gap-2 rounded-lg p-1.5 pr-2 text-left hover:bg-slate-50"><span className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">PS</span><span className="hidden text-sm font-medium text-slate-700 sm:block">Priya Sharma</span><FiChevronDown className="hidden text-slate-400 sm:block" /></button></div></div></header>;
}
