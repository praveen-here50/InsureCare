import Link from "next/link";
import { FiAlertCircle, FiCheckCircle, FiChevronRight, FiFileText, FiTrendingUp } from "react-icons/fi";
import { PageIntro, Pill, SectionHeading, StageTracker, StatCard, Surface } from "@/components/portal/ui";
import { inr } from "@/components/portal/ui";
import { getPortal } from "../portal";
import { claimStages, isOpenClaim, needsAction, statusLabel, statusTone } from "./data";

export default async function ClaimsPage() {
  const { claims } = await getPortal();
  const awaitingAction = claims.filter(needsAction).length;
  const approved = claims.filter((c) => ["Approved", "Settled"].includes(c.status)).length;

  return (
    <div className="flex flex-col gap-6">
      <PageIntro eyebrow="Claims" title="Your claims" description="Follow each claim from submission to settlement." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiFileText} value={claims.filter(isOpenClaim).length} label="Open claims" note="Submitted or in review" />
        <StatCard icon={FiAlertCircle} value={awaitingAction} label="Need your action" note="Documents requested" />
        <StatCard icon={FiCheckCircle} value={approved} label="Approved" note="Approved or settled" />
        <StatCard icon={FiTrendingUp} value={inr(claims.reduce((n, c) => n + (c.approved ?? 0), 0))} label="Total approved" note="This policy year" />
      </div>

      <section>
        <SectionHeading title="All claims" description="Most recent first" />
        <Surface className="divide-y divide-slate-100">
          {claims.map((claim) => (
            <Link key={claim.id} href={`/patient/claims/${claim.id}`} className="group grid grid-cols-1 gap-4 px-5 py-5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_170px] lg:items-center lg:gap-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-[15px] font-bold text-ink">{claim.type}</h3><Pill tone={statusTone[claim.status]}>{statusLabel[claim.status]}</Pill></div>
                <p className="mt-1 truncate text-sm text-slate-500">{claim.provider}</p>
                <p className="mt-0.5 text-xs text-slate-400">{claim.id} · Submitted {claim.submittedDate}</p>
              </div>
              <StageTracker stages={claimStages(claim)} attention={needsAction(claim)} />
              <div className="flex items-center justify-between gap-6 lg:justify-end">
                <div className="lg:text-right">
                  <p className="text-[15px] font-bold text-ink">{claim.amountClaimed}</p>
                  <p className="text-xs text-slate-400">{claim.amountApproved ? `${claim.amountApproved} approved` : "Claimed"}</p>
                </div>
                <FiChevronRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </div>
            </Link>
          ))}
        </Surface>
      </section>
    </div>
  );
}
