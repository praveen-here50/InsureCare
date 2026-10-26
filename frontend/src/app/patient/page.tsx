import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import AnimatedNumber from "@/components/AnimatedNumber";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Kpi from "@/components/Kpi";
import PageHeader from "@/components/PageHeader";
import Photo from "@/components/Photo";
import Reveal from "@/components/Reveal";
import StaticTable from "@/components/StaticTable";
import { IMG } from "@/lib/images";
import { claims } from "./claims/data";
import { HOSPITALS } from "./hospitals/data";

const policies = [
  { id: "family-health-shield", name: "Family Health Shield Plus", provider: "CarePlus Insurance", coverage: 1500000, used: 0, validTill: "15 Mar 2027", status: "Active" },
  { id: "critical-illness-rider", name: "Critical Illness Rider", provider: "SecureLife Assurance", coverage: 500000, used: 0, validTill: "30 Jun 2027", status: "Active" },
  { id: "accidental-death-benefit", name: "Accidental Death Benefit", provider: "SafeGuard General", coverage: 1000000, used: 0, validTill: "14 Jan 2027", status: "Expiring soon" },
];
const documents = [
  { name: "Policy certificate, Family Health Shield Plus", date: "12 Sep 2026", type: "Policy" },
  { name: "Discharge summary, Riverbend Community Hospital", date: "10 Sep 2026", type: "Medical" },
  { name: "Aadhaar card", date: "28 Aug 2026", type: "Identity" },
];
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const total = policies.reduce((n, p) => n + p.coverage, 0);
const open = claims.filter((c) => !["Settled", "Approved", "Rejected"].includes(c.status));
const tone = (s: string) => (s === "Settled" || s === "Approved" ? "green" : s === "Rejected" ? "red" : s.startsWith("Additional") ? "yellow" : "blue");

export default function PatientDashboard() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Overview" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total coverage"><AnimatedNumber value={total} prefix="₹" /></Kpi>
        <Kpi label="Active policies"><AnimatedNumber value={policies.length} /></Kpi>
        <Kpi label="Claims in progress" hint={open[0] ? `${open[0].id}, ${open[0].status.toLowerCase()}` : undefined}><AnimatedNumber value={open.length} /></Kpi>
        <Kpi label="Next renewal" hint="Family Health Shield Plus">12 days</Kpi>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Policies</h2><Link href="/patient/policies" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">View all<FiChevronRight /></Link></div>
            <StaticTable rows={policies} rowKey={(p) => p.id} href={(p) => `/patient/policies/${p.id}`} columns={[
              { label: "Policy", render: (p) => <><span className="block font-medium text-slate-900">{p.name}</span><span className="text-xs text-slate-500">{p.provider}</span></> },
              { label: "Cover", render: (p) => <span className="font-medium text-slate-900">{inr(p.coverage)}</span> },
              { label: "Valid till", render: (p) => <span className="text-slate-600">{p.validTill}</span> },
              { label: "Status", render: (p) => <Badge tone={p.status === "Active" ? "green" : "yellow"}>{p.status}</Badge> },
            ]} />
          </Card>
        </Reveal>

        <Reveal delay={100}>
          <Link href="/patient/hospitals" className="group relative block h-full min-h-[260px] overflow-hidden rounded-xl">
            <Photo src={IMG.building} alt="Hospital building" className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-white"><span className="block text-lg font-semibold">Find a network hospital</span><span className="mt-1 flex items-center gap-1 text-sm text-white/80">{HOSPITALS.filter((h) => h.network === "Network").length} cashless hospitals near you<FiChevronRight className="transition-transform group-hover:translate-x-1" /></span></span>
          </Link>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Recent claims</h2><Link href="/patient/claims" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">View all<FiChevronRight /></Link></div>
            <StaticTable rows={claims.slice(0, 4)} rowKey={(c) => c.id} href={(c) => `/patient/claims/${c.id}`} columns={[
              { label: "Claim", render: (c) => <><span className="block font-medium text-slate-900">{c.id}</span><span className="text-xs text-slate-500">{c.provider}</span></> },
              { label: "Amount", render: (c) => <span className="text-slate-700">{c.amountClaimed}</span> },
              { label: "Status", render: (c) => <Badge tone={tone(c.status)}>{c.status === "Additional Documents Required" ? "Documents needed" : c.status}</Badge> },
            ]} />
          </Card>
        </Reveal>
        <Reveal delay={100}>
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Nearby hospitals</h2><Link href="/patient/hospitals" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">View all<FiChevronRight /></Link></div>
            <StaticTable rows={HOSPITALS.slice(0, 4)} rowKey={(h) => h.id} href={(h) => `/patient/hospitals/${h.id}`} columns={[
              { label: "Hospital", render: (h) => <span className="font-medium text-slate-900">{h.name}</span> },
              { label: "Distance", render: (h) => <span className="text-slate-600">{h.distance}</span> },
              { label: "Network", render: (h) => <Badge tone={h.network === "Network" ? "green" : "gray"}>{h.network === "Network" ? "Cashless" : "Non-network"}</Badge> },
            ]} />
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4"><h2 className="font-semibold text-slate-900">Documents</h2><Link href="/patient/documents" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950">View all<FiChevronRight /></Link></div>
          <StaticTable rows={documents} rowKey={(d) => d.name} href={() => "/patient/documents"} columns={[
            { label: "Name", render: (d) => <span className="font-medium text-slate-900">{d.name}</span> },
            { label: "Type", render: (d) => <span className="text-slate-600">{d.type}</span> },
            { label: "Added", render: (d) => <span className="text-slate-600">{d.date}</span>, align: "right" },
          ]} />
        </Card>
      </Reveal>
    </div>
  );
}
