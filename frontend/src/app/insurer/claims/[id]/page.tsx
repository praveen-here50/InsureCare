import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCheck, FiPhone, FiUserCheck, FiX } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { DocIcon, docTone } from "../../../hospital/ui";
import { inr } from "../../../hospital/data";
import ClaimDecision from "../../ClaimDecision";
import { CLAIMS, getClaim, getHolder, getHospital, isOpen } from "../../data";
import { claimTone } from "../../ui";

export function generateStaticParams() { return CLAIMS.map((c) => ({ id: c.id })); }
const DOC_TONE = { Verified: "Verified", Pending: "Pending review", Missing: "Missing" } as const;

export default async function ClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getClaim(id);
  if (!c) notFound();
  const holder = getHolder(c.memberId.toLowerCase());
  const hospital = getHospital(c.hospitalId);
  const verified = c.docs.filter((d) => d.status === "Verified").length;
  const checks = [
    { ok: true, label: "Policy is active", detail: holder ? `Valid till ${holder.policy.validTill}` : "" },
    { ok: c.waitingOk, label: "Waiting period completed", detail: holder ? `${holder.policy.waitingMonths}-month waiting period · started ${holder.policy.startedOn}` : "" },
    { ok: true, label: "Treated at a network hospital", detail: hospital?.name ?? "" },
    { ok: !!holder && c.claimed <= holder.policy.balance, label: "Amount within remaining cover", detail: holder ? `${inr(holder.policy.balance)} remaining` : "" },
    { ok: verified === c.docs.length, label: "All documents verified by the agent", detail: `${verified} of ${c.docs.length} verified` },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/insurer/claims" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"><FiArrowLeft />Claims</Link>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 bg-white p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-brand-950">{c.id}</h1><Badge tone={claimTone[c.status]}>{c.status}</Badge>{c.preauth && <Badge tone="blue">Pre-authorisation</Badge>}</div>
            <p className="mt-1 text-slate-700">{c.type} · {c.diagnosis}</p><p className="mt-0.5 text-sm text-slate-500">Submitted {c.submittedOn} · Updated {c.updatedOn} · Officer {c.officer}</p></div>
          <div className="grid grid-cols-2 gap-2 text-center sm:w-72">
            <div className="rounded-xl bg-white/80 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-400">Claimed</p><p className="text-lg font-bold text-slate-900">{inr(c.claimed)}</p></div>
            <div className="rounded-xl bg-white/80 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-400">Approved</p><p className="text-lg font-bold text-slate-900">{c.approved ? inr(c.approved) : "—"}</p></div>
          </div>
        </div>
        {c.note && <p className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600 sm:px-7">{c.note}</p>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal><Card className="p-5 sm:p-6"><h2 className="font-semibold text-slate-900">Eligibility checks</h2>
            <ul className="mt-3 divide-y divide-slate-100">{checks.map((k) => (
              <li key={k.label} className="flex items-center gap-3 py-3"><span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", k.ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>{k.ok ? <FiCheck /> : <FiX />}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{k.label}</span><span className="block text-xs text-slate-500">{k.detail}</span></span></li>
            ))}</ul></Card></Reveal>
          <Reveal><Card className="p-5 sm:p-6"><h2 className="font-semibold text-slate-900">Documents from the hospital</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><FiUserCheck className="text-brand-600" />Checked by the claims verification agent before sharing</p>
            <ul className="mt-3 divide-y divide-slate-100">{c.docs.map((d) => <li key={d.name} className="flex items-center gap-3 py-2.5"><DocIcon status={DOC_TONE[d.status]} /><span className="flex-1 text-sm font-medium text-slate-800">{d.name}</span><Badge tone={docTone[DOC_TONE[d.status]]}>{DOC_TONE[d.status]}</Badge></li>)}</ul></Card></Reveal>
          <Reveal><Card className="p-5 sm:p-6"><h2 className="font-semibold text-slate-900">Claim progress</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-brand-100 pl-5">{c.timeline.map((t) => (
              <li key={t.label} className="relative"><span className={cn("absolute -left-[27px] top-0.5 size-3.5 rounded-full border-2 border-white ring-2", t.done ? "bg-brand-600 ring-brand-100" : t.current ? "bg-white ring-brand-500" : "bg-slate-200 ring-slate-100")} />
                <p className={cn("text-sm font-semibold", t.done || t.current ? "text-slate-900" : "text-slate-400")}>{t.label}</p><p className="text-xs text-slate-500">{t.done ? t.date : t.current ? "In progress" : "Pending"}</p></li>
            ))}</ol></Card></Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <ClaimDecision claimId={c.id} claimed={c.claimed} locked={!isOpen(c)} />
          {c.flags.length > 0 && <Card className="p-5"><h2 className="flex items-center gap-2 font-semibold text-slate-900"><FiAlertTriangle className="text-amber-500" />Flags</h2><ul className="mt-3 space-y-2">{c.flags.map((f) => <li key={f} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{f}</li>)}</ul></Card>}
          {holder && <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Policyholder</p><p className="mt-2 font-semibold text-slate-900">{holder.name}</p><p className="text-sm text-slate-500">{holder.memberId} · {holder.policy.name}</p>
            <Link href={`/insurer/policyholders/${holder.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950">View profile <FiArrowRight /></Link></Card>}
          {hospital && <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hospital</p><p className="mt-2 font-semibold text-slate-900">{hospital.name}</p><p className="flex items-center gap-1.5 text-sm text-slate-500"><FiPhone className="size-3.5" />{hospital.phone}</p>
            <Link href={`/insurer/hospitals/${hospital.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950">View hospital <FiArrowRight /></Link></Card>}
        </div>
      </div>
    </div>
  );
}
