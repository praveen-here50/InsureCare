"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck, FiExternalLink, FiLoader, FiLock, FiSend, FiUpload } from "react-icons/fi";
import { useToast } from "@/components/Toast";
import { buttonClass, Surface } from "@/components/portal/ui";
import { apiUrl, send } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useSession } from "@/components/portal/SessionContext";
import { type Patient, verifiedCount } from "./data";
import { FileTypeIcon, fileSize, fileType, Status } from "./ui";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

/** A patient's insurer documents as a file table: upload or replace each file, mark it verified, then send all to the insurer. */
export default function ClaimDocuments({ patient: p, agent }: { patient: Patient; agent: string }) {
  const { hospitalId } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const verified = verifiedCount(p);
  const open = p.documents.length - verified;
  const shared = p.sharedAt;

  /** Runs a change against the backend; every open portal refreshes from the live update it triggers. */
  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key);
    try { await action(); router.refresh(); } catch (e) { toast(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(null); }
  };
  const verify = (position: number) => run(`verify-${position}`, () => send("PATCH", `/api/hospitals/${hospitalId}/patients/${p.id}/documents/${position}`, { status: "Verified" }));
  /** Uploads the file for a document; the backend checks it for signs of editing, copying or AI generation. */
  const upload = (position: number, file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { toast("Please choose a PDF, JPG or PNG file."); return; }
    if (file.size > MAX_BYTES) { toast("Files can be up to 10 MB."); return; }
    const form = new FormData();
    form.append("file", file);
    return run(`file-${position}`, async () => {
      await send("POST", `/api/hospitals/${hospitalId}/patients/${p.id}/documents/${position}/file`, form);
      toast("Uploaded. Checking the file…");
    });
  };
  const share = () => run("share", () => send("POST", `/api/hospitals/${hospitalId}/patients/${p.id}/share`));

  return (
    <Surface className="overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
          <p className="mt-0.5 text-sm text-slate-500">{verified} of {p.documents.length} verified · Checked by {agent}</p>
        </div>
        {shared ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-care-700"><FiCheck />Sent to {p.policy.provider} · {shared}</p>
        ) : (
          <button type="button" disabled={open > 0 || busy !== null} onClick={share}
            className={buttonClass("primary", "h-10 disabled:border disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none disabled:!opacity-100")}>
            <FiSend />{open > 0 ? `${open} document${open > 1 ? "s" : ""} left to verify` : busy === "share" ? "Sending…" : `Send to ${p.policy.provider}`}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50/60 text-xs text-slate-500">
              <th scope="col" className="py-3 pl-6 pr-4 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Size</th>
              <th scope="col" className="px-4 py-3 font-medium">Type</th>
              <th scope="col" className="px-4 py-3 font-medium">Uploaded</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="py-3 pl-4 pr-6 text-right font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {p.documents.map((d, i) => {
              const uploading = busy === `file-${i}`;
              return (
                <tr key={d.name} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-care-50/40">
                  <td className="py-3.5 pl-6 pr-4">
                    <span className="flex items-center gap-3">
                      <FileTypeIcon fileName={d.fileName} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-900">{d.name}</span>
                        <span className="block max-w-[260px] truncate text-xs text-slate-500">{d.fileName ?? d.note ?? "No file yet"}</span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{fileSize(d.fileSize) ?? "—"}</td>
                  <td className="px-4 py-3.5 text-slate-600">{fileType(d.fileName) ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{d.uploadedAt ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <Status className="block">{d.status}</Status>
                    {d.check === "Checking" && <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><FiLoader className="size-3 animate-spin" />Checking file</span>}
                    {d.check === "Checked" && <span className="mt-0.5 block text-[11px] text-slate-500">File checked</span>}
                  </td>
                  <td className="py-3.5 pl-4 pr-6">
                    <span className="flex items-center justify-end gap-1">
                      {d.fileUrl && (
                        <a href={apiUrl(d.fileUrl)} target="_blank" rel="noopener noreferrer" title="Open file" aria-label={`Open ${d.fileName}`}
                          className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-care-700 hover:shadow-soft">
                          <FiExternalLink className="size-4" />
                        </a>
                      )}
                      {!shared && (
                        <label title={d.fileUrl ? "Replace file" : "Upload file"}
                          className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-care-300 hover:text-care-700", busy !== null && "pointer-events-none opacity-50")}>
                          {uploading ? <FiLoader className="size-3.5 animate-spin" /> : <FiUpload className="size-3.5" />}
                          {uploading ? "Uploading" : d.fileUrl ? "Replace" : "Upload"}
                          <input type="file" accept={ACCEPTED.join(",")} className="sr-only" disabled={busy !== null}
                            onChange={(e) => { upload(i, e.target.files?.[0]); e.target.value = ""; }} />
                        </label>
                      )}
                      {!shared && d.status !== "Verified" && (
                        <button type="button" disabled={busy !== null} onClick={() => verify(i)}
                          className="flex h-8 items-center gap-1.5 rounded-lg bg-care-600 px-3 text-xs font-semibold text-white transition hover:bg-care-700 disabled:opacity-50">
                          <FiCheck className="size-3.5" />{busy === `verify-${i}` ? "Saving" : "Verify"}
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="flex items-start gap-2 border-t border-slate-100 px-6 py-3.5 text-xs leading-5 text-slate-500">
        <FiLock className="mt-0.5 shrink-0 text-slate-400" />
        The insurer receives the member ID, policy, diagnosis, treatment plan and these verified documents. Medical history and other admissions stay with the hospital. Files are PDF, JPG or PNG up to 10 MB and are checked automatically after upload.
      </p>
    </Surface>
  );
}
