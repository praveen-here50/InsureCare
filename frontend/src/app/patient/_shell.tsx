"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/cn";

export default function PatientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50 text-slate-900"><div className="hidden lg:flex"><Sidebar /></div>{sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}<div className={cn("fixed inset-y-0 left-0 z-40 w-64 -translate-x-full bg-white shadow-xl transition-transform duration-200 lg:hidden", sidebarOpen && "translate-x-0")}><Sidebar /></div><div className="flex min-h-screen min-w-0 flex-1 flex-col"><Header onToggleMobile={() => setSidebarOpen((value) => !value)} /><main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main></div></div>;
}
