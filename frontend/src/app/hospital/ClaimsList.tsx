"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import DataTable, { type Column } from "@/components/DataTable";
import Tabs from "@/components/Tabs";
import { Surface } from "@/components/portal/ui";
import { claimState, type ClaimState, type Patient, verifiedCount } from "./data";
import { Avatar, Status } from "./ui";

const TABS = ["All", "In verification", "Ready to share", "Shared with insurer"] as const;
type Tab = (typeof TABS)[number];

/** One row per admitted patient; a row opens that patient's claim and documents. */
export default function ClaimsList({ patients }: { patients: Patient[] }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return patients.filter((p) => (tab === "All" || claimState(p) === tab) && (!t || [p.name, p.memberId, p.policy.provider, p.policy.number, p.claim?.id ?? ""].some((v) => v.toLowerCase().includes(t))));
  }, [patients, q, tab]);

  const columns: Column<Patient>[] = [
    { key: "patient", label: "Patient", sort: (p) => p.name, render: (p) => <span className="flex items-center gap-3"><Avatar name={p.name} className="size-9" /><span><span className="block font-semibold text-slate-900">{p.name}</span><span className="text-xs text-slate-500">{p.memberId}</span></span></span> },
    { key: "insurer", label: "Insurer", sort: (p) => p.policy.provider, render: (p) => <><span className="block text-slate-800">{p.policy.provider}</span><span className="text-xs text-slate-500">{p.policy.name}</span></> },
    { key: "ward", label: "Ward / bed", sort: (p) => p.bed ?? "", render: (p) => <><span className="block text-slate-800">{p.ward}</span><span className="text-xs text-slate-500">{p.bed}</span></> },
    { key: "docs", label: "Documents", sort: (p) => verifiedCount(p) / Math.max(p.documents.length, 1), render: (p) => <Progress done={verifiedCount(p)} total={p.documents.length} /> },
    { key: "claim", label: "Insurer claim", sort: (p) => p.claim?.id ?? "", render: (p) => p.claim ? <><span className="block text-slate-800">{p.claim.id}</span><span className="text-xs text-slate-500">{p.claim.status}</span></> : <span className="text-slate-400">—</span> },
    { key: "status", label: "Status", sort: (p) => claimState(p), render: (p) => <Status>{claimState(p) satisfies ClaimState}</Status> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Tabs value={tab} options={TABS} onChange={setTab} />
        <label className="relative lg:w-72">
          <span className="sr-only">Search claims</span>
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, member ID, insurer" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:ring-4 focus:ring-care-100" />
        </label>
      </div>
      <Surface className="overflow-hidden">
        <DataTable rows={rows} columns={columns} rowKey={(p) => p.id} href={(p) => `/hospital/claims/${p.id}`} empty="No patients in this view" />
      </Surface>
    </div>
  );
}

/** "4 of 6" with a thin bar in the portal accent. */
function Progress({ done, total }: { done: number; total: number }) {
  return (
    <span className="block w-28">
      <span className="text-slate-800">{done} of {total}</span><span className="text-xs text-slate-500"> verified</span>
      <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-care-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
    </span>
  );
}
