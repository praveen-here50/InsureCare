import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertCircle, FiArrowLeft, FiCheck, FiCheckCircle, FiFileText, FiMessageCircle, FiShield, FiUploadCloud } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { buttonClass, Field, Pill, StageTracker, Surface } from "@/components/portal/ui";
import { getPortal } from "../../portal";
import { claimStages, getClaim, needsAction, statusLabel, statusTone } from "../data";


export default async function ClaimDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { claims } = await getPortal();
  const claim = getClaim(claims, id);
  if (!claim) notFound();
  const tone = statusTone[claim.status];
  const needsDocs = claim.documents.some((d) => d.status === "Required");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/patient/claims" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-care-700"><FiArrowLeft />All claims</Link>

      <Surface className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-semibold text-slate-400">{claim.id}</span><Pill tone={tone}>{statusLabel[claim.status]}</Pill></div>
            <h1 className="mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">{claim.type}</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-500">{claim.explanation}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[360px]">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-medium text-slate-400">Claimed</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{claim.amountClaimed}</p></div>
            <div className={cn("rounded-2xl p-4", claim.amountApproved ? "bg-care-50 text-care-700" : "bg-slate-50 text-slate-500")}><p className="text-xs font-medium opacity-70">Approved</p><p className="mt-1 text-2xl font-extrabold tracking-tight">{claim.amountApproved ?? "Pending"}</p></div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-6 py-6 sm:px-8"><StageTracker stages={claimStages(claim)} attention={needsAction(claim)} showLabels /></div>
      </Surface>

      {needsDocs && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><FiAlertCircle className="size-5" /></span>
          <div className="flex-1"><p className="font-bold text-ink">Your insurer needs a document to continue</p><p className="text-sm text-slate-600">Upload the {claim.documents.filter((d) => d.status === "Required").map((d) => d.name.toLowerCase()).join(", ")} to keep this claim moving.</p></div>
          <Link href="/patient/documents" className={buttonClass("primary")}><FiUploadCloud />Upload now</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <Surface className="p-6 sm:p-7">
            <h2 className="text-lg font-bold text-ink">Claim timeline</h2>
            <ol className="mt-6">
              {claim.timeline.map((item, index) => (
                <li key={item.label} className="relative flex gap-4 pb-7 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className={cn("relative z-10 mt-1 flex size-4 shrink-0 items-center justify-center rounded-full", item.current && !(item.completed && index === claim.timeline.length - 1) ? cn("border-2 bg-white", needsAction(claim) ? "border-amber-500" : "border-care-600") : item.completed ? "bg-care-600 text-white" : "border-2 border-slate-300 bg-white")}>
                      {item.current ? <span className={cn("size-1.5 rounded-full", needsAction(claim) ? "bg-amber-500" : "bg-care-600")} /> : item.completed ? <FiCheck className="size-2.5" strokeWidth={4} /> : null}
                    </span>
                    {index < claim.timeline.length - 1 && <span className={cn("mt-1 w-0.5 flex-1 rounded-full", claim.timeline[index + 1]?.completed || claim.timeline[index + 1]?.current ? "bg-care-600" : "bg-slate-200")} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={cn("text-sm font-bold", item.completed || item.current ? "text-ink" : "text-slate-400")}>{item.label}</h3>
                      {item.current && <span className="text-xs font-medium text-slate-400">· Current</span>}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{item.date}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Surface>

          <Surface className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-7">
            <Field label="Hospital / provider">{claim.provider}</Field>
            <Field label="Policy used">{claim.policy}</Field>
            <Field label="Date of treatment">{claim.treatmentDate}</Field>
            <Field label="Date submitted">{claim.submittedDate}</Field>
            <Field label="Last updated">{claim.updated}</Field>
            <Field label="Claim type">{claim.type}</Field>
          </Surface>
        </div>

        <aside className="flex flex-col gap-6">
          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Documents</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {claim.documents.map((d) => (
                <li key={d.name} className={cn("flex items-center gap-3 rounded-xl p-3", d.status === "Required" ? "bg-amber-50" : "bg-slate-50/80")}>
                  {d.status === "Required" ? <FiAlertCircle className="shrink-0 text-amber-600" /> : <FiCheckCircle className="shrink-0 text-emerald-600" />}
                  <span className="flex-1 truncate text-sm font-semibold text-slate-800">{d.name}</span>
                  <Pill tone={d.status === "Required" ? "amber" : "green"}>{d.status}</Pill>
                </li>
              ))}
            </ul>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Need help?</h2>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/patient/assistant" className={buttonClass("secondary", "justify-start")}><FiMessageCircle className="text-care-600" />Ask about this claim</Link>
              <Link href="/patient/policies" className={buttonClass("secondary", "justify-start")}><FiShield className="text-care-600" />View my policy</Link>
              <Link href="/patient/documents" className={buttonClass("secondary", "justify-start")}><FiFileText className="text-care-600" />My documents</Link>
            </div>
          </Surface>
        </aside>
      </div>
    </div>
  );
}
