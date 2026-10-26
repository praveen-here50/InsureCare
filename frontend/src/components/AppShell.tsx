"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CommandPalette from "@/components/CommandPalette";
import { ToastProvider } from "@/components/Toast";
import { getPortal } from "@/lib/portals";
import { cn } from "@/lib/cn";

const KEY = "ic-sidebar-collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const portal = getPortal(pathname);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => { try { setCollapsed(localStorage.getItem(KEY) === "1"); } catch {} }, []);
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const toggleSidebar = () => setCollapsed((c) => { try { localStorage.setItem(KEY, c ? "0" : "1"); } catch {} return !c; });

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <div className="sticky top-0 hidden h-screen lg:block"><Sidebar collapsed={collapsed} /></div>
        <div aria-hidden="true" onClick={() => setDrawer(false)} className={cn("fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-300 lg:hidden", drawer ? "opacity-100" : "pointer-events-none opacity-0")} />
        <div className={cn("fixed inset-y-0 left-0 z-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden", drawer ? "translate-x-0" : "-translate-x-full")}><Sidebar /></div>
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header onToggleMobile={() => setDrawer(true)} onToggleSidebar={toggleSidebar} onSearch={() => setPalette(true)} />
          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8"><div key={pathname} className="animate-fade-in">{children}</div></main>
        </div>
        <BottomNav />
        <CommandPalette portal={portal} open={palette} onClose={() => setPalette(false)} />
      </div>
    </ToastProvider>
  );
}
