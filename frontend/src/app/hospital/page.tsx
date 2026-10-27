import Link from "next/link";
import { FiChevronRight, FiLayers, FiSend, FiShare2, FiUsers } from "react-icons/fi";
import { Pill, SectionHeading, StatCard, Surface } from "@/components/portal/ui";
import { cn } from "@/lib/cn";
import MemberLookup from "./MemberLookup";
import { bedsFor, claimState, getHospitalDesk, verifiedCount, wardAvailable } from "./data";
import { Avatar, BED_DOT, BED_LABEL, statusTone, wardTone } from "./ui";

export default async function HospitalDashboard() {
  const { HOSPITAL, PATIENTS, WARDS, admitted } = await getHospitalDesk();
  const inHouse = admitted();
  const queue = inHouse.filter((p) => claimState(p) !== "Shared with insurer");
  const freeBeds = WARDS.reduce((n, w) => n + wardAvailable(w), 0);
  const totalBeds = WARDS.reduce((n, w) => n + w.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <MemberLookup ids={PATIENTS.map((p) => p.memberId)} title={HOSPITAL.name} location={HOSPITAL.location} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={FiLayers} value={freeBeds} label="Beds free" note={`of ${totalBeds} across ${WARDS.length} wards`} />
        <StatCard icon={FiUsers} value={inHouse.length} label="Patients in hospital" note="Admitted or under observation" />
        <StatCard icon={FiSend} value={queue.length} label="Claims to action" note="Documents to verify or share" />
        <StatCard icon={FiShare2} value={inHouse.filter((p) => p.sharedAt).length} label="Shared with insurers" note="Today" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.1fr]">
        {/* Bed occupancy */}
        <section>
          <SectionHeading title="Bed occupancy" href="/hospital/beds" linkLabel="Bed map" />
          <Surface className="divide-y divide-slate-100">
            {WARDS.map((w) => (
              <Link key={w.id} href="/hospital/beds" className="block px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink">{w.name}</p>
                  <Pill tone={wardTone(w)}>{wardAvailable(w)} free of {w.total}</Pill>
                </div>
                <div aria-hidden="true" className="mt-3 flex flex-wrap gap-1">
                  {bedsFor(w).map((b) => <span key={b.label} title={`${b.label} · ${BED_LABEL[b.status]}`} className={cn("size-2.5 rounded-[3px]", BED_DOT[b.status])} />)}
                </div>
              </Link>
            ))}
          </Surface>
          <Legend />
        </section>

        {/* Claims queue */}
        <section>
          <SectionHeading title="Insurer claims" href="/hospital/claims" linkLabel="Open" />
          <Surface className="divide-y divide-slate-100">
            {queue.map((p) => (
              <Link key={p.id} href="/hospital/claims" className="flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                  <p className="truncate text-xs text-slate-400">{p.policy.provider} · {verifiedCount(p)} of {p.documents.length} documents verified</p>
                </div>
                <Pill tone={claimState(p) === "Ready to share" ? "green" : "amber"}>{claimState(p)}</Pill>
              </Link>
            ))}
          </Surface>

          <div className="mt-6">
            <SectionHeading title="Recent admissions" href="/hospital/patients" linkLabel="All patients" />
            <Surface className="divide-y divide-slate-100">
              {inHouse.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/hospital/patients/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                    <p className="truncate text-xs text-slate-400">{p.ward} · {p.bed} · {p.diagnosis}</p>
                  </div>
                  <Pill tone={statusTone[p.status]}>{p.status}</Pill>
                  <FiChevronRight className="hidden shrink-0 text-slate-300 sm:block" />
                </Link>
              ))}
            </Surface>
          </div>
        </section>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex gap-5 px-1 text-xs font-medium text-slate-500">
      {(["available", "reserved", "occupied"] as const).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={cn("size-2.5 rounded-[3px]", BED_DOT[k])} />{BED_LABEL[k]}</span>)}
    </div>
  );
}
