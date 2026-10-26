"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { getPortal, isActive, type NavItem, type Portal } from "@/lib/portals";

function Item({ item, portal, pathname, collapsed }: { item: NavItem; portal: Portal; pathname: string; collapsed: boolean }) {
  const active = isActive(portal, item.href, pathname);
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} title={collapsed ? item.label : undefined}
      className={cn("group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200", active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}>
      <span className={cn("absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-brand-600 transition-all duration-300", active ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0")} />
      <Icon className={cn("size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110", active ? "text-brand-700" : "text-slate-400 group-hover:text-slate-600")} />
      <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>{item.label}</span>
      {collapsed && <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">{item.label}</span>}
    </Link>
  );
}

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const portal = getPortal(pathname);
  return (
    <aside className={cn("flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)]", collapsed ? "w-[72px]" : "w-64")}>
      <Link href={portal.base} className="flex h-16 items-center gap-3 border-b border-slate-100 px-[18px]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">IC</span>
        <span className={cn("overflow-hidden whitespace-nowrap text-base font-semibold text-slate-900 transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>InsureCare</span>
      </Link>
      <nav aria-label="Main navigation" className="flex-1 px-3 pt-4">
        <p className={cn("mb-2 overflow-hidden whitespace-nowrap px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 transition-all duration-300", collapsed ? "h-0 opacity-0" : "h-4 opacity-100")}>{portal.title}</p>
        <ul className="flex flex-col gap-1">{portal.nav.map((item) => <li key={item.href}><Item item={item} portal={portal} pathname={pathname} collapsed={collapsed} /></li>)}</ul>
      </nav>
      {portal.footer && <div className="border-t border-slate-100 p-3"><Item item={portal.footer} portal={portal} pathname={pathname} collapsed={collapsed} /></div>}
    </aside>
  );
}
