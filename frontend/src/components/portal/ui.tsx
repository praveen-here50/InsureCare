// Patient-portal design primitives. Server-safe (no hooks), so any page can use them.
// Colour rule: neutral by default; green = done/good, amber = needs attention, rose = problem,
// sky = portal accent (follows the theme), blue = fixed informational blue.
import Link from "next/link";
import type { IconType } from "react-icons";
import { FiCheck } from "react-icons/fi";
import { cn } from "@/lib/cn";

export type Tone = "sky" | "blue" | "green" | "amber" | "rose" | "slate";

const PILL: Record<Tone, string> = {
  sky: "bg-care-50 text-care-700 ring-care-200/70",
  blue: "bg-sky-50 text-sky-700 ring-sky-200/70",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/70",
  slate: "bg-slate-100 text-slate-600 ring-slate-200/70",
};
const DOT: Record<Tone, string> = { sky: "bg-care-500", blue: "bg-sky-500", green: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", slate: "bg-slate-400" };

// Utility groups where a later class should replace an earlier one (e.g. "px-5" then "px-0").
const GROUPS = [
  /^(flex|inline-flex|hidden|block|grid|inline-block)$/,
  /^h-/, /^w-/, /^size-/, /^px-/, /^py-/, /^rounded(-|$)/, /^gap-/,
  /^bg-/, /^border-(?!\d|[xytblr](-|$))/, /^shadow(-|$)/,
  /^text-(xs|sm|base|lg|[2-9]?xl|\[\d)/, // font size
  /^text-(?!(xs|sm|base|lg|[2-9]?xl|left|center|right)$|\[\d)/, // text colour
];
/**
 * Joins a component's default classes with caller overrides. A plain join would keep both
 * "px-5" and "px-0", and Tailwind would then apply whichever appears later in its CSS file,
 * not the one written later. This drops any default that an override replaces.
 * (Variant classes such as "hover:" or "sm:" never replace defaults.)
 */
export function merge(base: string, extra?: string) {
  if (!extra) return base;
  const overrides = extra.split(/\s+/).filter((t) => t && !t.includes(":"));
  const kept = base.split(/\s+/).filter((b) => !GROUPS.some((g) => g.test(b) && overrides.some((o) => g.test(o))));
  return [...kept, extra].join(" ");
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Short Indian-style amount, e.g. 1500000 -> "₹15 L". */
export const inrShort = (n: number) => (n >= 100000 ? `₹${+(n / 100000).toFixed(2)} L` : inr(n));

/** White card with a hairline border and a soft shadow. */
export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={merge("rounded-2xl border border-slate-200/80 bg-white shadow-soft", className)}>{children}</div>;
}

/** Small uppercase label that sits above a heading. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-bold uppercase tracking-[0.18em] text-care-600", className)}>{children}</p>;
}

/** Top-of-page title block. */
export function PageIntro({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-[15px] leading-7 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/** Heading for a section inside a page, with an optional "view all" link. */
export function SectionHeading({ title, description, href, linkLabel = "View all" }: { title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-bold tracking-tight text-ink sm:text-lg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-semibold text-care-600 transition hover:text-care-800">{linkLabel} →</Link>}
    </div>
  );
}

/** Neutral icon tile. */
export function IconBadge({ icon: Icon, className }: { icon: IconType; className?: string }) {
  return <span className={merge("flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600", className)}><Icon className="size-[18px]" /></span>;
}

/** Big-number statistic. */
export function StatCard({ icon, value, label, note }: { icon: IconType; value: React.ReactNode; label: string; note?: string }) {
  return (
    <Surface className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <IconBadge icon={icon} className="hidden size-8 rounded-lg sm:flex [&_svg]:size-4" />
      </div>
      <p className="mt-3 text-[1.4rem] font-extrabold leading-none tracking-[-0.03em] text-ink sm:text-[1.75rem]">{value}</p>
      {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
    </Surface>
  );
}

export function Pill({ tone = "slate", dot = false, children, className }: { tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={merge(cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", PILL[tone]), className)}>
      {dot && <span className={cn("size-1.5 rounded-full", DOT[tone])} />}
      {children}
    </span>
  );
}

export type Stage = { label: string; completed: boolean; current?: boolean };

/**
 * Step tracker: small dots on a thin line, evenly spaced.
 * Finished steps are blue, the current step is a ring (amber when the member must act),
 * a fully finished process ends with a check mark.
 */
export function StageTracker({ stages, attention = false, showLabels = false, className }: { stages: Stage[]; attention?: boolean; showLabels?: boolean; className?: string }) {
  const done = stages.filter((s) => s.completed).length;
  const allDone = done === stages.length;
  const currentIndex = stages.findIndex((s) => s.current);
  const caption = stages[currentIndex >= 0 ? currentIndex : Math.max(done - 1, 0)]?.label;

  return (
    <div className={className}>
      <ol aria-label={`Step ${Math.min(done, stages.length)} of ${stages.length}: ${caption}`} className="flex items-center">
        {stages.map((s, i) => {
          const last = i === stages.length - 1;
          const isCurrent = i === currentIndex && !(allDone && last);
          const finalCheck = allDone && last;
          return (
            <li key={s.label} className={cn("flex items-center", !last && "flex-1")}>
              {finalCheck ? (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-care-600 text-white"><FiCheck className="size-3" strokeWidth={3.5} /></span>
              ) : isCurrent ? (
                <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border-2 bg-white", attention ? "border-amber-500" : "border-care-600")}>
                  <span className={cn("size-1.5 rounded-full", attention ? "bg-amber-500" : "bg-care-600")} />
                </span>
              ) : (
                <span className={cn("size-2.5 shrink-0 rounded-full", s.completed ? "bg-care-600" : "border-2 border-slate-300 bg-white")} />
              )}
              {!last && <span className={cn("mx-2 h-0.5 flex-1 rounded-full", stages[i + 1]?.completed || stages[i + 1]?.current ? "bg-care-600" : "bg-slate-200")} />}
            </li>
          );
        })}
      </ol>
      {showLabels ? (
        // Each label sits under its dot: dots are spread evenly, so dot i is at i / (n - 1) of the width.
        <ol aria-hidden="true" className="relative mt-3 hidden h-8 sm:block">
          {stages.map((s, i) => {
            const pct = (i / (stages.length - 1)) * 100;
            const edge = i === 0 ? "left-0 text-left" : i === stages.length - 1 ? "right-0 text-right" : "-translate-x-1/2 text-center";
            return (
              <li key={s.label} style={i > 0 && i < stages.length - 1 ? { left: `${pct}%` } : undefined} className={cn("absolute top-0 w-36 text-[11px] leading-4", edge, s.completed || s.current ? "font-semibold text-slate-700" : "text-slate-400")}>{s.label}</li>
            );
          })}
        </ol>
      ) : null}
      <p className={cn("mt-2.5 text-xs text-slate-500", showLabels && "sm:hidden")}>
        <span className="font-semibold text-slate-700">Step {Math.min(currentIndex >= 0 ? currentIndex + 1 : done, stages.length)} of {stages.length}</span> · {caption}
      </p>
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "white";
const BUTTON: Record<ButtonVariant, string> = {
  primary: "bg-care-600 text-white shadow-sm hover:bg-care-700",
  secondary: "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-care-700 hover:bg-care-50",
  white: "bg-white text-care-800 shadow-sm hover:bg-care-50",
};
export const buttonClass = (variant: ButtonVariant = "primary", className?: string) =>
  merge(cn("inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50", BUTTON[variant]), className);

export function ButtonLink({ href, variant, className, children }: { href: string; variant?: ButtonVariant; className?: string; children: React.ReactNode }) {
  return <Link href={href} className={buttonClass(variant, className)}>{children}</Link>;
}

/** Pill-style tab bar. Use inside a client component (it takes an onChange handler). */
export function PillTabs<T extends string>({ value, options, onChange, counts }: { value: T; options: readonly T[]; onChange: (v: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => {
        const active = o === value;
        return (
          <button key={o} type="button" role="tab" aria-selected={active} onClick={() => onChange(o)}
            className={cn("inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition", active ? "bg-ink text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink")}>
            {o}
            {counts?.[o] !== undefined && <span className={cn("rounded-full px-1.5 text-[11px] font-bold", active ? "bg-white/20" : "bg-slate-100 text-slate-500")}>{counts[o]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Label/value pair used in detail grids. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-900">{children}</div>
    </div>
  );
}
