"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";

export default function MemberLookup({ ids, title }: { ids: string[]; title: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submit = () => {
    const id = value.trim().toUpperCase();
    if (!ids.includes(id)) { setError("No patient found with this Member ID."); return; }
    router.push(`/hospital/patients/${id.toLowerCase()}`);
  };
  return (
    <section className="relative overflow-hidden rounded-xl">
      <Photo src={IMG.lobby} alt="Hospital reception" className="absolute inset-0" position="center 60%" />
      <span className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/20" />
      <div className="relative px-6 py-10 sm:px-10 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Member ID</span>
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={value} onChange={(e) => { setValue(e.target.value); setError(""); }} placeholder="Patient Member ID" autoComplete="off" className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-3 text-sm uppercase text-slate-900 placeholder:normal-case placeholder:text-slate-400" />
          </label>
          <button type="submit" className="h-12 rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white transition hover:bg-brand-500 active:scale-[0.98]">Open record</button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
      </div>
    </section>
  );
}
