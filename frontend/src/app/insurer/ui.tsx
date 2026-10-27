import Badge from "@/components/Badge";
import StaticTable from "@/components/StaticTable";
import { inr } from "../hospital/data";
import type { ClaimStatus, ClaimView } from "./data";

// One standard colour for every claim stage; the label itself says which stage it is.
export const claimTone: Record<ClaimStatus, "blue"> = { Received: "blue", "Under review": "blue", "Query raised": "blue", Approved: "blue", Settled: "blue", Rejected: "blue" };

/** Read-only claims table. Each row opens the claim. */
export function ClaimsStatic({ claims }: { claims: ClaimView[] }) {
  return (
    <StaticTable rows={claims} rowKey={(c) => c.id} href={(c) => `/insurer/claims/${c.id}`} columns={[
      { label: "Claim", render: (c) => <><span className="block font-medium text-slate-900">{c.id}</span><span className="text-xs text-slate-500">{c.diagnosis}</span></> },
      { label: "Patient", render: (c) => <span className="text-slate-700">{c.patientName}</span> },
      { label: "Hospital", render: (c) => <span className="text-slate-600">{c.hospitalName}</span> },
      { label: "Amount", align: "right", render: (c) => <span className="font-medium text-slate-900">{inr(c.claimed)}</span> },
      { label: "Status", render: (c) => <Badge tone={claimTone[c.status]}>{c.status}</Badge> },
    ]} />
  );
}
