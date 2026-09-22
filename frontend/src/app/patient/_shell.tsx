"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/cn";

export default function PatientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="min-h-screen bg-[#f4f8f8] text-slate-900"><div className="flex min-h-screen"><div className="hidden lg:flex"><Sidebar /></div>{sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}<div className={cn("fixed inset-y-0 left-0 z-40 w-72 -translate-x-full bg-white shadow-2xl transition-transform duration-200 lg:hidden", sidebarOpen && "translate-x-0")}><Sidebar /></div><div className="flex min-h-screen min-w-0 flex-1 flex-col"><Header onToggleMobile={() => setSidebarOpen((value) => !value)} /><main className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-9"><div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-teal-50/70 to-transparent" /> <div className="relative">{children}</div></main></div></div></div>; 
}
