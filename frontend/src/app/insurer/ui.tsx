import { FiAlertTriangle } from "react-icons/fi";
import Badge from "@/components/Badge";
import StaticTable from "@/components/StaticTable";
import { inr } from "../hospital/data";
import type { Claim, ClaimStatus, ClaimView } from "./data";

// One standard colour for every claim stage; the label itself says which stage it is.
export const claimTone: Record<ClaimStatus, "blue"> = { Received: "blue", "Under review": "blue", "Query raised": "blue", Approved: "blue", Settled: "blue", Rejected: "blue" };

/** The worst automatic document-check result on a claim, if any document needs attention. */
export function docRisk(c: Claim): string | undefined {
  const statuses = c.docs.map((d) => d.check?.status);
  if (statuses.includes("High risk")) return "Document high risk";
  if (statuses.includes("Needs review")) return "Document needs review";
  return undefined;
}

/** Warning line shown under a claim number when one of its document checks needs attention. */
export function RiskLine({ c }: { c: Claim }) {
  const risk = docRisk(c);
  return risk ? <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-700"><FiAlertTriangle className="size-3 shrink-0" />{risk}</span> : null;
}

/** Claim number with its type and any document-check warning. */
export function ClaimCell({ c }: { c: ClaimView }) {
  return <><span className="block font-medium text-slate-900">{c.id}</span><span className="text-xs text-slate-500">{c.type}</span><RiskLine c={c} /></>;
}

/** Read-only claims table. Each row opens the claim. */
export function ClaimsStatic({ claims }: { claims: ClaimView[] }) {
  return (
    <StaticTable rows={claims} rowKey={(c) => c.id} href={(c) => `/insurer/claims/${c.id}`} columns={[
      { label: "Claim", render: (c) => <><span className="block font-medium text-slate-900">{c.id}</span><span className="text-xs text-slate-500">{c.diagnosis}</span><RiskLine c={c} /></> },
      { label: "Patient", render: (c) => <span className="text-slate-700">{c.patientName}</span> },
      { label: "Hospital", render: (c) => <span className="text-slate-600">{c.hospitalName}</span> },
      { label: "Amount", align: "right", render: (c) => <span className="font-medium text-slate-900">{inr(c.claimed)}</span> },
      { label: "Status", render: (c) => <Badge tone={claimTone[c.status]}>{c.status}</Badge> },
    ]} />
  );
}
