"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSend, FiUserCheck } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Tabs from "@/components/Tabs";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/cn";
import { AGENT, type Patient, verifiedCount } from "./data";
import { Avatar, DocIcon, docTone } from "./ui";

const FILTERS = ["All", "Ready to share", "In verification", "Shared"] as const;

export default function ClaimsBoard({ patients }: { patients: Patient[] }) {
  const [shared, setShared] = useState<Record<string, string>>(() => Object.fromEntries(patients.filter((p) => p.sharedAt).map((p) => [p.id, p.sharedAt as string])));
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const stateOf = (p: Patient) => (shared[p.id] ? "Shared" : verifiedCount(p) === p.documents.length ? "Ready to share" : "In verification");
  const rows = patients.filter((p) => filter === "All" || stateOf(p) === filter);

  return (
    <div className="flex flex-col gap-6">
      <Card className="grid gap-6 p-6 md:grid-cols-2">
        <div><h2 className="text-sm font-semibold text-slate-900">Shared with the insurer</h2><ul className="mt-3 space-y-1.5 text-sm text-slate-600"><li>Member ID and policy number</li><li>Diagnosis and treatment plan</li><li>Verified documents and itemised bill</li></ul></div>
        <div><h2 className="text-sm font-semibold text-slate-900">Never shared</h2><ul className="mt-3 space-y-1.5 text-sm text-slate-600"><li>Full medical history and unrelated reports</li><li>Records from other admissions</li><li>Anything not verified by the agent</li></ul></div>
      </Card>

      <Tabs value={filter} options={FILTERS} onChange={setFilter} />

      <div className="grid gap-5 xl:grid-cols-2">
        {rows.map((p) => {
          const verified = verifiedCount(p);
          const total = p.documents.length;
          const open = total - verified;
          const done = shared[p.id];
          return (
            <Card key={p.id} className="flex flex-col p-6">
              <div className="flex items-start gap-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1"><Link href={`/hospital/patients/${p.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{p.name}</Link><p className="text-xs text-slate-500">{p.memberId} · {p.policy.provider}</p><p className="text-xs text-slate-400">{p.policy.name} · {p.policy.number}</p></div>
                <Badge tone={done ? "green" : open === 0 ? "blue" : "yellow"}>{done ? "Shared" : open === 0 ? "Ready to share" : "In verification"}</Badge>
              </div>
              <div className="mt-5"><div className="flex items-center justify-between text-xs font-medium text-slate-500"><span>{verified} of {total} documents verified</span><span>{Math.round((verified / total) * 100)}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full origin-left animate-grow rounded-full bg-brand-600" style={{ width: `${(verified / total) * 100}%` }} /></div></div>
              <ul className="mt-4 divide-y divide-slate-100">
                {p.documents.map((d) => (
                  <li key={d.name} className="flex items-start gap-3 py-2.5"><DocIcon status={d.status} className="mt-0.5" />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{d.name}</span>{d.note && <span className="block text-xs text-slate-500">{d.note}</span>}</span>
                    <Badge tone={docTone[d.status]}>{d.status}</Badge></li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><FiUserCheck className="shrink-0 text-brand-600" />Checked for accuracy, completeness and required details by {AGENT}</p>
              <div className="mt-5 border-t border-slate-100 pt-4">
                {done ? <p className="text-sm font-medium text-emerald-700">Sent to {p.policy.provider} · {done}</p> : (
                  <button type="button" disabled={open > 0} onClick={() => { setShared((s) => ({ ...s, [p.id]: "Just now" })); toast(`Documents sent to ${p.policy.provider}`); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none">
                    <FiSend />{open > 0 ? `Resolve ${open} document${open > 1 ? "s" : ""} to share` : `Send to ${p.policy.provider}`}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {rows.length === 0 && <Card className="p-10 text-center text-sm text-slate-500">Nothing in this view.</Card>}
    </div>
  );
}
