import Link from "next/link";
import { FiArrowRight, FiAward, FiCalendar, FiShield, FiUsers } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { IconBadge, inr, PageIntro, Pill, SectionHeading, StatCard, Surface } from "@/components/portal/ui";
import { getPortal } from "../portal";
import { daysUntil, formatDate, policyTone, policyTotals, type Policy } from "./data";

export default async function PoliciesPage() {
  const { policies: POLICIES, schemes: SCHEMES } = await getPortal();
  const { totalCoverage, nextRenewal } = policyTotals(POLICIES);
  return (
    <div className="flex flex-col gap-8">
      <PageIntro eyebrow="My policies" title="Everything you're covered for" description="Your insurance plans and government schemes in one view. Open any policy to see benefits, exclusions and waiting periods." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiShield} value={POLICIES.length} label="Active policies" note="Health, illness and accident" />
        <StatCard icon={FiAward} value={inr(totalCoverage)} label="Total cover" note="Across all policies" />
        <StatCard icon={FiUsers} value={SCHEMES.length} label="Government schemes" note={`${SCHEMES.filter((s) => s.status === "Enrolled").length} enrolled · ${SCHEMES.filter((s) => s.status === "Applied").length} applied`} />
        <StatCard icon={FiCalendar} value={`${daysUntil(nextRenewal.validTill)} days`} label="Next renewal" note={nextRenewal.name} />
      </div>

      <section>
        <SectionHeading title="Insurance policies" description="Tap a card to see full benefits" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {POLICIES.map((p) => <PolicyTile key={p.id} policy={p} />)}
        </div>
      </section>

      <section>
        <SectionHeading title="Government schemes" description="Public healthcare benefits linked to your account" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SCHEMES.map((s) => (
            <Surface key={s.name} className="flex items-start gap-4 p-5">
              <IconBadge icon={FiAward} />
              <div className="flex-1"><h3 className="font-bold text-ink">{s.name}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{s.detail}</p></div>
              <Pill tone={s.status === "Enrolled" ? "green" : "sky"} dot>{s.status}</Pill>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}

function PolicyTile({ policy: p }: { policy: Policy }) {
  const days = daysUntil(p.validTill);
  return (
    <Link href={`/patient/policies/${p.id}`} className="group">
      <Surface className="h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* Card face */}
        <div className={cn("relative overflow-hidden p-6 text-white", p.face)}>
          <div className="relative flex items-start justify-between">
            <div><p className="text-xs font-semibold text-white/70">{p.provider} · {p.kind}</p><h3 className="mt-1 text-xl font-extrabold tracking-tight">{p.name}</h3></div>
          </div>
          <p className="relative mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Sum insured</p>
          <p className="relative text-3xl font-extrabold tracking-[-0.03em]">{inr(p.coverage)}</p>
          <p className="relative mt-4 font-mono text-sm tracking-wider text-white/80">{p.number}</p>
        </div>
        {/* Details */}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <Pill tone={policyTone(p)} dot>{p.status}</Pill>
            <span className="text-xs font-medium text-slate-400">Valid till {formatDate(p.validTill)}</span>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-500">Cover remaining</span><span className="font-bold text-ink">{inr(p.coverage - p.used)}</span></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500"><FiUsers className="text-slate-400" />{p.members.length} {p.members.length === 1 ? "member" : "members"} · renews in {days} days</span>
            <FiArrowRight className="text-care-600 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Surface>
    </Link>
  );
}
