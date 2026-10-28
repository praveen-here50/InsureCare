// The patient's notifications, worked out from their own records: what needs their action, what was approved, what renews soon.
import type { ShellNote } from "@/components/portal/PortalShell";
import { inr } from "@/components/portal/ui";
import { needsAction, type Claim } from "./claims/data";
import { daysUntil, formatDate, type Policy } from "./policies/data";

const RENEWAL_DAYS = 90;

/** Written in English; the shell shows them in the patient's language (locales/ta.json templates). */
export function patientNotes(claims: Claim[], policies: Policy[]): ShellNote[] {
  const notes: ShellNote[] = [];
  for (const c of claims.filter(needsAction)) {
    for (const d of c.documents.filter((d) => d.status === "Required"))
      notes.push({ id: `doc-${c.id}-${d.name}`, text: `${d.name} needed for claim ${c.id}`, time: c.updated, href: `/patient/claims/${c.id}` });
  }
  for (const c of claims.filter((c) => c.approved != null && (c.status === "Approved" || c.status === "Settled")).slice(0, 2))
    notes.push({ id: `approved-${c.id}`, text: `Claim ${c.id} was approved for ${inr(c.approved!)}`, time: c.updated, href: `/patient/claims/${c.id}` });
  for (const p of policies) {
    const days = daysUntil(p.validTill);
    if (days >= 0 && days <= RENEWAL_DAYS)
      notes.push({ id: `renew-${p.id}`, text: `${p.name} renews in ${days} days`, time: formatDate(p.validTill), href: `/patient/policies/${p.id}` });
  }
  return notes.slice(0, 5);
}
