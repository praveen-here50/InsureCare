import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertTriangle, FiArrowLeft, FiArrowRight, FiCornerUpRight, FiLock, FiPaperclip, FiPhone, FiUserCheck } from "react-icons/fi";
import { Field, Pill, Surface } from "@/components/portal/ui";
import { apiUrl } from "@/lib/api";
import { claimState, getHospitalDesk, inr, verifiedCount } from "../../data";
import { Avatar, DocIcon, docTone, statusTone } from "../../ui";


const coverageTone = { Covered: "green", "Partially covered": "amber", "Not covered": "rose" } as const;

export default async function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { getPatient, serviceByName } = await getHospitalDesk();
  const p = getPatient(id);
  if (!p) notFound();
  const used = p.policy.coverage - p.policy.balance;
  const providable = p.treatments.filter((t) => serviceByName(t.service)?.available).length;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/hospital/patients" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-care-700"><FiArrowLeft />Patients</Link>

      <Surface className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
          <Avatar name={p.name} className="size-16 rounded-2xl text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink">{p.name}</h1><Pill tone={statusTone[p.status]}>{p.status}</Pill></div>
            <p className="mt-1 text-sm text-slate-500">{p.memberId} · {p.age} yrs · {p.gender} · Blood group {p.bloodGroup}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><FiPhone className="size-3.5 text-slate-400" />{p.phone}</p>
          </div>
          {p.bed && (
            <div className="grid grid-cols-3 gap-2 sm:w-80">
              {[["Ward", p.ward], ["Bed", p.bed], ["Since", p.admittedOn?.replace(" 2026", "")]].map(([k, v]) => <div key={k} className="rounded-xl bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-400">{k}</p><p className="text-sm font-bold text-ink">{v}</p></div>)}
            </div>
          )}
        </div>
        <p className="flex items-center gap-2 border-t border-slate-100 px-6 py-3 text-xs text-slate-500 sm:px-8"><FiLock className="shrink-0 text-care-600" />Opened with patient consent (OTP verified). This view is recorded in the audit log.</p>
      </Surface>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Current condition</h2>
            <p className="mt-1 text-sm text-slate-600">{p.diagnosis}{p.doctor && <span className="text-slate-400"> · {p.doctor}</span>}</p>
            {p.treatments.length > 0 && <>
              <p className="mt-5 text-xs font-semibold text-slate-400">Treatments needed · {providable} of {p.treatments.length} can be provided here</p>
              <ul className="mt-2 divide-y divide-slate-100">{p.treatments.map((t) => {
                const s = serviceByName(t.service);
                return (
                  <li key={t.service} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{t.service}</span>
                      {s && !s.available && <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><FiCornerUpRight />Refer to {s.referTo}</span>}
                    </span>
                    <Pill tone={s?.available ? "green" : "rose"}>{s?.available ? "Available here" : "Refer out"}</Pill>
                    <Pill tone={coverageTone[t.coverage]}>{t.coverage}</Pill>
                  </li>
                );
              })}</ul>
            </>}
          </Surface>

          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Medical history</h2>
            <ol className="mt-4 flex flex-col">
              {p.history.map((h, i) => (
                <li key={h.year + h.event} className="relative flex gap-4 pb-5 last:pb-0">
                  <div className="flex flex-col items-center"><span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-care-500" />{i < p.history.length - 1 && <span className="mt-1 w-0.5 flex-1 rounded-full bg-slate-200" />}</div>
                  <div><p className="text-xs font-bold text-slate-400">{h.year}</p><p className="text-sm text-slate-700">{h.event}</p></div>
                </li>
              ))}
            </ol>
          </Surface>
        </div>

        <div className="flex flex-col gap-6">
          <Surface className="p-5">
            <h2 className="text-lg font-bold text-ink">Insurance</h2>
            <p className="mt-3 text-sm font-semibold text-ink">{p.policy.name}</p>
            <p className="text-xs text-slate-400">{p.policy.provider} · {p.policy.number}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <Field label="Remaining">{inr(p.policy.balance)}</Field>
              <Field label="Sum insured">{inr(p.policy.coverage)}</Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Pill tone={p.policy.cashless ? "green" : "amber"}>{p.policy.cashless ? "Cashless eligible" : "Reimbursement only"}</Pill><Pill>Valid till {p.policy.validTill}</Pill>{used > 0 && <Pill>{inr(used)} used</Pill>}</div>
          </Surface>

          <Surface className="p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink"><FiAlertTriangle className="text-amber-500" />Allergies &amp; medication</h2>
            <div className="mt-3 flex flex-wrap gap-2">{p.allergies.length ? p.allergies.map((a) => <Pill key={a} tone="rose">{a}</Pill>) : <span className="text-sm text-slate-500">No known allergies</span>}</div>
            <p className="mt-4 text-xs font-semibold text-slate-400">Current medication</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">{p.medications.length ? p.medications.map((m) => <li key={m}>{m}</li>) : <li className="text-slate-500">None</li>}</ul>
          </Surface>

          {p.documents.length > 0 && (
            <Surface className="p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink"><FiUserCheck className="text-slate-400" />Insurer documents</h2>
              <p className="mt-1 text-xs text-slate-400">{verifiedCount(p)} of {p.documents.length} verified · {claimState(p)}</p>
              <ul className="mt-3 space-y-2.5">{p.documents.map((d) => (
                <li key={d.name} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <DocIcon status={d.status} />
                  <span className="min-w-0 flex-1">{d.name}{d.fileUrl && <a href={apiUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${d.fileName}`} className="ml-1.5 inline-flex align-[-2px] text-care-700 hover:text-care-800"><FiPaperclip className="size-3.5" /></a>}</span>
                  <Pill tone={docTone[d.status]}>{d.status}</Pill>
                </li>
              ))}</ul>
              <Link href="/hospital/claims" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-care-700 hover:text-care-800">Go to insurer claims <FiArrowRight /></Link>
            </Surface>
          )}
        </div>
      </div>
    </div>
  );
}
