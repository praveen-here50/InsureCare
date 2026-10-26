"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPortal, isActive } from "@/lib/portals";
import { cn } from "@/lib/cn";

/** Thumb-reachable navigation for phones and tablets. */
export default function BottomNav() {
  const pathname = usePathname();
  const portal = getPortal(pathname);
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {portal.mobile.map(({ label, href, icon: Icon }) => {
          const active = isActive(portal, href, pathname);
          return (
            <li key={href} className="relative flex-1">
              <span className={cn("absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-b-full bg-brand-700 transition-all duration-300", active ? "w-10" : "w-0")} />
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors active:scale-95", active ? "text-brand-700" : "text-slate-500")}>
                <Icon className={cn("size-[22px] transition-transform duration-300", active && "-translate-y-0.5 scale-110")} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
