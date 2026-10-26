import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import AnimatedNumber from "@/components/AnimatedNumber";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Kpi from "@/components/Kpi";
import Reveal from "@/components/Reveal";
import StaticTable from "@/components/StaticTable";
import { cn } from "@/lib/cn";
import MemberLookup from "./MemberLookup";
import { HOSPITAL, PATIENTS, WARDS, admitted, claimState, verifiedCount, wardAvailable } from "./data";
import { Avatar, statusTone } from "./ui";

export default function HospitalDashboard() {
  const inHouse = admitted();
  const queue = inHouse.filter((p) => claimState(p) !== "Shared with insurer");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <MemberLookup ids={PATIENTS.map((p) => p.memberId)} title={HOSPITAL.name} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Beds available"><AnimatedNumber value={WARDS.reduce((n, w) => n + wardAvailable(w), 0)} /></Kpi>
        <Kpi label="Patients in hospital"><AnimatedNumber value={inHouse.length} /></Kpi>
        <Kpi label="Claims to action"><AnimatedNumber value={queue.length} /></Kpi>
        <Kpi label="Shared with insurers today"><AnimatedNumber value={inHouse.filter((p) => p.sharedAt).length} /></Kpi>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Bed occupancy</h2><Link href="/hospital/beds" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">Bed map<FiChevronRight /></Link></div>
            <ul className="px-3 pb-3">{WARDS.map((w, i) => {
              const used = w.occupied + w.reserved; const pct = Math.round((used / w.total) * 100);
              return <li key={w.id}><Link href="/hospital/beds" className="group block rounded-lg px-3 py-3 transition hover:bg-slate-50">
                <div className="flex items-baseline justify-between text-sm"><span className="font-medium text-slate-900">{w.name}</span><span className="text-slate-500"><span className="font-medium text-slate-900">{wardAvailable(w)}</span> free of {w.total}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100"><div className={cn("h-full origin-left animate-grow rounded", pct > 85 ? "bg-rose-500" : "bg-brand-600")} style={{ width: `${pct}%`, animationDelay: `${i * 90}ms` }} /></div>
              </Link></li>;
            })}</ul>
          </Card>
        </Reveal>
        <Reveal className="lg:col-span-3" delay={100}>
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Insurer claims</h2><Link href="/hospital/claims" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">Open<FiChevronRight /></Link></div>
            <StaticTable rows={queue} rowKey={(p) => p.id} href={() => "/hospital/claims"} columns={[
              { label: "Patient", render: (p) => <><span className="block font-medium text-slate-900">{p.name}</span><span className="text-xs text-slate-500">{p.policy.provider}</span></> },
              { label: "Documents", render: (p) => <span className="text-slate-700">{verifiedCount(p)} of {p.documents.length} verified</span> },
              { label: "Status", render: (p) => <Badge tone={claimState(p) === "Ready to share" ? "blue" : "yellow"}>{claimState(p)}</Badge> },
            ]} />
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Recent admissions</h2><Link href="/hospital/patients" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">All patients<FiChevronRight /></Link></div>
          <StaticTable rows={inHouse.slice(0, 5)} rowKey={(p) => p.id} href={(p) => `/hospital/patients/${p.id}`} columns={[
            { label: "Patient", render: (p) => <span className="flex items-center gap-3"><Avatar name={p.name} /><span><span className="block font-medium text-slate-900">{p.name}</span><span className="text-xs text-slate-500">{p.memberId}</span></span></span> },
            { label: "Ward / bed", render: (p) => <span className="text-slate-700">{p.ward} · {p.bed}</span> },
            { label: "Diagnosis", render: (p) => <span className="text-slate-700">{p.diagnosis}</span> },
            { label: "Status", render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge> },
          ]} />
        </Card>
      </Reveal>
    </div>
  );
}
