import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  FiArrowRight,
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiHeart,
  FiMapPin,
  FiPlus,
  FiShield,
  FiTrendingUp,
  FiUpload,
} from "react-icons/fi";
import { MdOutlineSupportAgent } from "react-icons/md";

const patient = { name: "Priya", memberId: "DEMO-IC-7842", location: "Jaipur region", familyCovered: 4 };
const activePolicies = [
  { name: "Family Health Shield Plus", provider: "CarePlus Insurance", coverage: 1500000, validTill: "15 Mar 2027" },
  { name: "Critical Illness Rider", provider: "SecureLife Assurance", coverage: 500000, validTill: "30 Jun 2027" },
  { name: "Accidental Death Benefit", provider: "SafeGuard General", coverage: 1000000, validTill: "14 Jan 2027" },
];
const govtSchemes = [
  { name: "Ayushman Bharat PM-JAY", detail: "₹5,00,000 family coverage", status: "Enrolled" },
  { name: "Chiranjeevi Yojana", detail: "Cashless treatment up to ₹10 lakhs", status: "Applied" },
];
const hospitals = [
  { name: "Fortis Hospital", distance: "2.3 km", rating: "4.8", emergency: true },
  { name: "Narayana Multispecialty Hospital", distance: "3.7 km", rating: "4.6", emergency: true },
  { name: "Santokba Durlabhji Memorial", distance: "1.8 km", rating: "4.7", emergency: false },
];
const documents = [
  { name: "Policy Certificate — Family Health Shield Plus", date: "12 Sep 2026", type: "Policy" },
  { name: "Discharge Summary — Apollo Hospitals", date: "10 Sep 2026", type: "Medical" },
  { name: "Aadhaar Card (Verified)", date: "28 Aug 2026", type: "KYC" },
];
const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function SectionHeading({ title, detail, href }: { title: string; detail?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div><h2 className="text-base font-semibold text-slate-950">{title}</h2>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>
      {href && <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">View all <FiArrowRight /></Link>}
    </div>
  );
}

export default function PatientDashboard() {
  const totalCoverage = activePolicies.reduce((sum, policy) => sum + policy.coverage, 0);
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-sm font-medium text-teal-700">Synthetic demo account</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Good morning, Priya</h1><p className="mt-2 text-sm text-slate-500">Here&apos;s an overview of your healthcare cover.</p></div>
        <div className="flex items-center gap-3"><span className="hidden text-right text-xs text-slate-500 sm:block">Member ID<br /><strong className="text-slate-700">{patient.memberId}</strong></span><div className="flex size-11 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">PS</div></div>
      </div>

      <Card className="overflow-hidden border-teal-100 bg-teal-50/70 p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-lg bg-white p-2.5 text-teal-700 shadow-sm"><FiShield /></div><div><h2 className="font-semibold text-slate-950">Your cover is up to date</h2><p className="mt-1 text-sm text-slate-600">Demo coverage shows 3 active policies for a family of {patient.familyCovered}.</p></div></div><Link href="/patient/policies" className="inline-flex items-center gap-2 self-start rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800">Review policies <FiArrowRight /></Link></div></Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Active policies", value: "03", note: "All active", icon: FiShield, href: "/patient/policies" }, { label: "Total coverage", value: formatINR(totalCoverage), note: "Across all policies", icon: FiHeart }, { label: "Government schemes", value: "02", note: "1 enrolled · 1 applied", icon: FiPlus }, { label: "Next renewal", value: "12 days", note: "Family Health Shield Plus", icon: FiCalendar, href: "/patient/policies" }].map((stat) => { const Icon = stat.icon; const content = <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p><p className="mt-1 text-xs text-slate-500">{stat.note}</p></div><span className="rounded-lg bg-slate-100 p-2.5 text-teal-700"><Icon /></span></div></Card>; return stat.href ? <Link key={stat.label} href={stat.href}>{content}</Link> : <div key={stat.label}>{content}</div>; })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 sm:p-6"><SectionHeading title="My policies" detail="Your active insurance plans" href="/patient/policies" /><div className="flex flex-col divide-y divide-slate-100">{activePolicies.map((policy) => <Link href="/patient/policies" key={policy.name} className="group flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-1"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-teal-50 p-2 text-teal-700"><FiShield /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800 group-hover:text-teal-700">{policy.name}</p><p className="mt-1 text-xs text-slate-500">{policy.provider}</p><p className="mt-1 text-xs text-slate-500">Valid till {policy.validTill}</p></div></div><div className="hidden items-end gap-2 text-right sm:flex"><div><p className="text-sm font-semibold text-slate-900">{formatINR(policy.coverage)}</p><p className="mt-1 text-xs text-slate-500">Coverage</p></div><Badge tone="green">Active</Badge></div><FiChevronRight className="shrink-0 text-slate-400 sm:hidden" /></Link>)}</div></Card>
        <Card className="p-5 sm:p-6"><SectionHeading title="Government schemes" detail="Public healthcare benefits" /><div className="flex flex-col gap-3">{govtSchemes.map((scheme) => <div key={scheme.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{scheme.name}</p><p className="mt-1 text-xs text-slate-500">{scheme.detail}</p></div><Badge tone={scheme.status === "Enrolled" ? "green" : "blue"}>{scheme.status}</Badge></div></div>)}</div></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6"><SectionHeading title="Active claim" detail="Synthetic claim · status shown for demo" href="/patient/claims" /><div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">Hospitalisation claim</p><p className="mt-1 text-xs text-slate-600">Apollo Hospitals, Jaipur · 10 Sep 2026</p></div><Badge tone="green">Approved</Badge></div><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-500">Approved amount</p><p className="mt-1 text-xl font-semibold text-slate-950">₹45,000</p></div><Link href="/patient/claims" className="text-sm font-semibold text-teal-700">View details</Link></div></div></Card>
        <Card className="p-5 sm:p-6"><SectionHeading title="Nearby hospitals" detail={`Synthetic preview around ${patient.location}`} href="/patient/hospitals" /><div className="flex flex-col gap-2">{hospitals.map((hospital) => <Link href="/patient/hospitals" key={hospital.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 transition hover:border-teal-200 hover:bg-teal-50/40"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-slate-100 p-2 text-teal-700"><FiMapPin /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{hospital.name}</p><p className="mt-1 text-xs text-slate-500">{hospital.distance} · {hospital.rating}/5 {hospital.emergency && "· Emergency"}</p></div></div><FiChevronRight className="shrink-0 text-slate-400" /></Link>)}</div></Card>
      </div>

      <Card className="p-5 sm:p-6"><SectionHeading title="Quick actions" detail="Common tasks, one click away" /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Ask InsureCare", hint: "Get coverage answers", icon: MdOutlineSupportAgent, href: "/patient/assistant" }, { label: "Find a hospital", hint: "Search network care", icon: FiMapPin, href: "/patient/hospitals" }, { label: "Upload document", hint: "Keep records ready", icon: FiUpload, href: "/patient/documents" }, { label: "Track a claim", hint: "Check latest status", icon: FiClock, href: "/patient/claims" }].map((action) => { const Icon = action.icon; return <Link href={action.href} key={action.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-teal-200 hover:bg-teal-50/40"><span className="rounded-lg bg-teal-50 p-2.5 text-teal-700"><Icon /></span><span><p className="text-sm font-semibold text-slate-800">{action.label}</p><p className="mt-0.5 text-xs text-slate-500">{action.hint}</p></span></Link>; })}</div></Card>

      <div className="grid gap-6 pb-2 lg:grid-cols-2"><Card className="p-5 sm:p-6"><SectionHeading title="Recent documents" href="/patient/documents" /><div className="flex flex-col divide-y divide-slate-100">{documents.map((doc) => <div key={doc.name} className="flex items-center gap-3 py-3 first:pt-0"><span className="rounded-lg bg-slate-100 p-2 text-slate-500"><FiFileText /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{doc.name}</p><p className="mt-1 text-xs text-slate-500">Added {doc.date}</p></div><Badge tone="gray">{doc.type}</Badge></div>)}</div></Card><Card className="p-5 sm:p-6"><SectionHeading title="Recent activity" /><div className="flex flex-col gap-4"><div className="flex gap-3"><span className="mt-0.5 rounded-full bg-teal-50 p-2 text-teal-700"><FiTrendingUp /></span><div><p className="text-sm font-medium text-slate-800">Policy renewed successfully</p><p className="mt-1 text-xs text-slate-500">Family Health Shield Plus · 2 days ago</p></div></div><div className="flex gap-3"><span className="mt-0.5 rounded-full bg-blue-50 p-2 text-blue-700"><FiFileText /></span><div><p className="text-sm font-medium text-slate-800">Dental claim submitted</p><p className="mt-1 text-xs text-slate-500">₹2,500 · 5 days ago</p></div></div><div className="flex gap-3"><span className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-600"><FiMapPin /></span><div><p className="text-sm font-medium text-slate-800">Hospital visit recorded</p><p className="mt-1 text-xs text-slate-500">Apollo Hospital · 1 week ago</p></div></div></div></Card></div>
    </div>
  );
}
