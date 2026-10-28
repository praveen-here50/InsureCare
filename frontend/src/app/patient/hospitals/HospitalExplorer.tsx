"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiMap, FiMapPin, FiNavigation, FiSearch, FiX } from "react-icons/fi";
import Photo from "@/components/Photo";
import { cn } from "@/lib/cn";
import { buttonClass, PageIntro, Pill, Surface } from "@/components/portal/ui";
import { useT } from "@/components/portal/LanguageContext";
import { DEMO_LOCATION, mapsUrl, type Hospital } from "./data";

const SPECIALTIES = ["All specialties", "General medicine", "Cardiology", "Emergency care", "Maternity", "Primary care"];
const DISTANCES = ["Any distance", "Within 5 km", "Within 10 km"];

const selectClass = "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-care-400 focus:ring-4 focus:ring-care-100";

export default function HospitalExplorer({ hospitals }: { hospitals: Hospital[] }) {
  const [query, setQuery] = useState("");
  const [networkOnly, setNetworkOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [schemeOnly, setSchemeOnly] = useState(false);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]!);
  const [distance, setDistance] = useState(DISTANCES[0]!);
  const [coverage, setCoverage] = useState<Hospital | null>(null);
  const t = useT();

  const results = useMemo(() => hospitals.filter((hospital) => {
    const text = `${hospital.name} ${hospital.locality} ${hospital.specialties.join(" ")}`.toLowerCase();
    const matchesQuery = !query || text.includes(query.trim().toLowerCase());
    const matchesSpecialty = specialty === SPECIALTIES[0] || hospital.specialties.includes(specialty);
    const matchesNetwork = !networkOnly || hospital.network === "Network";
    const matchesEmergency = !emergencyOnly || hospital.emergency;
    const matchesScheme = !schemeOnly || hospital.schemes.length > 0;
    const km = Number.parseFloat(hospital.distance);
    const matchesDistance = distance === DISTANCES[0] || (distance === "Within 5 km" ? km <= 5 : km <= 10);
    return matchesQuery && matchesSpecialty && matchesNetwork && matchesEmergency && matchesScheme && matchesDistance;
  }), [hospitals, query, specialty, networkOnly, emergencyOnly, schemeOnly, distance]);

  const activeFilters = [networkOnly, emergencyOnly, schemeOnly, specialty !== SPECIALTIES[0], distance !== DISTANCES[0]].filter(Boolean).length;
  const reset = () => { setQuery(""); setNetworkOnly(false); setEmergencyOnly(false); setSchemeOnly(false); setSpecialty(SPECIALTIES[0]!); setDistance(DISTANCES[0]!); };

  return (
    <div className="flex flex-col gap-8">
      <PageIntro title={t("Find care close to home")} description={t("Search hospitals by speciality and distance. Network hospitals offer cashless treatment, so you pay less at the counter.")} />

      <Surface className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("Search hospital or speciality")}</span>
            <FiSearch aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search hospital, speciality or area")} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:bg-white focus:ring-4 focus:ring-care-100" />
          </label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 lg:min-w-64"><FiNavigation aria-hidden="true" className="text-care-600" /><span className="truncate">{t(DEMO_LOCATION)}</span></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <select aria-label={t("Speciality")} value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectClass}>{SPECIALTIES.map((s) => <option key={s} value={s}>{t(s)}</option>)}</select>
          <select aria-label={t("Distance")} value={distance} onChange={(e) => setDistance(e.target.value)} className={selectClass}>{DISTANCES.map((d) => <option key={d} value={d}>{t(d)}</option>)}</select>
          <Chip label={t("Cashless only")} active={networkOnly} onClick={() => setNetworkOnly(!networkOnly)} />
          <Chip label={t("24/7 emergency")} active={emergencyOnly} onClick={() => setEmergencyOnly(!emergencyOnly)} />
          <Chip label={t("Scheme accepted")} active={schemeOnly} onClick={() => setSchemeOnly(!schemeOnly)} />
          {activeFilters > 0 && <button type="button" onClick={reset} className="ml-auto text-sm font-semibold text-care-600 hover:text-care-800">{t("Clear all")}</button>}
        </div>
      </Surface>

      <section>
          <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{t(results.length === 1 ? "{n} hospital found" : "{n} hospitals found", { n: results.length })}</p><p className="text-xs font-medium text-slate-400">{t("Sorted by distance")}</p></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {results.map((h) => <HospitalCard key={h.id} hospital={h} onCoverage={() => setCoverage(h)} />)}
          </div>
          {results.length === 0 && (
            <Surface className="p-10 text-center">
              <p className="font-semibold text-slate-900">{t("No hospitals match these filters")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("Try clearing a filter or searching for another speciality.")}</p>
              <button type="button" onClick={reset} className={buttonClass("secondary", "mt-5")}>{t("Clear filters")}</button>
            </Surface>
          )}
        </section>

      {coverage && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-lift sm:left-auto sm:right-8 lg:bottom-8">
          <div className="flex items-start gap-3">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", coverage.network === "Network" ? "bg-care-50 text-care-600" : "bg-slate-100 text-slate-500")}>{coverage.network === "Network" ? <FiCheckCircle /> : <FiAlertCircle />}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{coverage.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{coverage.network === "Network" ? t("In your Family Health Shield Plus network. Cashless treatment may be available.") : t("Not in your network. You may be able to claim a reimbursement after treatment.")}</p>
              <p className="mt-2 text-xs text-slate-400">{t("Demo check only. Always confirm with the hospital and your insurer before admission.")}</p>
            </div>
            <button type="button" aria-label={t("Close coverage result")} onClick={() => setCoverage(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><FiX /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn("inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold transition", active ? "border-care-600 bg-care-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900")}>
      {active && <FiCheckCircle className="size-3.5" />}{label}
    </button>
  );
}

function HospitalCard({ hospital: h, onCoverage }: { hospital: Hospital; onCoverage: () => void }) {
  const network = h.network === "Network";
  const t = useT();
  return (
    <Surface className="group flex flex-col overflow-hidden transition hover:shadow-lift">
      <Link href={`/patient/hospitals/${h.id}`} className="relative block h-52 overflow-hidden">
        <Photo src={h.image} alt={h.name} className="absolute inset-0 transition duration-700 group-hover:scale-105" />
        <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm", network ? "bg-white/95 text-care-800" : "bg-white/95 text-slate-600")}>{network ? t("Cashless network") : t("Non-network")}</span>
        <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">★ {h.rating.split(" ")[0]}</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/patient/hospitals/${h.id}`} className="text-base font-semibold text-slate-900 hover:text-care-700">{h.name}</Link>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><FiMapPin aria-hidden="true" className="size-3" />{h.distance} · {h.locality}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {h.emergency && <Pill tone="rose">{t("24/7 emergency")}</Pill>}
          {h.specialties.slice(0, 2).map((s) => <Pill key={s}>{t(s)}</Pill>)}
        </div>
        <div className="mt-auto flex gap-2 pt-5">
          <Link href={`/patient/hospitals/${h.id}`} className={buttonClass("secondary", "h-10 flex-1 px-3")}>{t("Details")} <FiArrowRight /></Link>
          <a href={mapsUrl(h)} target="_blank" rel="noopener noreferrer" aria-label={t("Open {name} in Google Maps", { name: h.name })} title={t("Open in Google Maps")} className={buttonClass("secondary", "h-10 w-10 shrink-0 px-0")}><FiMap /></a>
          <button type="button" onClick={onCoverage} className={buttonClass("primary", "h-10 flex-1 px-3")}>{t("Check coverage")}</button>
        </div>
      </div>
    </Surface>
  );
}
