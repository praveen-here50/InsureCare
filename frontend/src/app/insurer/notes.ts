// The claims officer's notifications, worked out from the insurer's live claims: new pre-authorisations, open queries, large claims.
import type { ShellNote } from "@/components/portal/PortalShell";
import type { ClaimView } from "./data";

const HIGH_VALUE = 300_000;

export function insurerNotes(claims: ClaimView[]): ShellNote[] {
  const notes: ShellNote[] = [];
  for (const c of claims.filter((c) => c.status === "Received" && c.preauth))
    notes.push({ id: `preauth-${c.id}`, text: `${c.id} pre-authorisation received from ${c.hospitalName}`, time: c.updatedOn, href: `/insurer/claims/${c.id}` });
  for (const c of claims.filter((c) => c.status === "Query raised"))
    notes.push({ id: `query-${c.id}`, text: `${c.id} query is waiting on ${c.hospitalName}`, time: c.updatedOn, href: `/insurer/claims/${c.id}` });
  for (const c of claims.filter((c) => c.status === "Under review" && c.claimed >= HIGH_VALUE))
    notes.push({ id: `high-${c.id}`, text: `${c.id} is a high-value claim awaiting review`, time: c.updatedOn, href: `/insurer/claims/${c.id}` });
  return notes.slice(0, 6);
}
