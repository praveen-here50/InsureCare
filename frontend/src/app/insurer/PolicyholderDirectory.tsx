"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import DataTable, { type Column } from "@/components/DataTable";
import Tabs from "@/components/Tabs";
import { Avatar } from "../hospital/ui";

export type HolderView = { id: string; memberId: string; name: string; age: number; gender: string; policy: string; policyNumber: string; phone: string; hospital?: string; location?: string; diagnosis?: string; openClaims: number };
const TABS = ["All", "Admitted now", "Open claims"] as const;

export default function PolicyholderDirectory({ holders }: { holders: HolderView[] }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return holders.filter((h) => (tab === "All" || (tab === "Admitted now" && h.hospital) || (tab === "Open claims" && h.openClaims > 0)) && (!t || [h.name, h.memberId, h.policy, h.policyNumber, h.phone, h.hospital ?? "", h.diagnosis ?? ""].some((v) => v.toLowerCase().includes(t))));
  }, [holders, q, tab]);
  const columns: Column<HolderView>[] = [
    { key: "name", label: "Policyholder", sort: (h) => h.name, render: (h) => <span className="flex items-center gap-3"><Avatar name={h.name} /><span><span className="block font-medium text-slate-900">{h.name}</span><span className="text-xs text-slate-500">{h.memberId} · {h.age} yrs · {h.gender}</span></span></span> },
    { key: "policy", label: "Policy", sort: (h) => h.policy, render: (h) => <><span className="block text-slate-900">{h.policy}</span><span className="text-xs text-slate-500">{h.policyNumber}</span></> },
    { key: "hospital", label: "Current hospital", sort: (h) => h.hospital ?? "~", render: (h) => h.hospital ? <><span className="block text-slate-900">{h.hospital}</span><span className="text-xs text-slate-500">{h.location}</span></> : <span className="text-slate-400">Not admitted</span> },
    { key: "claims", label: "Open claims", sort: (h) => h.openClaims, render: (h) => h.openClaims > 0 ? <Badge tone="blue">{h.openClaims} open</Badge> : <span className="text-slate-400">None</span> },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Tabs value={tab} options={TABS} onChange={setTab} />
        <label className="relative sm:w-72"><span className="sr-only">Search policyholders</span><FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search policyholders" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400" /></label>
      </div>
      <Card className="overflow-hidden"><DataTable rows={rows} columns={columns} rowKey={(h) => h.id} href={(h) => `/insurer/policyholders/${h.id}`} empty="No policyholders match your search" /></Card>
    </div>
  );
}
