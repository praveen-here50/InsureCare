import { FiFile } from "react-icons/fi";
import { cn } from "@/lib/cn";
import type { BedStatus } from "./data";

/** Status label in the portal accent; the words say which status it is. */
export function Status({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("whitespace-nowrap text-xs font-semibold text-care-700", className)}>{children}</span>;
}

/** Bed tiles and dots in shades of the portal accent: free = solid, reserved = light, occupied = grey. */
export const BED_TILE: Record<BedStatus, string> = {
  available: "border-care-200 bg-care-50 text-care-700",
  reserved: "border-dashed border-care-300 bg-white text-care-600",
  occupied: "border-slate-200 bg-slate-100 text-slate-400",
};
export const BED_DOT: Record<BedStatus, string> = { available: "bg-care-500", reserved: "bg-care-200", occupied: "bg-slate-200" };
export const BED_LABEL: Record<BedStatus, string> = { available: "Free", reserved: "Reserved", occupied: "Occupied" };

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").filter((w) => !w.endsWith(".")).slice(0, 2).map((w) => w[0]).join("");
  return <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600", className)}>{initials}</span>;
}

/** "PDF", "JPG" or "PNG" from a file name. */
export const fileType = (fileName?: string) => fileName?.split(".").pop()?.toUpperCase().replace("JPEG", "JPG");

const TYPE_COLOR: Record<string, string> = { PDF: "bg-rose-50 text-rose-600 ring-rose-100", JPG: "bg-violet-50 text-violet-600 ring-violet-100", PNG: "bg-violet-50 text-violet-600 ring-violet-100" };

/** File icon labelled with its type; a dashed empty slot when nothing is uploaded yet. */
export function FileTypeIcon({ fileName }: { fileName?: string }) {
  const type = fileType(fileName);
  if (!type) return <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300"><FiFile className="size-4" /></span>;
  return <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold ring-1 ring-inset", TYPE_COLOR[type] ?? "bg-slate-50 text-slate-500 ring-slate-200")}>{type}</span>;
}

/** 1429 -> "1.4 KB", 2400000 -> "2.3 MB". */
export function fileSize(bytes?: number) {
  if (bytes === undefined || bytes === null) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
