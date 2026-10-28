import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Field, Surface, ViewLink } from "@/components/portal/ui";
import ClaimDocuments from "../../ClaimDocuments";
import { claimState, inr } from "../../data";
import { getHospitalDesk } from "../../server";
import { Avatar, Status } from "../../ui";

export default async function HospitalClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { AGENT, getPatient } = await getHospitalDesk();
  const p = getPatient(id);
  if (!p || p.status === "Not admitted") notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/hospital/claims" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-care-700"><FiArrowLeft />Claims</Link>

      <Surface className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={p.name} className="size-14 rounded-xl text-base" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900">{p.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{p.memberId} · {p.age} yrs · {p.gender} · {p.ward} · {p.bed}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-slate-400">Claim status</p>
          <Status className="text-sm">{claimState(p)}</Status>
        </div>
      </Surface>

      <Surface className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Claim details</h2>
          <ViewLink href={`/hospital/patients/${p.id}`}>View patient record</ViewLink>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <Field label="Insurer">{p.policy.provider}</Field>
          <Field label="Policy">{p.policy.name}</Field>
          <Field label="Policy number">{p.policy.number}</Field>
          <Field label="Claim type">{p.policy.cashless ? "Cashless" : "Reimbursement"}</Field>
          <Field label="Sum insured">{inr(p.policy.coverage)}</Field>
          <Field label="Remaining cover">{inr(p.policy.balance)}</Field>
          <Field label="Diagnosis">{p.diagnosis}</Field>
          <Field label="Doctor">{p.doctor ?? "—"}</Field>
          <Field label="Admitted on">{p.admittedOn ?? "—"}</Field>
          <Field label="Insurer claim">{p.claim?.id ?? "Not sent yet"}</Field>
          <Field label="Insurer status">{p.claim?.status ?? "—"}</Field>
          <Field label="Approved">{p.claim?.approved ? inr(p.claim.approved) : "—"}</Field>
        </div>
      </Surface>

      <ClaimDocuments patient={p} agent={AGENT} />
    </div>
  );
}
