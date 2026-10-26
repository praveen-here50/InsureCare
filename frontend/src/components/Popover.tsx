"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Small dropdown that closes on outside click and Escape. */
export default function Popover({ trigger, children, align = "right", className }: {
  trigger: (s: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && <div className={cn("absolute top-full z-40 mt-2 animate-fade-up rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]", align === "right" ? "right-0" : "left-0", className)}>{children(() => setOpen(false))}</div>}
    </div>
  );
}
