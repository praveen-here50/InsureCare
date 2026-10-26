import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { WARDS, bedsFor, wardAvailable } from "../data";

const TILE = {
  available: "border-2 border-emerald-300 bg-emerald-50 text-emerald-700",
  occupied: "border-2 border-brand-700 bg-brand-700 text-white",
  reserved: "border-2 border-amber-300 bg-amber-100 text-amber-800",
} as const;

export default function BedsPage() {
  const total = WARDS.reduce((n, w) => n + w.total, 0);
  const free = WARDS.reduce((n, w) => n + wardAvailable(w), 0);
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Bed availability</h1></div>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          {(["available", "occupied", "reserved"] as const).map((k) => <span key={k} className="flex items-center gap-2"><span className={cn("size-4 rounded-md", TILE[k])} />{k[0]!.toUpperCase() + k.slice(1)}</span>)}
        </div>
      </div>
      {WARDS.map((w) => {
        const left = wardAvailable(w);
        return (
          <Reveal key={w.id}>
            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold text-slate-900">{w.name}</h2><p className="text-xs text-slate-500">{w.note}</p></div><Badge tone={left === 0 ? "red" : left <= 2 ? "yellow" : "green"}>{left} available · {w.occupied} occupied · {w.reserved} reserved</Badge></div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
                {bedsFor(w).map((b, i) => <span key={b.label} title={`${b.label} · ${b.status}`} style={{ animationDelay: `${i * 18}ms` }} className={cn("flex h-11 animate-fade-in items-center justify-center rounded-xl text-[11px] font-semibold transition hover:scale-105", TILE[b.status])}>{b.label.split("-")[1]}</span>)}
              </div>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
