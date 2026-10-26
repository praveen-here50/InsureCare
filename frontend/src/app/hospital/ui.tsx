import { FiAlertTriangle, FiCheck, FiClock, FiMinus } from "react-icons/fi";
import { cn } from "@/lib/cn";
import type { DocStatus, PatientStatus } from "./data";

export const statusTone: Record<PatientStatus, "blue" | "yellow" | "green" | "gray"> = { Admitted: "blue", "Under observation": "yellow", "Ready for discharge": "green", "Not admitted": "gray" };
export const docTone: Record<DocStatus, "green" | "yellow" | "red" | "gray"> = { Verified: "green", "Pending review": "yellow", "Needs correction": "red", Missing: "gray" };

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").filter((w) => !w.endsWith(".")).slice(0, 2).map((w) => w[0]).join("");
  return <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600", className)}>{initials}</span>;
}

export function DocIcon({ status, className }: { status: DocStatus; className?: string }) {
  const map = { Verified: [FiCheck, "text-emerald-600"], "Pending review": [FiClock, "text-slate-400"], "Needs correction": [FiAlertTriangle, "text-amber-600"], Missing: [FiMinus, "text-slate-300"] } as const;
  const [Icon, color] = map[status];
  return <Icon className={cn("size-4 shrink-0", color, className)} />;
}
