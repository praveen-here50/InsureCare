"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck, FiLoader, FiPaperclip, FiSend, FiShield, FiUpload, FiUserCheck, FiX } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { buttonClass, Pill, PillTabs, Surface, type Tone } from "@/components/portal/ui";
import { apiUrl, send } from "@/lib/api";
import { cn } from "@/lib/cn";
import { HOSPITAL_ID, type ClaimLink, type Doc, type Patient, inr, verifiedCount } from "./data";
import { Avatar, DocIcon, docTone } from "./ui";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;
const FILTERS = ["All", "Ready to share", "In verification", "Shared"] as const;
type Filter = (typeof FILTERS)[number];
const CLAIM_TONE: Record<ClaimLink["status"], Tone> = { Received: "slate", "Under review": "sky", "Query raised": "amber", Approved: "green", Settled: "green", Rejected: "rose" };

export default function ClaimsBoard({ patients, agent }: { patients: Patient[]; agent: string }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("All");
  const [busy, setBusy] = useState<string | null>(null);
  const stateOf = (p: Patient): Exclude<Filter, "All"> => (p.sharedAt ? "Shared" : verifiedCount(p) === p.documents.length ? "Ready to share" : "In verification");
  const rows = patients.filter((p) => filter === "All" || stateOf(p) === filter);
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "All" ? patients.length : patients.filter((p) => stateOf(p) === f).length])) as Record<Filter, number>;

  /** Runs a change against the backend; every open portal refreshes from the live update it triggers. */
  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    try { await action(); router.refresh(); } catch (e) { toast(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(null); }
  };
  const verify = (p: Patient, position: number) => run(`${p.id}-${position}`, () => send("PATCH", `/api/hospitals/${HOSPITAL_ID}/patients/${p.id}/documents/${position}`, { status: "Verified" }));
  /** Uploads the file for a document; the backend checks it for signs of editing, copying or AI generation. */
  const upload = (p: Patient, position: number, file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { toast("Please choose a PDF, JPG or PNG file."); return; }
    if (file.size > MAX_BYTES) { toast("Files can be up to 10 MB."); return; }
    const form = new FormData();
    form.append("file", file);
    return run(`${p.id}-${position}-file`, async () => {
      await send("POST", `/api/hospitals/${HOSPITAL_ID}/patients/${p.id}/documents/${position}/file`, form);
      toast("Uploaded. Checking the file…");
    });
  };
  const share = (p: Patient) => run(p.id, () => send("POST", `/api/hospitals/${HOSPITAL_ID}/patients/${p.id}/share`));

  return (
    <div className="flex flex-col gap-6">
      <Surface className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-bold text-ink">Shared with the insurer</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {["Member ID and policy number", "Diagnosis and treatment plan", "Verified documents and itemised bill"].map((t) => <li key={t} className="flex items-center gap-2"><FiCheck className="shrink-0 text-care-600" />{t}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Never shared</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {["Full medical history and unrelated reports", "Records from other admissions", "Anything not verified by the agent"].map((t) => <li key={t} className="flex items-center gap-2"><FiX className="shrink-0 text-slate-400" />{t}</li>)}
          </ul>
        </div>
      </Surface>

      <PillTabs value={filter} options={FILTERS} onChange={setFilter} counts={counts} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {rows.map((p) => {
          const verified = verifiedCount(p);
          const open = p.documents.length - verified;
          const done = p.sharedAt;
          return (
            <Surface key={p.id} className="flex flex-col p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <Link href={`/hospital/patients/${p.id}`} className="font-bold text-ink hover:text-care-700">{p.name}</Link>
                  <p className="truncate text-xs text-slate-400">{p.memberId} · {p.policy.provider} · {p.policy.name}</p>
                </div>
                <Pill tone={done ? "green" : open === 0 ? "sky" : "amber"}>{done ? "Shared" : open === 0 ? "Ready to share" : "In verification"}</Pill>
              </div>

              {p.claim && (
                <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  Insurer claim {p.claim.id}
                  <Pill tone={CLAIM_TONE[p.claim.status]}>{p.claim.status}{p.claim.approved ? ` · ${inr(p.claim.approved)}` : ""}</Pill>
                </p>
              )}

              <p className="mt-4 text-xs font-semibold text-slate-500">{verified} of {p.documents.length} documents verified</p>
              <ul className="mt-2 divide-y divide-slate-100">
                {p.documents.map((d, i) => (
                  <li key={d.name} className="flex items-start gap-3 py-2.5">
                    <DocIcon status={d.status} className="mt-0.5" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-800">{d.name}</span>
                      {d.note && <span className="block text-xs text-slate-500">{d.note}</span>}
                      <FileLine doc={d} />
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <Pill tone={docTone[d.status]}>{d.status}</Pill>
                      <span className="flex items-center gap-0.5">
                        {!done && (
                          <label className={cn("inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-care-700 transition hover:bg-care-50", busy !== null && "pointer-events-none opacity-50")}>
                            <FiUpload className="size-3.5" />{busy === `${p.id}-${i}-file` ? "Uploading…" : d.fileUrl ? "Replace" : "Upload"}
                            <input type="file" accept={ACCEPTED.join(",")} className="sr-only" disabled={busy !== null}
                              onChange={(e) => { upload(p, i, e.target.files?.[0]); e.target.value = ""; }} />
                          </label>
                        )}
                        {d.status !== "Verified" && (
                          <button type="button" disabled={busy !== null} onClick={() => verify(p, i)} className="rounded-lg px-2 py-1 text-xs font-semibold text-care-700 transition hover:bg-care-50 disabled:opacity-50">
                            {busy === `${p.id}-${i}` ? "Saving…" : "Mark verified"}
                          </button>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><FiUserCheck className="shrink-0" />Checked by {agent}</p>

              <div className="mt-auto border-t border-slate-100 pt-4">
                {done ? <p className="flex items-center gap-2 text-sm font-semibold text-care-700"><FiCheck />Sent to {p.policy.provider} · {done}</p> : (
                  <button type="button" disabled={open > 0 || busy !== null} onClick={() => share(p)}
                    className={buttonClass("primary", "w-full disabled:border disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:!opacity-100")}>
                    <FiSend />{open > 0 ? `Resolve ${open} document${open > 1 ? "s" : ""} to share` : busy === p.id ? "Sending…" : `Send to ${p.policy.provider}`}
                  </button>
                )}
              </div>
            </Surface>
          );
        })}
      </div>
      {rows.length === 0 && <Surface className="p-10 text-center text-sm text-slate-500">Nothing in this view.</Surface>}
    </div>
  );
}

/** The uploaded file under a document's name: link, upload time and whether the automatic checks have run. */
function FileLine({ doc }: { doc: Doc }) {
  if (!doc.fileUrl) return <span className="mt-0.5 block text-xs text-slate-400">No file uploaded</span>;
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
      <a href={apiUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-care-700 hover:text-care-800">
        <FiPaperclip className="size-3 shrink-0" /><span className="truncate">{doc.fileName}</span>
      </a>
      {doc.uploadedAt && <span>{doc.uploadedAt}</span>}
      {doc.check === "Checking"
        ? <span className="inline-flex items-center gap-1"><FiLoader className="size-3 animate-spin" />Checking file…</span>
        : doc.check === "Checked" && <span className="inline-flex items-center gap-1"><FiShield className="size-3 text-care-600" />File checked</span>}
    </span>
  );
}
