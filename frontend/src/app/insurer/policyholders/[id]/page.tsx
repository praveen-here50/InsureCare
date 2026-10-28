import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiMapPin, FiPhone } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import { Avatar } from "../../../hospital/ui";
import { inr } from "../../../hospital/data";
import { isOpen } from "../../data";
import { getInsurerData } from "../../server";
import { ClaimsStatic } from "../../ui";


export default async function PolicyholderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { claimViews, claimsOf, getHolder, getHospital } = await getInsurerData();
  const h = getHolder(id);
  if (!h) notFound();
  const claims = claimsOf(h.memberId);
  const hospital = h.admission ? getHospital(h.admission.hospitalId) : undefined;
  const used = h.policy.coverage - h.policy.balance;
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/insurer/policyholders" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"><FiArrowLeft />Policyholders</Link>
      <Card className="overflow-hidden"><div className="flex flex-col gap-4 bg-white p-5 sm:flex-row sm:items-center sm:p-7">
        <Avatar name={h.name} className="size-16 bg-white text-lg shadow-sm" />
        <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-brand-950">{h.name}</h1>{h.admission && <Badge tone="blue">Admitted</Badge>}{claims.some(isOpen) && <Badge tone="blue">Open claim</Badge>}</div>
          <p className="mt-1 text-sm text-slate-600">{h.memberId} · {h.age} yrs · {h.gender}</p><p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><FiPhone className="size-3.5" />{h.phone}</p></div>
      </div></Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal><Card className="p-5 sm:p-6"><h2 className="font-semibold text-slate-900">Current hospital stay</h2>
            {h.admission && hospital ? (
              <div className="mt-4"><Link href={`/insurer/hospitals/${hospital.id}`} className="group inline-flex items-center gap-2 text-lg font-semibold text-brand-800"><FiMapPin />{hospital.name}<FiArrowRight className="transition group-hover:translate-x-1" /></Link>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Ward", h.admission.ward], ["Bed", h.admission.bed], ["Doctor", h.admission.doctor], ["Since", h.admission.since]].map(([k, v]) => <div key={k} className="rounded-xl bg-brand-50 px-3 py-2.5"><dt className="text-[11px] font-medium text-slate-400">{k}</dt><dd className="text-sm font-semibold text-slate-900">{v}</dd></div>)}</dl>
                <p className="mt-4 text-sm text-slate-600"><span className="font-medium text-slate-900">Diagnosis:</span> {h.admission.diagnosis}</p></div>
            ) : <p className="mt-3 text-sm text-slate-500">Not currently admitted at any network hospital.</p>}
          </Card></Reveal>
          <Reveal><Card className="overflow-hidden"><h2 className="p-5 pb-3 font-semibold text-slate-900 sm:px-6">Claims ({claims.length})</h2>
            {claims.length ? <ClaimsStatic claims={claimViews(claims)} /> : <p className="p-6 text-sm text-slate-500">No claims yet.</p>}</Card></Reveal>
        </div>
        <div className="flex flex-col gap-6">
          <Reveal><Card className="p-5"><h2 className="font-semibold text-slate-900">Policy</h2>
            <p className="mt-3 text-sm font-medium text-slate-900">{h.policy.name}</p><p className="text-xs text-slate-500">{h.policy.number}</p>
            <div className="mt-4 flex items-baseline justify-between"><span className="text-xl font-bold text-brand-900">{inr(h.policy.balance)}</span><span className="text-xs text-slate-400">of {inr(h.policy.coverage)} remaining</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full origin-left animate-grow rounded-full bg-gradient-to-r from-brand-500 to-brand-700" style={{ width: `${(h.policy.balance / h.policy.coverage) * 100}%` }} /></div>
            <div className="mt-4 flex flex-wrap gap-2"><Badge tone="blue">Active</Badge><Badge>Valid till {h.policy.validTill}</Badge>{used > 0 && <Badge tone="blue">{inr(used)} used</Badge>}</div>
            <p className="mt-3 text-xs text-slate-500">Started {h.policy.startedOn} · {h.policy.waitingMonths}-month waiting period</p></Card></Reveal>
          <Reveal><Card className="p-5"><h2 className="font-semibold text-slate-900">Declared conditions</h2>
            <div className="mt-3 flex flex-wrap gap-2">{h.declared.length ? h.declared.map((d) => <Badge key={d} tone="blue">{d}</Badge>) : <span className="text-sm text-slate-500">None declared</span>}</div>
            <p className="mt-3 text-xs text-slate-400">Insurers see only information shared for claims. Full medical history stays with the hospital.</p></Card></Reveal>
        </div>
      </div>
    </div>
  );
}
