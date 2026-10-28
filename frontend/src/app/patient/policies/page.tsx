import Link from "next/link";
import { FiArrowRight, FiAward, FiCalendar, FiShield, FiUsers } from "react-icons/fi";
import { IconBadge, inr, PageIntro, Pill, SectionHeading, StatCard, Surface } from "@/components/portal/ui";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { getPortal } from "../portal";
import { daysUntil, formatDate, policyTone, policyTotals, type Policy } from "./data";

export default async function PoliciesPage() {
  const { policies: POLICIES, schemes: SCHEMES } = await getPortal();
  const t = await getT();
  const { totalCoverage, nextRenewal } = policyTotals(POLICIES);
  return (
    <div className="flex flex-col gap-8">
      <PageIntro title={t("Everything you're covered for")} description={t("Your insurance plans and government schemes in one view. Open any policy to see benefits, exclusions and waiting periods.")} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiShield} value={POLICIES.length} label={t("Active policies")} note={t("Health, illness and accident")} />
        <StatCard icon={FiAward} value={inr(totalCoverage)} label={t("Total cover")} note={t("Across all policies")} />
        <StatCard icon={FiUsers} value={SCHEMES.length} label={t("Government schemes")} note={t("{enrolled} enrolled · {applied} applied", { enrolled: SCHEMES.filter((s) => s.status === "Enrolled").length, applied: SCHEMES.filter((s) => s.status === "Applied").length })} />
        <StatCard icon={FiCalendar} value={nextRenewal ? t("{n} days", { n: daysUntil(nextRenewal.validTill) }) : "—"} label={t("Next renewal")} note={nextRenewal?.name ?? t("No policy yet")} />
      </div>

      <section>
        <SectionHeading title={t("Insurance policies")} description={t("Tap a card to see full benefits")} />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {POLICIES.map((p) => <PolicyTile key={p.id} policy={p} t={t} />)}
        </div>
        {POLICIES.length === 0 && <Surface><p className="px-5 py-6 text-sm text-slate-500">{t("No insurance policies are linked to your account yet. Your insurer adds them when your cover starts.")}</p></Surface>}
      </section>

      <section>
        <SectionHeading title={t("Government schemes")} description={t("Public healthcare benefits linked to your account")} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SCHEMES.map((s) => (
            <Surface key={s.name} className="flex items-start gap-4 p-5">
              <IconBadge icon={FiAward} />
              <div className="flex-1"><h3 className="font-semibold text-slate-900">{s.name}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{t(s.detail)}</p></div>
              <Pill tone={s.status === "Enrolled" ? "green" : "sky"}>{t(s.status)}</Pill>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}

function PolicyTile({ policy: p, t }: { policy: Policy; t: T }) {
  const days = daysUntil(p.validTill);
  return (
    <Link href={`/patient/policies/${p.id}`} className="group">
      <Surface className="h-full overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* Card face */}
        <div className={"relative overflow-hidden bg-care-800 p-6 text-white"}>
          <div className="relative flex items-start justify-between">
            <div><p className="text-xs font-semibold text-white/70">{p.provider} · {t(p.kind)}</p><h3 className="mt-1 text-xl font-semibold tracking-tight">{p.name}</h3></div>
          </div>
          <p className="relative mt-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">{t("Sum insured")}</p>
          <p className="relative text-2xl font-semibold tracking-tight">{inr(p.coverage)}</p>
          <p className="relative mt-4 font-mono text-sm tracking-wider text-white/80">{p.number}</p>
        </div>
        {/* Details */}
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <Pill tone={policyTone(p)}>{t(p.status)}</Pill>
            <span className="text-xs font-medium text-slate-400">{t("Valid till {date}", { date: formatDate(p.validTill) })}</span>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-500">{t("Cover remaining")}</span><span className="font-semibold text-slate-900">{inr(p.coverage - p.used)}</span></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500"><FiUsers className="text-slate-400" />{t(p.members.length === 1 ? "{n} member · renews in {days} days" : "{n} members · renews in {days} days", { n: p.members.length, days })}</span>
            <FiArrowRight className="text-care-600 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Surface>
    </Link>
  );
}
