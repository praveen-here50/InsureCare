import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiClock, FiPhone } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import { Avatar } from "../../../hospital/ui";
import { inr } from "../../../hospital/data";
import { getInsurerData, isOpen } from "../../data";
import { ClaimsStatic } from "../../ui";


export default async function HospitalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { HOLDERS, claimViews, claimsAt, getHospital } = await getInsurerData();
  const h = getHospital(id);
  if (!h) notFound();
  const claims = claimsAt(h.id);
  const patients = HOLDERS.filter((x) => x.admission?.hospitalId === h.id);
  const stats = [[patients.length, "Policyholders admitted"], [claims.filter(isOpen).length, "Open claims"], [inr(claims.reduce((n, c) => n + c.claimed, 0)), "Total claimed"], [`${h.avgTat} days`, "Avg. turnaround"]];
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Link href="/insurer/hospitals" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"><FiArrowLeft />Network hospitals</Link>
      <Card className="bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-brand-950">{h.name}</h1><Badge tone="blue">Cashless network</Badge></div>
        <p className="mt-1 text-slate-600">{h.speciality} · {h.city}</p><p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500"><FiPhone className="size-3.5" />{h.phone}<FiClock className="ml-3 size-3.5" />{h.avgTat}-day average turnaround</p></Card>
      <Reveal><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(([v, k]) => <div key={k} className="rounded-2xl border border-brand-200/70 bg-brand-50 p-4"><p className="text-2xl font-bold text-brand-900">{v}</p><p className="mt-1 text-xs font-medium text-slate-600">{k}</p></div>)}</div></Reveal>
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2"><Card className="overflow-hidden"><h2 className="p-5 pb-3 font-semibold text-slate-900 sm:px-6">Claims from this hospital ({claims.length})</h2><ClaimsStatic claims={claimViews(claims)} /></Card></Reveal>
        <Reveal delay={100}><Card className="p-5"><h2 className="font-semibold text-slate-900">Our policyholders here</h2>
          <div className="mt-3 flex flex-col gap-1">{patients.length === 0 && <p className="text-sm text-slate-500">None right now.</p>}{patients.map((p) => <Link key={p.id} href={`/insurer/policyholders/${p.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-50/60"><Avatar name={p.name} className="size-10 text-xs" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900">{p.name}</span><span className="block truncate text-xs text-slate-500">{p.admission?.ward} · {p.admission?.diagnosis}</span></span><FiArrowRight className="text-slate-300 transition group-hover:translate-x-1" /></Link>)}</div></Card></Reveal>
      </div>
    </div>
  );
}
