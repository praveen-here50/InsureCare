// Insurer portal data, served by the backend (GET /api/insurer).
import { api } from "@/lib/api";

export type NetHospital = { id: string; name: string; city: string; speciality: string; phone: string; avgTat: number };

export type Policyholder = {
  id: string; memberId: string; name: string; age: number; gender: "Male" | "Female"; phone: string;
  policy: { name: string; number: string; coverage: number; balance: number; startedOn: string; validTill: string; waitingMonths: number };
  declared: string[];
  admission?: { hospitalId: string; ward: string; bed: string; doctor: string; since: string; diagnosis: string };
};

export type ClaimStatus = "Received" | "Under review" | "Query raised" | "Approved" | "Settled" | "Rejected";
export type DocState = "Verified" | "Pending" | "Missing";
export type Claim = {
  /** hospitalId is absent for providers outside the hospital network (clinics, pharmacies); providerName names them. */
  id: string; memberId: string; hospitalId?: string; providerName?: string; type: string; diagnosis: string; claimed: number; approved?: number;
  status: ClaimStatus; submittedOn: string; updatedOn: string; preauth: boolean; officer: string; waitingOk: boolean;
  docs: { name: string; status: DocState }[]; timeline: { label: string; date: string; done: boolean; current: boolean }[];
  note?: string; flags: string[];
};

export type Snapshot = { insurer: { name: string; tagline: string }; hospitals: NetHospital[]; holders: Policyholder[]; claims: Claim[] };

export const OPEN: ClaimStatus[] = ["Received", "Under review", "Query raised"];
export const isOpen = (c: Claim) => OPEN.includes(c.status);

export type ClaimView = Claim & { patientName: string; patientSlug: string; hospitalName: string };

/** Lookups over one snapshot of the insurer's data. */
export function insurerData(s: Snapshot) {
  const { claims: CLAIMS, holders: HOLDERS, hospitals: NET_HOSPITALS } = s;
  const getHospital = (id?: string) => (id ? NET_HOSPITALS.find((h) => h.id === id) : undefined);
  const claimViews = (list: Claim[] = CLAIMS): ClaimView[] =>
    list.map((c) => { const h = HOLDERS.find((x) => x.memberId === c.memberId); return { ...c, patientName: h?.name ?? c.memberId, patientSlug: h?.id ?? "", hospitalName: getHospital(c.hospitalId)?.name ?? c.providerName ?? "" }; });
  return {
    INSURER: s.insurer,
    CLAIMS,
    HOLDERS,
    NET_HOSPITALS,
    getHospital,
    getHolder: (id: string) => HOLDERS.find((h) => h.id === id),
    getClaim: (id: string) => CLAIMS.find((c) => c.id === id),
    claimsOf: (memberId: string) => CLAIMS.filter((c) => c.memberId === memberId),
    claimsAt: (hospitalId: string) => CLAIMS.filter((c) => c.hospitalId === hospitalId),
    claimViews,
  };
}

export const getInsurerData = async () => insurerData(await api<Snapshot>("/api/insurer"));
