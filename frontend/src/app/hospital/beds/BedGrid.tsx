"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { send } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useSession } from "@/components/portal/SessionContext";
import { type Bed, type BedStatus } from "../data";
import { BED_LABEL, BED_TILE } from "../ui";

const NEXT: Record<BedStatus, BedStatus> = { available: "reserved", reserved: "occupied", occupied: "available" };

/** A ward's beds. Clicking a bed moves it to the next status: free → reserved → occupied → free. */
export default function BedGrid({ beds }: { beds: Bed[] }) {
  const { hospitalId } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const cycle = async (b: Bed) => {
    setSaving(b.label);
    try {
      await send("PATCH", `/api/hospitals/${hospitalId}/beds/${b.label}`, { status: NEXT[b.status] });
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update the bed");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {beds.map((b) => (
        <button key={b.label} type="button" onClick={() => cycle(b)} disabled={saving !== null}
          title={`${b.label} · ${BED_LABEL[b.status]} · click to mark ${BED_LABEL[NEXT[b.status]].toLowerCase()}`}
          className={cn("flex h-10 items-center justify-center rounded-lg border text-[11px] font-semibold transition hover:ring-2 hover:ring-care-200 disabled:cursor-wait", BED_TILE[b.status], saving === b.label && "animate-pulse")}>
          {b.label.split("-")[1]}
        </button>
      ))}
    </div>
  );
}
