import Link from "next/link";
import AnimatedNumber from "@/components/AnimatedNumber";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Kpi from "@/components/Kpi";
import Reveal from "@/components/Reveal";
import { ViewLink } from "@/components/portal/ui";
import StaticTable from "@/components/StaticTable";
import { cn } from "@/lib/cn";
import { Avatar } from "../hospital/ui";
import GlobalSearch, { type SearchEntry } from "./GlobalSearch";
import { isOpen, type ClaimStatus } from "./data";
import { getInsurerData } from "./server";
import { ClaimsStatic, claimTone } from "./ui";

// Shades of the one brand blue, lightest for new claims, darkest for closed ones.
const BAR: Record<ClaimStatus, string> = { Received: "bg-brand-200", "Under review": "bg-brand-300", "Query raised": "bg-brand-400", Approved: "bg-brand-600", Settled: "bg-brand-800", Rejected: "bg-brand-950" };

export default async function InsurerDashboard() {
  const { CLAIMS, HOLDERS, INSURER, NET_HOSPITALS, claimViews, claimsAt, getHospital } = await getInsurerData();
  const open = CLAIMS.filter(isOpen);
  const admitted = HOLDERS.filter((h) => h.admission);
  const approved = CLAIMS.reduce((n, c) => n + (c.status === "Approved" || c.status === "Settled" ? (c.approved ?? 0) : 0), 0);
  const queue = claimViews([...open].sort((a, b) => b.claimed - a.claimed)).slice(0, 5);
  const entries: SearchEntry[] = [
    ...HOLDERS.map((h) => ({ type: "Policyholder" as const, title: h.name, sub: `${h.memberId} · ${h.policy.name}`, href: `/insurer/policyholders/${h.id}`, keywords: [h.name, h.memberId, h.policy.number, h.phone, h.admission ? (getHospital(h.admission.hospitalId)?.name ?? "") : ""].join(" ").toLowerCase() })),
    ...claimViews().map((c) => ({ type: "Claim" as const, title: `${c.id} · ${c.patientName}`, sub: `${c.diagnosis} · ${c.hospitalName}`, href: `/insurer/claims/${c.id}`, keywords: [c.id, c.memberId, c.patientName, c.diagnosis, c.hospitalName].join(" ").toLowerCase() })),
    ...NET_HOSPITALS.map((h) => ({ type: "Hospital" as const, title: h.name, sub: `${h.speciality} · ${h.city}`, href: `/insurer/hospitals/${h.id}`, keywords: [h.name, h.speciality].join(" ").toLowerCase() })),
  ];
  const statuses = (Object.keys(BAR) as ClaimStatus[]).map((s) => ({ s, n: CLAIMS.filter((c) => c.status === s).length })).filter((x) => x.n > 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <GlobalSearch entries={entries} title={INSURER.name} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Open claims"><AnimatedNumber value={open.length} /></Kpi>
        <Kpi label="Awaiting review"><AnimatedNumber value={CLAIMS.filter((c) => c.status === "Received" || c.status === "Under review").length} /></Kpi>
        <Kpi label="Policyholders in hospital"><AnimatedNumber value={admitted.length} /></Kpi>
        <Kpi label="Approved"><AnimatedNumber value={approved} prefix="₹" /></Kpi>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Claims to review</h2><ViewLink href="/insurer/claims" className="border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100">View all claims</ViewLink></div>
            <ClaimsStatic claims={queue} />
          </Card>
        </Reveal>
        <Reveal delay={100}>
          <Card className="h-full p-6">
            <h2 className="font-semibold text-slate-900">Claims by status</h2>
            <div className="mt-5 flex h-2.5 overflow-hidden rounded">{statuses.map(({ s, n }, i) => <span key={s} title={`${s}: ${n}`} className={cn("origin-left animate-grow", BAR[s])} style={{ width: `${(n / CLAIMS.length) * 100}%`, animationDelay: `${i * 80}ms` }} />)}</div>
            <ul className="mt-5 space-y-3">{statuses.map(({ s, n }) => <li key={s} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2.5 text-slate-700"><span className={cn("size-2.5 rounded-sm", BAR[s])} />{s}</span><span className="font-medium text-slate-900">{n}</span></li>)}</ul>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Policyholders in hospital</h2><ViewLink href="/insurer/policyholders" className="border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100">View all policyholders</ViewLink></div>
          <StaticTable rows={admitted} rowKey={(h) => h.id} href={(h) => `/insurer/policyholders/${h.id}`} columns={[
            { label: "Policyholder", render: (h) => <span className="flex items-center gap-3"><Avatar name={h.name} /><span><span className="block font-medium text-slate-900">{h.name}</span><span className="text-xs text-slate-500">{h.memberId}</span></span></span> },
            { label: "Hospital", render: (h) => <><span className="block text-slate-900">{getHospital(h.admission!.hospitalId)?.name}</span><span className="text-xs text-slate-500">{h.admission!.ward}</span></> },
            { label: "Diagnosis", render: (h) => <span className="text-slate-700">{h.admission!.diagnosis}</span> },
            { label: "Since", render: (h) => <span className="text-slate-600">{h.admission!.since}</span> },
          ]} />
        </Card>
      </Reveal>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Hospital network</h2><ViewLink href="/insurer/hospitals" className="border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100">View all hospitals</ViewLink></div>
          <StaticTable rows={NET_HOSPITALS} rowKey={(h) => h.id} href={(h) => `/insurer/hospitals/${h.id}`} columns={[
            { label: "Hospital", render: (h) => <><span className="block font-medium text-slate-900">{h.name}</span><span className="text-xs text-slate-500">{h.speciality}</span></> },
            { label: "Open claims", render: (h) => <span className="text-slate-700">{claimsAt(h.id).filter(isOpen).length}</span> },
            { label: "Avg. turnaround", render: (h) => <span className="text-slate-600">{h.avgTat} days</span> },
            { label: "Status", render: () => <Badge tone="blue">Cashless</Badge> },
          ]} />
        </Card>
      </Reveal>
    </div>
  );
}
