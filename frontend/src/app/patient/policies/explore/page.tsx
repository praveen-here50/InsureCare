import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiFileText, FiHeart, FiSearch, FiShield } from "react-icons/fi";

const options = [
  { kind: "Insurance", provider: "CarePlus Insurance", name: "Family Health Shield Plus", description: "Comprehensive family cover with cashless hospital access and maternity support.", coverage: "₹15,00,000", premium: "From ₹1,249 / month", tags: ["Family cover", "Cashless network"], tone: "green" as const },
  { kind: "Insurance", provider: "SecureLife Assurance", name: "Critical Illness Protect", description: "Lump-sum support for 20+ critical illnesses with flexible individual cover.", coverage: "₹10,00,000", premium: "From ₹699 / month", tags: ["Individual cover", "Critical illness"], tone: "blue" as const },
  { kind: "Insurance", provider: "SafeGuard General", name: "Essential Health Care", description: "Affordable everyday health cover designed for individuals and small families.", coverage: "₹5,00,000", premium: "From ₹449 / month", tags: ["Affordable", "No room-rent cap"], tone: "gray" as const },
  { kind: "Government scheme", provider: "Government of India", name: "Ayushman Bharat PM-JAY", description: "Public healthcare support for eligible families through empanelled hospitals.", coverage: "Up to ₹5,00,000", premium: "Eligibility based", tags: ["Public programme", "Cashless care"], tone: "green" as const },
  { kind: "Government scheme", provider: "Government of Rajasthan", name: "Chiranjeevi Swasthya Bima Yojana", description: "State healthcare assistance for eligible residents across Rajasthan.", coverage: "Up to ₹10,00,000", premium: "State eligibility", tags: ["Rajasthan", "Government support"], tone: "blue" as const },
];

export default function ExplorePoliciesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/patient" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-900"><FiArrowLeft /> Back to dashboard</Link>
          <p className="text-sm font-medium text-teal-700">InsureCare directory</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Search policies and schemes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Explore insurance plans and government healthcare programmes available across providers. These are separate from the policies you already hold.</p>
        </div>
        <div className="hidden rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-900 sm:block"><FiSearch className="mb-2 text-xl text-teal-700" /><p className="text-xs font-semibold">Browse by need</p><p className="mt-1 text-xs text-teal-700">Compare cover, eligibility, and benefits</p></div>
      </div>

      <Card className="border-teal-100 bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white shadow-lg shadow-teal-900/10 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-teal-100">Find the right protection</p><h2 className="mt-1 text-xl font-semibold">Insurance and public healthcare in one place</h2><p className="mt-2 max-w-xl text-sm leading-6 text-teal-50">Review synthetic plan summaries before you decide what fits your family or eligibility needs.</p></div><FiShield className="hidden text-5xl text-white/20 sm:block" /></div></Card>

      <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-slate-950">Available policies and programmes</h2><p className="mt-1 text-sm text-slate-500">{options.length} options across insurers and government</p></div><span className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex"><FiFileText className="text-teal-700" /> Synthetic directory</span></div>
      <div className="grid gap-4 lg:grid-cols-2">{options.map((option) => <Card key={option.name} className="group p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-200/60 sm:p-6"><div className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><FiHeart /></span><div><Badge tone={option.tone}>{option.kind}</Badge><p className="mt-2 text-xs font-medium text-slate-500">{option.provider}</p><h3 className="mt-1 text-base font-semibold text-slate-950">{option.name}</h3></div></div><FiArrowRight className="mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-700" /></div><p className="mt-4 text-sm leading-6 text-slate-600">{option.description}</p><div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-xs text-slate-500">Coverage</p><p className="mt-1 text-sm font-semibold text-slate-900">{option.coverage}</p></div><div><p className="text-xs text-slate-500">Cost / access</p><p className="mt-1 text-sm font-semibold text-slate-900">{option.premium}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{option.tags.map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"><FiCheckCircle className="text-teal-600" />{tag}</span>)}</div><button type="button" className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">View eligibility and benefits <FiArrowRight /></button></div></Card>)}</div>
      <p className="pb-2 text-center text-xs leading-5 text-slate-400">Information shown is synthetic demo content for the InsureCare prototype. Confirm eligibility and terms with the relevant provider or government office.</p>
    </div>
  );
}
