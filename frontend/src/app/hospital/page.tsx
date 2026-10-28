import Link from "next/link";
import { FiChevronRight, FiLayers, FiSend, FiShare2, FiUsers } from "react-icons/fi";
import { SectionHeading, StatCard, Surface } from "@/components/portal/ui";
import MemberLookup from "./MemberLookup";
import { type Bed, claimState, verifiedCount, wardAvailable } from "./data";
import { getHospitalDesk } from "./server";
import { Avatar, Status } from "./ui";

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
          <SectionHeading title="Bed occupancy" href="/hospital/beds" linkLabel="View full bed map" />
          <Surface className="divide-y divide-slate-100">
            {WARDS.map((w) => (
              <Link key={w.id} href="/hospital/beds" className="block px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{w.name}</p>
                  <Status>{wardAvailable(w)} free of {w.total}</Status>
                </div>
                <FreeBeds beds={w.beds} />
              </Link>
            ))}
          </Surface>
        </section>

        {/* Claims queue */}
        <section>
          <SectionHeading title="Insurer claims" href="/hospital/claims" linkLabel="View all claims" />
          <Surface className="divide-y divide-slate-100">
            {queue.map((p) => (
              <Link key={p.id} href={`/hospital/claims/${p.id}`} className="flex items-center gap-4 px-5 py-4 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="truncate text-xs text-slate-400">{p.policy.provider} · {verifiedCount(p)} of {p.documents.length} documents verified</p>
                </div>
                <Status>{claimState(p)}</Status>
                <FiChevronRight className="hidden shrink-0 text-slate-300 sm:block" />
              </Link>
            ))}
          </Surface>

          <div className="mt-6">
            <SectionHeading title="Recent admissions" href="/hospital/patients" linkLabel="View all patients" />
            <Surface className="divide-y divide-slate-100">
              {inHouse.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/hospital/patients/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50/70">
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="truncate text-xs text-slate-400">{p.ward} · {p.bed} · {p.diagnosis}</p>
                  </div>
                  <Status>{p.status}</Status>
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

/** The free beds in a ward by number; the bed map has the full picture. */
function FreeBeds({ beds }: { beds: Bed[] }) {
  const free = beds.filter((b) => b.status === "available").map((b) => b.label);
  const shown = free.slice(0, 8);
  if (free.length === 0) return <p className="mt-2.5 text-xs text-slate-400">No free beds</p>;
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      {shown.map((label) => <span key={label} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700">{label}</span>)}
      {free.length > shown.length && <span className="px-1 text-[11px] font-medium text-slate-500">+{free.length - shown.length} more</span>}
    </div>
  );
}
