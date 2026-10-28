"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import DataTable, { type Column } from "@/components/DataTable";
import Tabs from "@/components/Tabs";
import { Surface } from "@/components/portal/ui";
import { claimState, type Patient } from "./data";
import { Avatar, Status } from "./ui";

const TABS = ["All", "Admitted", "Under observation", "Ready for discharge"] as const;
type Tab = (typeof TABS)[number];

export default function PatientDirectory({ patients }: { patients: Patient[] }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return patients.filter((p) => (tab === "All" || p.status === tab) && (!t || [p.name, p.memberId, p.ward ?? "", p.diagnosis, p.doctor ?? ""].some((v) => v.toLowerCase().includes(t))));
  }, [patients, q, tab]);
  const columns: Column<Patient>[] = [
    { key: "name", label: "Patient", sort: (p) => p.name, render: (p) => <span className="flex items-center gap-3"><Avatar name={p.name} /><span><span className="block font-semibold text-slate-900">{p.name}</span><span className="text-xs text-slate-400">{p.memberId} · {p.age} yrs · {p.gender}</span></span></span> },
    { key: "bed", label: "Ward / bed", sort: (p) => p.bed ?? "", render: (p) => <><span className="block font-medium text-slate-800">{p.ward}</span><span className="text-xs text-slate-400">{p.bed}</span></> },
    { key: "dx", label: "Diagnosis", sort: (p) => p.diagnosis, render: (p) => <span className="text-slate-600">{p.diagnosis}</span> },
    { key: "doc", label: "Doctor", sort: (p) => p.doctor ?? "", render: (p) => <span className="text-slate-600">{p.doctor}</span> },
    { key: "status", label: "Status", sort: (p) => p.status, render: (p) => <Status>{p.status}</Status> },
    { key: "claim", label: "Insurer", sort: (p) => claimState(p), render: (p) => <span className="text-slate-500">{claimState(p)}</span> },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Tabs value={tab} options={TABS} onChange={setTab} />
        <label className="relative lg:w-72">
          <span className="sr-only">Search patients</span>
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients" className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:ring-4 focus:ring-care-100" />
        </label>
      </div>
      <Surface className="overflow-hidden"><DataTable rows={rows} columns={columns} rowKey={(p) => p.id} href={(p) => `/hospital/patients/${p.id}`} empty="No patients match your search" /></Surface>
    </div>
  );
}
