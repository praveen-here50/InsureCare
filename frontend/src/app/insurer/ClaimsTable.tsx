"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import DataTable, { type Column } from "@/components/DataTable";
import Tabs from "@/components/Tabs";
import { inr } from "../hospital/data";
import { OPEN, type ClaimView } from "./data";
import { claimTone } from "./ui";

const TABS = ["All", "Needs action", "Approved / settled", "Rejected"] as const;
const match = (tab: (typeof TABS)[number], c: ClaimView) =>
  tab === "All" || (tab === "Needs action" && OPEN.includes(c.status)) || (tab === "Approved / settled" && (c.status === "Approved" || c.status === "Settled")) || (tab === "Rejected" && c.status === "Rejected");

export default function ClaimsTable({ claims, hospitals }: { claims: ClaimView[]; hospitals: { id: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [hospital, setHospital] = useState("");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return claims.filter((c) => match(tab, c) && (!hospital || c.hospitalId === hospital) && (!t || [c.id, c.memberId, c.patientName, c.hospitalName, c.diagnosis].some((v) => v.toLowerCase().includes(t))));
  }, [claims, q, tab, hospital]);
  const columns: Column<ClaimView>[] = [
    { key: "id", label: "Claim", sort: (c) => c.id, render: (c) => <><span className="block font-medium text-slate-900">{c.id}</span><span className="text-xs text-slate-500">{c.type}</span></> },
    { key: "patient", label: "Patient", sort: (c) => c.patientName, render: (c) => <><span className="block text-slate-900">{c.patientName}</span><span className="text-xs text-slate-500">{c.memberId}</span></> },
    { key: "dx", label: "Diagnosis", sort: (c) => c.diagnosis, render: (c) => <span className="text-slate-700">{c.diagnosis}</span> },
    { key: "hospital", label: "Hospital", sort: (c) => c.hospitalName, render: (c) => <span className="text-slate-600">{c.hospitalName}</span> },
    { key: "amount", label: "Amount", sort: (c) => c.claimed, align: "right", render: (c) => <span className="font-medium text-slate-900">{inr(c.claimed)}</span> },
    { key: "date", label: "Submitted", sort: (c) => new Date(c.submittedOn).getTime(), render: (c) => <span className="text-slate-600">{c.submittedOn}</span> },
    { key: "status", label: "Status", sort: (c) => c.status, render: (c) => <Badge tone={claimTone[c.status]}>{c.status}</Badge> },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Tabs value={tab} options={TABS} onChange={setTab} />
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative sm:w-64"><span className="sr-only">Search claims</span><FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search claims" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400" /></label>
          <select value={hospital} onChange={(e) => setHospital(e.target.value)} aria-label="Hospital" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="">All hospitals</option>{hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>
      <Card className="overflow-hidden"><DataTable rows={rows} columns={columns} rowKey={(c) => c.id} href={(c) => `/insurer/claims/${c.id}`} empty="No claims match these filters" /></Card>
    </div>
  );
}
