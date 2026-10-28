// The admissions desk's notifications, worked out from the live workspace: documents to finish, claims ready to send, wards filling up.
import type { ShellNote } from "@/components/portal/PortalShell";
import { claimState, wardAvailable, type Patient, type Ward } from "./data";

const FEW_BEDS = 2;

export function hospitalNotes(patients: Patient[], wards: Ward[]): ShellNote[] {
  const notes: ShellNote[] = [];
  for (const p of patients.filter((p) => claimState(p) === "Ready to share"))
    notes.push({ id: `ready-${p.id}`, text: `${p.name}’s documents are verified and ready to send`, time: p.admittedOn ?? "", href: `/hospital/claims/${p.id}` });
  for (const p of patients.filter((p) => p.status !== "Not admitted" && claimState(p) === "In verification").slice(0, 3)) {
    const open = p.documents.filter((d) => d.status !== "Verified").length;
    notes.push({ id: `docs-${p.id}`, text: `${p.name}${p.ward ? ` (${p.ward})` : ""}: ${open} document${open === 1 ? "" : "s"} still to verify`, time: p.admittedOn ?? "", href: `/hospital/patients/${p.id}` });
  }
  for (const w of wards.filter((w) => wardAvailable(w) <= FEW_BEDS))
    notes.push({ id: `beds-${w.id}`, text: `${w.name} has ${wardAvailable(w)} bed${wardAvailable(w) === 1 ? "" : "s"} left`, time: "Now", href: "/hospital/beds" });
  return notes.slice(0, 6);
}
