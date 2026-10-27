import { cn } from "@/lib/cn";

/** Heart-in-shield brand mark. `compact` hides the word mark. */
export default function Logo({ compact = false, tagline, className, inverted = false }: { compact?: boolean; tagline?: string; className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-care-600">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
          <path d="M12 2.8 4.5 5.6v5.9c0 4.6 3.1 8.4 7.5 9.7 4.4-1.3 7.5-5.1 7.5-9.7V5.6L12 2.8Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M12 15.6s-3.6-2.2-3.6-4.6a2 2 0 0 1 3.6-1.2 2 2 0 0 1 3.6 1.2c0 2.4-3.6 4.6-3.6 4.6Z" fill="#fff" />
        </svg>
      </span>
      {!compact && (
        <span className="flex items-center gap-2.5">
          <span className={cn("text-[19px] font-extrabold tracking-[-0.02em]", inverted ? "text-white" : "text-ink")}>InsureCare</span>
          {tagline && <span className={cn("hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:inline", inverted ? "border-white/30 text-white/80" : "border-slate-200 text-slate-500")}>{tagline}</span>}
        </span>
      )}
    </span>
  );
}
