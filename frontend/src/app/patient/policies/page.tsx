import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { FiArrowRight, FiCalendar, FiCheckCircle, FiChevronRight, FiClock, FiFileText, FiGrid, FiShield, FiUsers } from "react-icons/fi";

const policies = [
  { id: "family-health-shield", provider: "CarePlus Insurance", name: "Family Health Shield Plus", number: "IC-FH-••••-4821", coverage: "₹15,00,000", members: "4 members", validity: "15 Mar 2027", status: "Active", network: "Cashless network available", renewal: "12 days" },
  { id: "critical-illness-rider", provider: "SecureLife Assurance", name: "Critical Illness Rider", number: "IC-CI-••••-9037", coverage: "₹5,00,000", members: "1 member", validity: "30 Jun 2027", status: "Active", network: "Network access available" },
  { id: "accidental-death-benefit", provider: "SafeGuard General", name: "Accidental Death Benefit", number: "IC-AD-••••-1764", coverage: "₹10,00,000", members: "1 member", validity: "14 Jan 2027", status: "Expiring soon", network: "Benefit-only cover" },
];
const schemes = [
  { name: "Ayushman Bharat PM-JAY", detail: "Synthetic demo enrollment · ₹5,00,000 family coverage", status: "Enrolled" },
  { name: "Chiranjeevi Yojana", detail: "Synthetic demo application · Cashless treatment support", status: "Applied" },
];

export default function PoliciesPage() {
  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium text-teal-700">Synthetic demo account</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My policies</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Review your active insurance cover, government schemes, and renewal dates in one place.</p></div><Link href="/patient" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"><FiArrowRight className="rotate-180" /> Back to dashboard</Link></div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Demo information:</strong> These policies, numbers, providers, and amounts are synthetic examples for the InsureCare prototype.</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Active policies", value: "03", note: "All policies listed", icon: FiShield }, { label: "Total coverage", value: "₹30,00,000", note: "Across insurance policies", icon: FiCheckCircle }, { label: "Government schemes", value: "02", note: "1 enrolled · 1 applied", icon: FiFileText }, { label: "Upcoming renewal", value: "12 days", note: "Family Health Shield Plus", icon: FiCalendar }].map((stat) => { const Icon = stat.icon; return <Card key={stat.label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.note}</p></div><span className="rounded-lg bg-slate-100 p-2.5 text-teal-700"><Icon /></span></div></Card>; })}</div>
    <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-slate-950">Insurance policies</h2><p className="mt-1 text-sm text-slate-500">Your synthetic active and renewing plans</p></div><button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-teal-200 hover:text-teal-700"><FiGrid /> Compare policies</button></div>
    <div className="flex flex-col gap-4">{policies.map((policy) => <Card key={policy.id} className="p-5 sm:p-6"><div className="flex flex-col gap-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><span className="rounded-lg bg-teal-50 p-2.5 text-teal-700"><FiShield /></span><div><p className="text-xs font-medium text-slate-500">{policy.provider}</p><h3 className="mt-1 text-base font-semibold text-slate-950">{policy.name}</h3><p className="mt-1 text-xs text-slate-500">Policy {policy.number}</p></div></div><Badge tone={policy.status === "Active" ? "green" : "blue"}>{policy.status}</Badge></div><div className="grid gap-4 border-y border-slate-100 py-4 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-slate-500">Coverage amount</p><p className="mt-1 text-sm font-semibold text-slate-900">{policy.coverage}</p></div><div><p className="text-xs text-slate-500">Members covered</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><FiUsers className="text-teal-700" />{policy.members}</p></div><div><p className="text-xs text-slate-500">Valid until</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><FiCalendar className="text-teal-700" />{policy.validity}</p></div><div><p className="text-xs text-slate-500">Hospital network</p><p className="mt-1 text-sm font-semibold text-slate-900">{policy.network}</p></div></div><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-xs text-slate-500">{policy.renewal ? <><FiClock className="text-amber-600" /> Renewal due in {policy.renewal}</> : <><FiCheckCircle className="text-teal-700" /> Policy in good standing</>}</div><Link href={`/patient/policies/${policy.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800">View details <FiChevronRight /></Link></div></div></Card>)}</div>
    <section><div className="mb-4"><h2 className="text-base font-semibold text-slate-950">Government schemes</h2><p className="mt-1 text-sm text-slate-500">Public healthcare benefits shown for demo purposes</p></div><div className="grid gap-4 lg:grid-cols-2">{schemes.map((scheme) => <Card key={scheme.name} className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-semibold text-slate-900">{scheme.name}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{scheme.detail}</p></div><Badge tone={scheme.status === "Enrolled" ? "green" : "blue"}>{scheme.status}</Badge></div></Card>)}</div></section>
  </div>;
}

void policies;
void schemes;
void Badge;
void Card;
void Link;
void FiArrowRight;
void FiCalendar;
void FiCheckCircle;
void FiChevronRight;
void FiClock;
void FiFileText;
void FiGrid;
void FiShield;
void FiUsers;
