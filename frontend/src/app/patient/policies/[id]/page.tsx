import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { FiArrowRight, FiCalendar, FiCheckCircle, FiChevronDown, FiClock, FiFileText, FiHelpCircle, FiMapPin, FiPhone, FiShield, FiUsers } from "react-icons/fi";

type PolicyDetail = {
  id: string;
  provider: string;
  name: string;
  number: string;
  coverage: string;
  memberCount: string;
  validFrom: string;
  validTill: string;
  status: string;
  statusTone: "green" | "yellow";
  overviewTitle: string;
  network: string;
  renewalIn: string;
  details: [string, string[]][];
  documents: string[];
};

// Synthetic demo data. IDs must match the ones used on the policies list page.
const POLICIES: PolicyDetail[] = [
  {
    id: "family-health-shield", provider: "CarePlus Insurance", name: "Family Health Shield Plus", number: "IC-FH-••••-4821", coverage: "₹15,00,000", memberCount: "4 members", validFrom: "16 Mar 2026", validTill: "15 Mar 2027", status: "Active", statusTone: "green", overviewTitle: "Family protection cover", network: "Cashless access at participating hospitals", renewalIn: "12 days",
    details: [
      ["Coverage and benefits", ["Hospitalisation cover up to ₹15,00,000", "Pre and post-hospitalisation support", "Annual preventive health check-up", "Cashless care at participating network hospitals"]],
      ["Exclusions", ["Cosmetic procedures without medical necessity", "Treatment related to self-inflicted injury", "Experimental or unproven treatments"]],
      ["Waiting periods", ["Initial waiting period: 30 days", "Pre-existing conditions: 24 months", "Specified procedures: 24 months"]],
    ],
    documents: ["Policy certificate", "Government photo ID", "Discharge summary", "Bills and prescriptions"],
  },
  {
    id: "critical-illness-rider", provider: "SecureLife Assurance", name: "Critical Illness Rider", number: "IC-CI-••••-9037", coverage: "₹5,00,000", memberCount: "1 member", validFrom: "1 Jul 2026", validTill: "30 Jun 2027", status: "Active", statusTone: "green", overviewTitle: "Critical illness cover", network: "Network access available", renewalIn: "249 days",
    details: [
      ["Coverage and benefits", ["Lump-sum payout of up to ₹5,00,000 on diagnosis of a covered critical illness", "Covered conditions are listed in the policy schedule", "Second medical opinion support", "Payout is independent of hospital bills"]],
      ["Exclusions", ["Illnesses not listed in the policy schedule", "Conditions diagnosed during the waiting period", "Treatment related to self-inflicted injury"]],
      ["Waiting periods", ["Initial waiting period: 90 days", "Survival period after diagnosis: 30 days", "Pre-existing conditions: 36 months"]],
    ],
    documents: ["Policy certificate", "Government photo ID", "Specialist diagnosis report", "Hospital and treatment records"],
  },
  {
    id: "accidental-death-benefit", provider: "SafeGuard General", name: "Accidental Death Benefit", number: "IC-AD-••••-1764", coverage: "₹10,00,000", memberCount: "1 member", validFrom: "15 Jan 2026", validTill: "14 Jan 2027", status: "Expiring soon", statusTone: "yellow", overviewTitle: "Accidental death cover", network: "Benefit-only cover (no hospital network)", renewalIn: "82 days",
    details: [
      ["Coverage and benefits", ["Lump-sum benefit of ₹10,00,000 to the nominee on accidental death", "Covers accidents at home, on the road and while travelling", "Funeral expense support", "No hospital network required"]],
      ["Exclusions", ["Death caused by illness or natural causes", "Accidents while under the influence of alcohol or drugs", "Hazardous adventure sports", "Self-inflicted injury"]],
      ["Waiting periods", ["No waiting period for accidental death", "Claim must be intimated within 30 days of the incident"]],
    ],
    documents: ["Policy certificate", "Nominee photo ID", "Police report (FIR)", "Death certificate"],
  },
];

export default async function PolicyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = POLICIES.find((item) => item.id === id);
  if (!policy) notFound();
  return <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/patient/policies" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950"><FiArrowRight className="rotate-180" /> My policies</Link><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{policy.name}</h1></div><Badge tone={policy.statusTone}>{policy.status}</Badge></div>
    
    <Card className="overflow-hidden"><div className="bg-teal-700 p-5 text-white sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-teal-100">Policy overview</p><h2 className="mt-2 text-xl font-semibold">{policy.overviewTitle}</h2></div><FiShield className="text-2xl text-teal-100" /></div></div><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4"><div><p className="text-xs text-slate-500">Coverage amount</p><p className="mt-1 text-lg font-semibold text-slate-950">{policy.coverage}</p></div><div><p className="text-xs text-slate-500">Members covered</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><FiUsers className="text-slate-500" /> {policy.memberCount}</p></div><div><p className="text-xs text-slate-500">Policy period</p><p className="mt-1 text-sm font-semibold text-slate-900">{policy.validFrom} – {policy.validTill}</p></div><div><p className="text-xs text-slate-500">Renewal</p><p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-900"><FiClock className="text-amber-600" /> {policy.renewalIn}</p></div></div></Card>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="flex flex-col gap-4">{policy.details.map(([title, items]) => <Card key={title as string} className="p-5 sm:p-6"><h2 className="flex items-center gap-2 text-base font-semibold text-slate-950"><FiCheckCircle className="text-slate-500" />{title as string}</h2><ul className="mt-4 flex flex-col gap-3">{(items as string[]).map((item) => <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" />{item}</li>)}</ul></Card>)}<Card className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Network hospitals</h2><p className="mt-1 text-sm text-slate-500">Hospitals where cashless treatment may be available.</p><div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-slate-600"><FiMapPin /></span><div><p className="text-sm font-semibold text-slate-800">Participating hospitals</p><p className="mt-1 text-xs text-slate-500">{policy.network}</p></div></div><FiChevronDown className="text-slate-400" /></div></Card></div>
    <div className="flex flex-col gap-4"><Card className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Claim information</h2><p className="mt-2 text-sm leading-6 text-slate-500">For a planned admission, notify your insurer before treatment. For emergencies, notify within the timeline stated in your policy terms.</p><div className="mt-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-900"><p className="font-semibold">Claim support hours</p><p className="mt-1 text-xs text-teal-800">24/7 emergency line</p></div></Card><Card className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Required documents</h2><ul className="mt-4 flex flex-col gap-3">{policy.documents.map((item) => <li key={item} className="flex items-center gap-3 text-sm text-slate-600"><FiFileText className="text-slate-500" />{item}</li>)}</ul></Card><Card className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Renewal information</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your policy renews on {policy.validTill}. Review benefits and premium details before renewal.</p><div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-700"><FiCalendar /> Renewal due in {policy.renewalIn}</div></Card><Card className="p-5 sm:p-6"><h2 className="text-base font-semibold text-slate-950">Insurer contact</h2><p className="mt-2 text-sm text-slate-500">Reach the insurer's support team.</p><div className="mt-4 flex flex-col gap-3 text-sm"><span className="flex items-center gap-2 text-slate-700"><FiPhone className="text-slate-500" /> 1800-000-000</span><span className="flex items-center gap-2 text-slate-700"><FiHelpCircle className="text-slate-500" /> support@example.com</span></div></Card></div></div>
  </div>;
}
