// Member policy types and helpers. Policies are loaded with getPortal() from ../portal.
import type { Tone } from "@/components/portal/ui";

/** Today as an ISO date in India (the portal's time zone). */
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export type Policy = {
  id: string;
  provider: string;
  name: string;
  kind: string;
  number: string;
  coverage: number;
  used: number;
  members: string[];
  validFrom: string; // ISO date
  validTill: string; // ISO date
  status: "Active" | "Expiring soon";
  overviewTitle: string;
  network: string;
  /** Card face colour (solid, deep tone). */
  face: string;
  details: { title: string; items: string[] }[];
  documents: string[];
};

export type Scheme = { name: string; detail: string; status: "Enrolled" | "Applied" };

export const getPolicy = (policies: Policy[], id: string) => policies.find((p) => p.id === id);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "15 Mar 2027". Formatted by hand so every browser and the server print the same text. */
export const formatDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m! - 1]} ${y}`; };

export const daysUntil = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / 86_400_000);

export const policyTone = (p: Policy): Tone => (p.status === "Active" ? "green" : "amber");

/** Totals across the member's policies, and the one that renews first. */
export function policyTotals(policies: Policy[]) {
  return {
    totalCoverage: policies.reduce((n, p) => n + p.coverage, 0),
    totalUsed: policies.reduce((n, p) => n + p.used, 0),
    nextRenewal: [...policies].sort((a, b) => daysUntil(a.validTill) - daysUntil(b.validTill))[0],
  };
}
