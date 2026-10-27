import { FiCheckCircle, FiClock, FiLayers, FiUser } from "react-icons/fi";
import { PageIntro, Pill, StatCard, Surface } from "@/components/portal/ui";
import { cn } from "@/lib/cn";
import { getHospitalDesk, wardAvailable } from "../data";
import { BED_DOT, BED_LABEL, wardTone } from "../ui";
import BedGrid from "./BedGrid";

export default async function BedsPage() {
  const { WARDS } = await getHospitalDesk();
  const total = WARDS.reduce((n, w) => n + w.total, 0);
  const free = WARDS.reduce((n, w) => n + wardAvailable(w), 0);
  const occupied = WARDS.reduce((n, w) => n + w.occupied, 0);
  const reserved = WARDS.reduce((n, w) => n + w.reserved, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageIntro
        eyebrow="Beds"
        title="Bed availability"
        description="Live view of every ward. Free beds are shown in green. Click a bed to change its status."
        actions={
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
            {(["available", "reserved", "occupied"] as const).map((k) => <span key={k} className="flex items-center gap-2"><span className={cn("size-3 rounded", BED_DOT[k])} />{BED_LABEL[k]}</span>)}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiLayers} value={total} label="Total beds" note={`${WARDS.length} wards`} />
        <StatCard icon={FiCheckCircle} value={free} label="Free now" note="Ready for admission" />
        <StatCard icon={FiUser} value={occupied} label="Occupied" note={`${Math.round((occupied / total) * 100)}% occupancy`} />
        <StatCard icon={FiClock} value={reserved} label="Reserved" note="Planned admissions" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {WARDS.map((w) => (
          <Surface key={w.id} className="p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">{w.name}</h2>
                <p className="mt-0.5 text-xs text-slate-400">{w.note}</p>
              </div>
              <Pill tone={wardTone(w)}>{wardAvailable(w)} free of {w.total}</Pill>
            </div>
            <BedGrid beds={w.beds} />
            <p className="mt-4 text-xs text-slate-500">{w.occupied} occupied · {w.reserved} reserved</p>
          </Surface>
        ))}
      </div>
    </div>
  );
}
