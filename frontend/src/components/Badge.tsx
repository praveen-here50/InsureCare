import { cn } from "@/lib/cn";

type BadgeTone = "green" | "blue" | "red" | "yellow" | "gray";

const TONES: Record<BadgeTone, string> = {
  green: "text-emerald-700",
  blue: "text-brand-700",
  red: "text-rose-700",
  yellow: "text-amber-700",
  gray: "text-slate-500",
};

/** Status label in plain coloured text. */
export default function Badge({ children, tone = "gray", className }: { children: React.ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={cn("whitespace-nowrap text-xs font-medium", TONES[tone], className)}>{children}</span>;
}
