"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiAlertCircle, FiAlertTriangle, FiCheck, FiChevronDown, FiInfo, FiLoader, FiMinus, FiPaperclip, FiRefreshCw, FiShield, FiUserCheck } from "react-icons/fi";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import { useToast } from "@/components/Toast";
import { apiUrl, send } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { CheckStatus, ClaimDoc, Finding } from "./data";

const AGENT_LABEL = { Verified: "Verified", Pending: "Pending review", Missing: "Missing" } as const;

/** Icon circle per check result, in the same style as the eligibility checks above it. */
const STATUS_ICON: Record<CheckStatus | "none", { icon: typeof FiCheck; className: string }> = {
  Passed: { icon: FiCheck, className: "bg-emerald-50 text-emerald-600" },
  "Needs review": { icon: FiAlertCircle, className: "bg-amber-50 text-amber-600" },
  "High risk": { icon: FiAlertTriangle, className: "bg-rose-50 text-rose-600" },
  Checking: { icon: FiLoader, className: "bg-slate-100 text-slate-500 [&>svg]:animate-spin" },
  none: { icon: FiMinus, className: "bg-slate-100 text-slate-400" },
};
const FINDING_ICON: Record<Finding["severity"], { icon: typeof FiCheck; className: string }> = {
  high: { icon: FiAlertTriangle, className: "text-rose-600" },
  review: { icon: FiAlertCircle, className: "text-amber-600" },
  pass: { icon: FiCheck, className: "text-emerald-600" },
};

/**
 * The hospital's documents for a claim with the automatic authenticity checks on each uploaded file:
 * editing tools and edit history, copies of other patients' documents, AI-generation signs, and whether
 * names, dates and amounts match the claim. Risky documents open with their findings showing.
 */
export default function DocumentChecks({ docs, imageChecks }: { docs: ClaimDoc[]; imageChecks: boolean }) {
  const router = useRouter();
  const toast = useToast();
  // Only what the officer toggled; otherwise risky documents start open.
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<number | null>(null);

  const checked = docs.filter((d) => d.check && d.check.status !== "Checking");
  const count = (s: CheckStatus) => docs.filter((d) => d.check?.status === s).length;
  const summary = [
    count("High risk") && `${count("High risk")} high risk`,
    count("Needs review") && `${count("Needs review")} need${count("Needs review") === 1 ? "s" : ""} review`,
    count("Passed") && `${count("Passed")} passed`,
    count("Checking") && `${count("Checking")} checking`,
  ].filter(Boolean).join(" · ");

  const recheck = async (id: number) => {
    setBusy(id);
    try { await send("POST", `/api/document-files/${id}/recheck`); router.refresh(); }
    catch (e) { toast(e instanceof Error ? e.message : "Could not start the check"); }
    finally { setBusy(null); }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold text-slate-900">Documents from the hospital</h2>
        {summary && <p className="text-xs font-medium text-brand-700">{summary}</p>}
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><FiUserCheck className="shrink-0 text-brand-600" />Checked by the claims verification agent before sharing</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><FiShield className="shrink-0 text-brand-600" />Uploaded files are checked automatically for editing, copying and AI generation</p>
      {!imageChecks && <p className="mt-0.5 flex items-start gap-1.5 text-xs text-slate-500"><FiInfo className="mt-0.5 shrink-0 text-brand-600" />OCR and the AI-image model run on the local document verifier, which is not set up on this server. Every other check runs.</p>}

      <ul className="mt-3 divide-y divide-slate-100">
        {docs.map((d) => {
          const status = d.check?.status ?? "none";
          const { icon: Icon, className } = STATUS_ICON[status];
          const expandable = !!d.check && d.check.status !== "Checking";
          const isOpen = expandable && (open[d.name] ?? (status === "High risk" || status === "Needs review"));
          return (
            <li key={d.name} className="py-3">
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", className)}><Icon className="size-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{d.name}</p>
                  {d.fileUrl ? (
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <a href={apiUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-brand-700 hover:text-brand-800">
                        <FiPaperclip className="size-3 shrink-0" /><span className="truncate">{d.fileName}</span>
                      </a>
                      {d.uploadedAt && <span>Uploaded {d.uploadedAt}</span>}
                    </p>
                  ) : <p className="mt-0.5 text-xs text-slate-400">No file uploaded. Only the agent&apos;s check is available.</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  {d.check && <Badge tone="blue" className="font-semibold">{d.check.status === "Checking" ? "Checking…" : d.check.status}</Badge>}
                  <span className="text-[11px] text-slate-400">Agent: {AGENT_LABEL[d.status]}</span>
                </div>
              </div>

              {expandable && (
                <div className="ml-10 mt-2">
                  <button type="button" onClick={() => setOpen((o) => ({ ...o, [d.name]: !isOpen }))} aria-expanded={isOpen}
                    className="inline-flex items-center gap-1 rounded-md text-xs font-semibold text-brand-700 hover:text-brand-800">
                    {isOpen ? "Hide" : "Show"} {d.check!.findings.length} check{d.check!.findings.length === 1 ? "" : "s"}
                    <FiChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      <ul className="space-y-2.5">
                        {d.check!.findings.map((f) => {
                          const { icon: FIcon, className: fClass } = FINDING_ICON[f.severity];
                          return (
                            <li key={f.title + f.detail} className="flex gap-2.5">
                              <FIcon className={cn("mt-0.5 size-3.5 shrink-0", fClass)} />
                              <span className="min-w-0"><span className="block text-[13px] font-medium text-slate-900">{f.title}</span><span className="block text-xs leading-5 text-slate-500">{f.detail}</span></span>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-2.5 text-[11px] text-slate-400">
                        <span>{d.check!.checkedAt && `Checked ${d.check!.checkedAt}`}{d.check!.score !== undefined && ` · Risk score ${d.check!.score}/100`}</span>
                        <button type="button" disabled={busy !== null} onClick={() => recheck(d.id!)}
                          className="inline-flex items-center gap-1 rounded-md font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50">
                          <FiRefreshCw className={cn("size-3", busy === d.id && "animate-spin")} />{busy === d.id ? "Starting…" : "Check again"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {checked.length > 0 && <p className="mt-2 text-[11px] leading-4 text-slate-400">Automatic checks are warning signs, not proof. Open the file before deciding.</p>}
    </Card>
  );
}
