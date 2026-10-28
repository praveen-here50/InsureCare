import { cn } from "@/lib/cn";

/** The InsureCare symbol (people, shield and care) with the word mark. `compact` hides the word mark. */
export default function Logo({ compact = false, tagline, className, inverted = false }: { compact?: boolean; tagline?: string; className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small fixed-size brand mark from /public */}
      <img src="/brand/insurecare-mark.png" alt="" width={40} height={40} className="size-10 shrink-0 object-contain" />
      {!compact && (
        <span className="flex items-center gap-2.5">
          {/* Coloured like the logo: "Insure" in navy, "Care" in teal-to-green. */}
          <span className="text-[19px] font-bold tracking-tight">
            <span className={inverted ? "text-white" : "text-[#0B2350]"}>Insure</span>
            <span className={inverted ? "text-white" : "bg-gradient-to-r from-[#0E8FA8] to-[#1FAF7F] bg-clip-text text-transparent"}>Care</span>
          </span>
          {tagline && <span className={cn("hidden rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:inline", inverted ? "border-white/30 text-white/80" : "border-slate-200 text-slate-500")}>{tagline}</span>}
        </span>
      )}
    </span>
  );
}
