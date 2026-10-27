"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { buttonClass, Eyebrow, Surface } from "@/components/portal/ui";

export default function MemberLookup({ ids, title, location }: { ids: string[]; title: string; location: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const id = value.trim().toUpperCase();
    if (!ids.includes(id)) { setError("No patient found with this Member ID."); return; }
    router.push(`/hospital/patients/${id.toLowerCase()}`);
  };
  return (
    <Surface className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Eyebrow>Hospital workspace</Eyebrow>
        <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><FiMapPin className="text-slate-400" />{location}</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="w-full lg:max-w-md">
        <label htmlFor="member-id" className="text-sm font-semibold text-slate-700">Open a patient record</label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="member-id" value={value} onChange={(e) => { setValue(e.target.value); setError(""); }} placeholder="Member ID, e.g. IC-2208" autoComplete="off" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3 text-sm uppercase text-ink outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-care-400 focus:bg-white focus:ring-4 focus:ring-care-100" />
          </div>
          <button type="submit" className={buttonClass("primary")}>Open</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      </form>
    </Surface>
  );
}
