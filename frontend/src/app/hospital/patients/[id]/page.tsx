import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCornerUpRight, FiLock, FiPhone, FiUserCheck } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import { PATIENTS, claimState, getPatient, inr, serviceByName, verifiedCount } from "../../data";
import { Avatar, DocIcon, docTone, statusTone } from "../../ui";

export function generateStaticParams() { return PATIENTS.map((p) => ({ id: p.id })); }

const coverageTone = { Covered: "green", "Partially covered": "yellow", "Not covered": "red" } as const;

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPatient(id);
  if (!p) notFound();
  const used = p.policy.coverage - p.policy.balance;
  const providable = p.treatments.filter((t) => serviceByName(t.service)?.available).length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/hospital/patients" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"><FiArrowLeft />Patients</Link>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:p-7">
          <Avatar name={p.name} className="size-16 bg-white text-lg shadow-sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-brand-950">{p.name}</h1><Badge tone={statusTone[p.status]}>{p.status}</Badge></div>
            <p className="mt-1 text-sm text-slate-600">{p.memberId} · {p.age} yrs · {p.gender} · Blood group {p.bloodGroup}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><FiPhone className="size-3.5" />{p.phone}</p>
          </div>
          {p.bed && <div className="grid grid-cols-3 gap-2 text-center sm:w-80">{[["Ward", p.ward], ["Bed", p.bed], ["Since", p.admittedOn?.replace(" 2026", "")]].map(([k, v]) => <div key={k} className="rounded-xl bg-white/80 px-2 py-2.5"><p className="text-[11px] font-medium text-slate-400">{k}</p><p className="text-sm font-semibold text-slate-900">{v}</p></div>)}</div>}
        </div>
        <p className="flex items-center gap-2 border-t border-slate-100 bg-white px-5 py-3 text-xs text-slate-500 sm:px-7"><FiLock className="shrink-0 text-emerald-600" />Opened with patient consent (OTP verified). This view is recorded in the audit log.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal><Card className="p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900">Current condition</h2>
            <p className="mt-1 text-sm text-slate-600">{p.diagnosis}{p.doctor && <span className="text-slate-400"> · {p.doctor}</span>}</p>
            {p.treatments.length > 0 && <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Treatments needed — {providable} of {p.treatments.length} can be provided here</p>
              <ul className="mt-3 divide-y divide-slate-100">{p.treatments.map((t) => {
                const s = serviceByName(t.service);
                return <li key={t.service} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-900">{t.service}</span>
                    {s && !s.available && <span className="mt-0.5 flex items-center gap-1.5 text-xs text-rose-600"><FiCornerUpRight />Not available here. Refer to {s.referTo}</span>}</span>
                  <Badge tone={s?.available ? "green" : "red"}>{s?.available ? "Available here" : "Cannot provide"}</Badge>
                  <Badge tone={coverageTone[t.coverage]}>{t.coverage}</Badge>
                </li>;
              })}</ul></>}
          </Card></Reveal>

          <Reveal><Card className="p-5 sm:p-6">
            <h2 className="font-semibold text-slate-900">Medical history</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-brand-100 pl-5">{p.history.map((h) => <li key={h.year + h.event} className="relative"><span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" /><p className="text-xs font-semibold text-brand-700">{h.year}</p><p className="text-sm text-slate-700">{h.event}</p></li>)}</ol>
          </Card></Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal><Card className="p-5">
            <h2 className="font-semibold text-slate-900">Insurance</h2>
            <p className="mt-3 text-sm font-medium text-slate-900">{p.policy.name}</p>
            <p className="text-xs text-slate-500">{p.policy.provider} · {p.policy.number}</p>
            <div className="mt-4 flex items-baseline justify-between"><span className="text-xl font-bold text-brand-900">{inr(p.policy.balance)}</span><span className="text-xs text-slate-400">of {inr(p.policy.coverage)} remaining</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full origin-left animate-grow rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${(p.policy.balance / p.policy.coverage) * 100}%` }} /></div>
            <div className="mt-4 flex flex-wrap gap-2"><Badge tone={p.policy.cashless ? "green" : "yellow"}>{p.policy.cashless ? "Cashless eligible" : "Reimbursement only"}</Badge><Badge>Valid till {p.policy.validTill}</Badge>{used > 0 && <Badge tone="blue">{inr(used)} used</Badge>}</div>
          </Card></Reveal>

          <Reveal><Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><FiAlertTriangle className="text-amber-500" />Allergies &amp; medication</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.allergies.length ? p.allergies.map((a) => <Badge key={a} tone="red">{a}</Badge>) : <span className="text-sm text-slate-500">No known allergies</span>}</div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Current medication</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">{p.medications.length ? p.medications.map((m) => <li key={m}>{m}</li>) : <li className="text-slate-500">None</li>}</ul>
          </Card></Reveal>

          {p.documents.length > 0 && <Reveal><Card className="p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><FiUserCheck className="text-brand-600" />Insurer documents</h2>
            <p className="mt-1 text-xs text-slate-500">{verifiedCount(p)} of {p.documents.length} verified · {claimState(p)}</p>
            <ul className="mt-3 space-y-2">{p.documents.map((d) => <li key={d.name} className="flex items-center gap-2.5 text-sm text-slate-700"><DocIcon status={d.status} className="size-4" /><span className="flex-1">{d.name}</span><Badge tone={docTone[d.status]}>{d.status}</Badge></li>)}</ul>
            <Link href="/hospital/claims" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950">Go to insurer claims <FiArrowRight /></Link>
          </Card></Reveal>}
        </div>
      </div>
    </div>
  );
}
