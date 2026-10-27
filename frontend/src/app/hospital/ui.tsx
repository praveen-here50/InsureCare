import { FiAlertTriangle, FiCheck, FiClock, FiMinus } from "react-icons/fi";
import type { Tone } from "@/components/portal/ui";
import { cn } from "@/lib/cn";
import type { BedStatus, DocStatus, PatientStatus, Ward } from "./data";
import { wardAvailable } from "./data";

export const statusTone: Record<PatientStatus, Tone> = { Admitted: "blue", "Under observation": "amber", "Ready for discharge": "green", "Not admitted": "slate" };
/** Badge tones for the insurer portal, which still uses the older Badge component. */
export const docBadgeTone: Record<DocStatus, "green" | "yellow" | "red" | "gray"> = { Verified: "green", "Pending review": "yellow", "Needs correction": "red", Missing: "gray" };
export const docTone: Record<DocStatus, Tone> = { Verified: "green", "Pending review": "amber", "Needs correction": "rose", Missing: "slate" };

/** Light bed tiles: free = soft green, reserved = soft amber, occupied = quiet grey. */
export const BED_TILE: Record<BedStatus, string> = {
  available: "border-care-200 bg-care-50 text-care-700",
  reserved: "border-amber-200 bg-amber-50 text-amber-700",
  occupied: "border-slate-200 bg-slate-100 text-slate-400",
};
export const BED_DOT: Record<BedStatus, string> = { available: "bg-care-500", reserved: "bg-amber-400", occupied: "bg-slate-200" };
export const BED_LABEL: Record<BedStatus, string> = { available: "Free", reserved: "Reserved", occupied: "Occupied" };

/** Tone for a ward's free-bed count. */
export const wardTone = (w: Ward): Tone => { const free = wardAvailable(w); return free === 0 ? "rose" : free <= 2 ? "amber" : "green"; };

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").filter((w) => !w.endsWith(".")).slice(0, 2).map((w) => w[0]).join("");
  return <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600", className)}>{initials}</span>;
}

export function DocIcon({ status, className }: { status: DocStatus; className?: string }) {
  const map = { Verified: [FiCheck, "text-emerald-600"], "Pending review": [FiClock, "text-slate-400"], "Needs correction": [FiAlertTriangle, "text-amber-600"], Missing: [FiMinus, "text-slate-300"] } as const;
  const [Icon, color] = map[status];
  return <Icon className={cn("size-4 shrink-0", color, className)} />;
}
