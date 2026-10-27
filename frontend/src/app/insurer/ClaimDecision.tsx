"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import Card from "@/components/Card";
import { send } from "@/lib/api";
import type { ClaimStatus } from "./data";

type Action = "approve" | "query" | "reject" | "settle";

/** Records the insurer's decision. The hospital desk and the member see it as soon as it is saved. */
export default function ClaimDecision({ claimId, claimed, status, open }: { claimId: string; claimed: number; status: ClaimStatus; open: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(String(claimed));
  const [busy, setBusy] = useState<Action | null>(null);

  const decide = async (action: Action) => {
    const approved = Number(amount);
    if (action === "approve" && (!Number.isFinite(approved) || approved <= 0 || approved > claimed)) { toast(`Enter an amount up to ₹${claimed.toLocaleString("en-IN")}`); return; }
    setBusy(action);
    try {
      await send("POST", `/api/insurer/claims/${claimId}/decision`, { action, note: note.trim() || undefined, amount: action === "approve" ? approved : undefined });
      setNote("");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save the decision");
    } finally {
      setBusy(null);
    }
  };

  if (status === "Approved") return (
    <Card className="p-5">
      <h2 className="font-semibold text-slate-900">Settlement</h2>
      <p className="mt-2 text-sm text-slate-500">Approved. Mark the claim settled once payment has reached the hospital.</p>
      <button type="button" disabled={busy !== null} onClick={() => decide("settle")} className="mt-3 w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60">{busy === "settle" ? "Saving…" : "Mark as settled"}</button>
    </Card>
  );
  if (!open) return <Card className="p-5 text-sm text-slate-500">This claim already has a final decision.</Card>;
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-slate-900">Decision</h2>
      <label className="mt-3 block text-xs font-medium text-slate-500">Approved amount (₹)
        <input type="number" inputMode="numeric" min={1} max={claimed} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800" />
      </label>
      <label className="mt-3 block text-xs font-medium text-slate-500">Note to hospital (optional)
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. Please share the histopathology report" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400" />
      </label>
      <div className="mt-3 grid gap-2">
        <button type="button" disabled={busy !== null} onClick={() => decide("approve")} className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] disabled:opacity-60">{busy === "approve" ? "Saving…" : "Approve claim"}</button>
        <button type="button" disabled={busy !== null} onClick={() => decide("query")} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60">{busy === "query" ? "Saving…" : "Raise a query"}</button>
        <button type="button" disabled={busy !== null} onClick={() => decide("reject")} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 active:scale-[0.98] disabled:opacity-60">{busy === "reject" ? "Saving…" : "Reject claim"}</button>
      </div>
    </Card>
  );
}
