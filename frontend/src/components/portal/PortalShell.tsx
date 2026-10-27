"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { FiBell, FiChevronDown, FiChevronsLeft, FiLogOut, FiMenu, FiRepeat, FiSearch, FiX } from "react-icons/fi";
import CommandPalette from "@/components/CommandPalette";
import Popover from "@/components/Popover";
import LiveUpdates from "@/components/LiveUpdates";
import { ToastProvider } from "@/components/Toast";
import { cn } from "@/lib/cn";
import { HOSPITAL_PORTAL, INSURER_PORTAL, PATIENT_PORTAL, isActive, type NavItem, type Portal } from "@/lib/portals";
import Logo from "./Logo";

export type ShellNote = { id: string; text: string; time: string; href: string };
const PORTALS: Record<Portal["key"], Portal> = { patient: PATIENT_PORTAL, hospital: HOSPITAL_PORTAL, insurer: INSURER_PORTAL };

/** Props are plain data so a server layout can render this client component. */
export type ShellProps = {
  /** Which portal to show. The full config (with icon components) is looked up here, in the browser. */
  portal: Portal["key"];
  notes: ShellNote[];
  /** Second line under the user name, e.g. "Member · IC-7842". */
  subtitle: string;
  email: string;
  searchHint: string;
  /** Accent colour: blue (default) or green. */
  theme?: "blue" | "green";
};

type ShellConfig = Omit<ShellProps, "portal"> & { portal: Portal };
const ShellCtx = createContext<ShellConfig | null>(null);
const useShell = () => useContext(ShellCtx)!;

/** App frame shared by the patient, hospital and insurer portals: sidebar, top bar, mobile navigation and search. */
export default function PortalShell({ children, portal: portalKey, ...rest }: ShellProps & { children: React.ReactNode }) {
  const portal = PORTALS[portalKey];
  const config: ShellConfig = { ...rest, portal };
  const { theme = "blue" } = config;
  const KEY = `ic-${portal.key}-sidebar-collapsed`;
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => { try { setCollapsed(localStorage.getItem(KEY) === "1"); } catch {} }, [KEY]);
  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [KEY]);
  const toggleSidebar = () => setCollapsed((c) => { try { localStorage.setItem(KEY, c ? "0" : "1"); } catch {} return !c; });

  return (
    <ShellCtx.Provider value={config}>
    <ToastProvider>
      <LiveUpdates />
      <div className={cn("flex min-h-screen bg-[#F5F8FC] font-display text-slate-900", theme === "green" && "theme-green")}>
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen lg:block"><Sidebar pathname={pathname} collapsed={collapsed} onToggle={toggleSidebar} /></div>

        {/* Mobile drawer */}
        <div aria-hidden="true" onClick={() => setDrawer(false)} className={cn("fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden", drawer ? "opacity-100" : "pointer-events-none opacity-0")} />
        <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden", drawer ? "translate-x-0" : "-translate-x-full")}>
          <Sidebar pathname={pathname} collapsed={false} onClose={() => setDrawer(false)} />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar pathname={pathname} onMenu={() => setDrawer(true)} onSearch={() => setPalette(true)} />
          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
            <div key={pathname} className="mx-auto max-w-[1240px] animate-fade-in">{children}</div>
          </main>
        </div>

        <BottomNav pathname={pathname} />
        <CommandPalette portal={portal} open={palette} onClose={() => setPalette(false)} />
      </div>
    </ToastProvider>
    </ShellCtx.Provider>
  );
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const { portal } = useShell();
  const active = isActive(portal, item.href, pathname);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}
      className={cn("group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
        active ? "bg-care-50 text-care-800" : "text-slate-500 hover:bg-slate-50 hover:text-ink",
        collapsed && "justify-center px-0")}>
      <Icon className={cn("size-[18px] shrink-0", active ? "text-care-600" : "text-slate-400 group-hover:text-slate-600")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function Sidebar({ pathname, collapsed, onToggle, onClose }: { pathname: string; collapsed: boolean; onToggle?: () => void; onClose?: () => void }) {
  const { portal } = useShell();
  return (
    <aside className={cn("no-scrollbar flex h-screen shrink-0 flex-col overflow-y-auto border-r border-slate-200/80 bg-white transition-[width] duration-300", collapsed ? "w-[84px]" : "w-[272px]")}>
      <div className={cn("flex h-[72px] items-center gap-2 px-5", collapsed && "justify-center px-0")}>
        <Link href={portal.base} aria-label="InsureCare dashboard"><Logo compact={collapsed} /></Link>
        {onClose && <button type="button" onClick={onClose} aria-label="Close navigation" className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-ink"><FiX /></button>}
      </div>

      <nav aria-label={`${portal.title} navigation`} className="flex-1 px-4 pt-3">
        {!collapsed && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Menu</p>}
        <ul className="flex flex-col gap-1">{portal.nav.map((item) => <li key={item.href}><NavLink item={item} pathname={pathname} collapsed={collapsed} /></li>)}</ul>
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 p-4">
        {portal.footer && <NavLink item={portal.footer} pathname={pathname} collapsed={collapsed} />}
        {onToggle && (
          <button type="button" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition hover:bg-slate-100 hover:text-ink", collapsed && "justify-center px-0")}>
            <FiChevronsLeft className={cn("size-[18px] transition-transform", collapsed && "rotate-180")} />{!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </aside>
  );
}

function TopBar({ pathname, onMenu, onSearch }: { pathname: string; onMenu: () => void; onSearch: () => void }) {
  const { portal, notes: NOTES, subtitle, email, searchHint } = useShell();
  const [read, setRead] = useState<Record<string, boolean>>({});
  const unread = NOTES.filter((n) => !read[n.id]).length;
  const current = [...portal.nav, ...(portal.footer ? [portal.footer] : [])].filter((i) => isActive(portal, i.href, pathname)).sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button type="button" aria-label="Open navigation" onClick={onMenu} className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-ink lg:hidden"><FiMenu className="size-5" /></button>
        <Link href={portal.base} className="lg:hidden" aria-label="InsureCare dashboard"><Logo compact /></Link>
        <p className="hidden text-sm font-medium text-slate-400 lg:block">{portal.title} <span className="mx-1.5 text-slate-300">/</span><span className="font-semibold text-ink">{current?.label ?? "Overview"}</span></p>

        <button type="button" onClick={onSearch} className="ml-auto flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm text-slate-400 transition hover:border-slate-300 hover:bg-white sm:w-72">
          <FiSearch className="size-4 shrink-0" /><span className="hidden min-w-0 flex-1 truncate text-left sm:block">{searchHint}</span>
          <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-400 sm:block">Ctrl K</kbd>
        </button>

        <Popover className="w-[340px]" trigger={({ toggle }) => (
          <button type="button" aria-label={`Notifications, ${unread} unread`} onClick={toggle} className="relative rounded-xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-ink">
            <FiBell className="size-[18px]" />
            {unread > 0 && <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">{unread}</span>}
          </button>
        )}>{(close) => (
          <div className="font-display">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <p className="text-sm font-bold text-ink">Notifications</p>
              <button type="button" onClick={() => setRead(Object.fromEntries(NOTES.map((n) => [n.id, true])))} className="text-xs font-semibold text-care-600 hover:text-care-800">Mark all read</button>
            </div>
            <ul className="p-1.5">{NOTES.map((n) => (
              <li key={n.id}>
                <Link href={n.href} onClick={() => { setRead((r) => ({ ...r, [n.id]: true })); close(); }} className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", read[n.id] ? "bg-slate-200" : "bg-care-500")} />
                  <span><span className={cn("block text-sm leading-5", read[n.id] ? "text-slate-500" : "font-semibold text-ink")}>{n.text}</span><span className="text-xs text-slate-400">{n.time}</span></span>
                </Link>
              </li>
            ))}</ul>
          </div>
        )}</Popover>

        <Popover className="w-64" trigger={({ toggle }) => (
          <button type="button" onClick={toggle} className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100">
            <span className="flex size-9 items-center justify-center rounded-xl bg-care-700 text-xs font-bold text-white">{portal.user.initials}</span>
            <span className="hidden text-left leading-tight md:block"><span className="block text-sm font-bold text-ink">{portal.user.name}</span><span className="block text-[11px] font-medium text-slate-400">{subtitle}</span></span>
            <FiChevronDown className="hidden text-slate-400 md:block" />
          </button>
        )}>{(close) => (
          <div className="p-1.5 font-display">
            <div className="px-3 py-2.5"><p className="text-sm font-bold text-ink">{portal.user.name}</p><p className="text-xs text-slate-500">{email}</p></div>
            <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Switch portal</p>
            {portal.switchTo.map((t) => <Link key={t.href} href={t.href} onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><FiRepeat className="text-slate-400" />{t.label}</Link>)}
            <div className="my-1.5 border-t border-slate-100" />
            <Link href="/" onClick={close} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"><FiLogOut className="text-slate-400" />Sign out</Link>
          </div>
        )}</Popover>
      </div>
    </header>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const { portal } = useShell();
  return (
    <nav aria-label="Primary" className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {portal.mobile.map(({ label, href, icon: Icon }) => {
          const active = isActive(portal, href, pathname);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-semibold transition-colors", active ? "text-care-600" : "text-slate-400")}>
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition", active && "bg-care-50")}><Icon className="size-[19px]" /></span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
