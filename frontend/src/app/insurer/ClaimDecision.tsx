"use client";

import { useState } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import Card from "@/components/Card";

type Decision = { label: string; tone: string; text: string };

export default function ClaimDecision({ claimId, claimed, locked }: { claimId: string; claimed: number; locked: boolean }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const decide = (label: string, tone: string) => { setDecision({ label, tone, text: note.trim() }); toast(`${claimId}: ${label}`); };

  if (locked) return <Card className="p-5 text-sm text-slate-500">This claim already has a final decision.</Card>;
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-slate-900">Decision</h2>
      {decision ? (
        <div className="mt-3 animate-fade-up">
          <p className={`rounded-lg px-4 py-3 text-sm font-medium ${decision.tone}`}>{claimId}: {decision.label}{decision.text && <span className="mt-1 block font-normal opacity-80">Note to hospital: {decision.text}</span>}</p>
          <button type="button" onClick={() => setDecision(null)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950"><FiRotateCcw />Change decision</button>
        </div>
      ) : (
        <>
          <label className="mt-3 block text-xs font-medium text-slate-500">Note to hospital (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Please share the histopathology report" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400" />
          </label>
          <div className="mt-3 grid gap-2">
            <button type="button" onClick={() => decide(`Approved for ₹${claimed.toLocaleString("en-IN")}`, "bg-emerald-50 text-emerald-800")} className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98]">Approve claim</button>
            <button type="button" onClick={() => decide("Query raised with hospital", "bg-amber-50 text-amber-800")} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 active:scale-[0.98]">Raise a query</button>
            <button type="button" onClick={() => decide("Rejected", "bg-rose-50 text-rose-800")} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 active:scale-[0.98]">Reject claim</button>
          </div>
        </>
      )}
    </Card>
  );
}
