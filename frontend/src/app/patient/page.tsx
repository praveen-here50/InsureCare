import Link from "next/link";
import { FiActivity, FiAlertCircle, FiArrowRight, FiCalendar, FiChevronRight, FiFileText, FiMapPin, FiPieChart, FiShield } from "react-icons/fi";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";
import { buttonClass, IconBadge, inr, inrShort, Pill, SectionHeading, StageTracker, StatCard, Surface } from "@/components/portal/ui";
import { claimStages, isOpenClaim, needsAction, statusLabel, statusTone } from "./claims/data";
import { formatDocDate } from "./documents/data";
import { getPortal } from "./portal";
import { daysUntil, formatDate, policyTone, policyTotals } from "./policies/data";

export default async function PatientDashboard() {
  const { member, claims, policies: POLICIES, hospitals, documents } = await getPortal();
  const { totalCoverage, totalUsed, nextRenewal } = policyTotals(POLICIES);
  const openClaims = claims.filter(isOpenClaim);
  const actionNeeded = claims.find(needsAction);
  const nearby = hospitals.filter((h) => h.network === "Network").slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-care-800 text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[40%] md:block">
          <Photo src={IMG.family} alt="" position="center 30%" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-care-800 via-care-800/30 to-transparent" />
        </div>
        <div className="relative max-w-2xl px-6 py-8 sm:px-9 sm:py-10">
          <p className="text-xs font-semibold text-care-200">Member ID {member.memberId}</p>
          <h1 className="mt-2 text-[1.75rem] font-extrabold tracking-[-0.03em] sm:text-4xl">Welcome back, {member.firstName}</h1>
          <p className="mt-2 max-w-lg text-[15px] leading-7 text-white/80">
            Your family is covered up to <span className="font-semibold text-white">{inr(totalCoverage)}</span> across {POLICIES.length} policies.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/patient/claims" className={buttonClass("white")}>Track my claims <FiArrowRight /></Link>
            <Link href="/patient/hospitals" className={buttonClass("secondary", "border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20")}><FiMapPin />Find a hospital</Link>
          </div>
        </div>
      </section>

      {/* Action needed */}
      {actionNeeded && (
        <Link href={`/patient/claims/${actionNeeded.id}`} className="group flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 transition hover:border-amber-300">
          <FiAlertCircle className="size-5 shrink-0 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">{actionNeeded.id} needs one more document</p>
            <p className="mt-0.5 text-sm text-slate-600">Upload your {actionNeeded.documents.find((d) => d.status === "Required")?.name.toLowerCase()} so the review can continue.</p>
          </div>
          <span className="hidden items-center gap-1.5 text-sm font-semibold text-amber-800 sm:inline-flex">Resolve <FiArrowRight className="transition group-hover:translate-x-1" /></span>
          <FiChevronRight className="shrink-0 text-amber-700 sm:hidden" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiShield} value={inr(totalCoverage)} label="Total cover" note={`Across ${POLICIES.length} policies`} />
        <StatCard icon={FiPieChart} value={`${Math.round((1 - totalUsed / totalCoverage) * 1000) / 10}%`} label="Cover remaining" note={`${inr(totalUsed)} used this year`} />
        <StatCard icon={FiActivity} value={openClaims.length} label="Open claims" note={actionNeeded ? "1 needs your action" : "All on track"} />
        <StatCard icon={FiCalendar} value={`${daysUntil(nextRenewal.validTill)} days`} label="Next renewal" note={nextRenewal.name} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.15fr]">
        {/* Claims */}
        <section>
          <SectionHeading title="Claims" href="/patient/claims" />
          <Surface className="divide-y divide-slate-100">
            {claims.map((c) => (
              <Link key={c.id} href={`/patient/claims/${c.id}`} className="block px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{c.type}</p>
                    <p className="truncate text-xs text-slate-400">{c.id} · {c.amountClaimed}</p>
                  </div>
                  <Pill tone={statusTone[c.status]}>{statusLabel[c.status]}</Pill>
                </div>
                <StageTracker stages={claimStages(c)} attention={needsAction(c)} className="mt-4 max-w-md" />
              </Link>
            ))}
          </Surface>
        </section>

        <div className="flex flex-col gap-6">
          {/* Policies */}
          <section>
            <SectionHeading title="Policies" href="/patient/policies" />
            <Surface className="divide-y divide-slate-100">
              {POLICIES.map((p) => (
                <Link key={p.id} href={`/patient/policies/${p.id}`} className="flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                  <IconBadge icon={FiShield} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="truncate text-sm font-bold text-ink">{p.name}</p>{p.status !== "Active" && <Pill tone={policyTone(p)}>{p.status}</Pill>}</div>
                    <p className="mt-0.5 truncate text-xs text-slate-400">{p.provider} · Renews {formatDate(p.validTill)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">{inrShort(p.coverage - p.used)}</p>
                    <p className="text-xs text-slate-400">left of {inrShort(p.coverage)}</p>
                  </div>
                </Link>
              ))}
            </Surface>
          </section>

          {/* Hospitals */}
          <section>
            <SectionHeading title="Cashless hospitals nearby" href="/patient/hospitals" />
            <Surface className="divide-y divide-slate-100">
              {nearby.map((h) => (
                <Link key={h.id} href={`/patient/hospitals/${h.id}`} className="flex items-center gap-4 px-5 py-3.5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                  <Photo src={h.image} alt="" className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{h.name}</p>
                    <p className="truncate text-xs text-slate-400">{h.distance} · {h.specialties.slice(0, 2).join(", ")}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">★ {h.rating.split(" ")[0]}</span>
                </Link>
              ))}
            </Surface>
          </section>
        </div>
      </div>

      {/* Documents */}
      <section>
        <SectionHeading title="Recent documents" href="/patient/documents" />
        <Surface className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
          {documents.slice(0, 4).map((d, i) => (
            <Link key={d.id} href="/patient/documents" className={`flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70 ${i >= 2 ? "md:border-t md:border-slate-100" : ""} ${i % 2 === 1 ? "md:border-l md:border-slate-100" : ""}`}>
              <IconBadge icon={FiFileText} className="size-9" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{d.name}</p><p className="text-xs text-slate-400">{d.category} · {formatDocDate(d.dateAdded)}</p></div>
            </Link>
          ))}
        </Surface>
      </section>
    </div>
  );
}
