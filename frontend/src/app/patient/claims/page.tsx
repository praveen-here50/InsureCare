import Link from "next/link";
import { FiAlertCircle, FiCheckCircle, FiChevronRight, FiFileText, FiTrendingUp } from "react-icons/fi";
import { PageIntro, SectionHeading, StageTracker, StatCard, Surface } from "@/components/portal/ui";
import { inr } from "@/components/portal/ui";
import { getT } from "@/lib/i18n-server";
import { getPortal } from "../portal";
import { claimStages, isOpenClaim, needsAction } from "./data";

export default async function ClaimsPage() {
  const { claims } = await getPortal();
  const t = await getT();
  const awaitingAction = claims.filter(needsAction).length;
  const approved = claims.filter((c) => ["Approved", "Settled"].includes(c.status)).length;

  return (
    <div className="flex flex-col gap-6">
      <PageIntro title={t("Your claims")} description={t("Follow each claim from submission to settlement.")} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiFileText} value={claims.filter(isOpenClaim).length} label={t("Open claims")} note={t("Submitted or in review")} />
        <StatCard icon={FiAlertCircle} value={awaitingAction} label={t("Need your action")} note={t("Documents requested")} />
        <StatCard icon={FiCheckCircle} value={approved} label={t("Approved")} note={t("Approved or settled")} />
        <StatCard icon={FiTrendingUp} value={inr(claims.reduce((n, c) => n + (c.approved ?? 0), 0))} label={t("Total approved")} note={t("This policy year")} />
      </div>

      <section>
        <SectionHeading title={t("All claims")} description={t("Most recent first")} />
        <Surface className="divide-y divide-slate-100">
          {claims.map((claim) => (
            <Link key={claim.id} href={`/patient/claims/${claim.id}`} className="group grid grid-cols-1 gap-4 px-5 py-5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_170px] lg:items-center lg:gap-8">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">{t(claim.type)}</h3>
                <p className="mt-1 truncate text-sm text-slate-500">{claim.provider}</p>
                <p className="mt-0.5 text-xs text-slate-400">{claim.id} · {t("Submitted {date}", { date: claim.submittedDate })}</p>
              </div>
              <StageTracker stages={claimStages(claim, t)} attention={needsAction(claim)} t={t} />
              <div className="flex items-center justify-between gap-6 lg:justify-end">
                <div className="lg:text-right">
                  <p className="text-sm font-semibold text-slate-900">{claim.amountClaimed}</p>
                  <p className="text-xs text-slate-400">{claim.amountApproved ? t("{amount} approved", { amount: claim.amountApproved }) : t("Claimed")}</p>
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
