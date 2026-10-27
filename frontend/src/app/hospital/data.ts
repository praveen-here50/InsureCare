// Hospital portal data, served by the backend (GET /api/hospitals/{id}/workspace).
import { api } from "@/lib/api";

/** The hospital this desk belongs to. */
export const HOSPITAL_ID = process.env.NEXT_PUBLIC_HOSPITAL_ID ?? "riverbend";

/* ---------------- Beds ---------------- */
export type BedStatus = "available" | "occupied" | "reserved";
export type Bed = { label: string; status: BedStatus };
export type Ward = { id: string; name: string; prefix: string; total: number; occupied: number; reserved: number; note: string; beds: Bed[] };

export const wardAvailable = (w: Ward) => w.total - w.occupied - w.reserved;
export const bedsFor = (w: Ward) => w.beds;

/* ---------------- Services ---------------- */
export type Service = { name: string; available: boolean; note: string; referTo?: string };

/* ---------------- Patients ---------------- */
export type PatientStatus = "Admitted" | "Under observation" | "Ready for discharge" | "Not admitted";
export type DocStatus = "Verified" | "Pending review" | "Needs correction" | "Missing";
export type Coverage = "Covered" | "Partially covered" | "Not covered";
export type Doc = { name: string; status: DocStatus; note?: string };
/** The insurer's latest position on this patient's claim. */
export type ClaimLink = { id: string; status: "Received" | "Under review" | "Query raised" | "Approved" | "Settled" | "Rejected"; approved?: number };
export type Patient = {
  id: string; memberId: string; name: string; age: number; gender: "Male" | "Female"; phone: string; bloodGroup: string;
  status: PatientStatus; ward?: string; bed?: string; admittedOn?: string; doctor?: string; diagnosis: string;
  policy: { name: string; provider: string; number: string; coverage: number; balance: number; cashless: boolean; validTill: string };
  allergies: string[]; medications: string[]; history: { year: string; event: string }[];
  treatments: { service: string; coverage: Coverage }[];
  documents: Doc[]; sharedAt?: string; claim?: ClaimLink;
};

export type Workspace = { hospital: { id: string; name: string; location: string }; agent: string; wards: Ward[]; services: Service[]; patients: Patient[] };

/** Loads the desk and returns it with the lookups the pages use. */
export async function getHospitalDesk() {
  const w = await api<Workspace>(`/api/hospitals/${HOSPITAL_ID}/workspace`);
  return {
    HOSPITAL: w.hospital,
    AGENT: w.agent,
    WARDS: w.wards,
    SERVICES: w.services,
    PATIENTS: w.patients,
    admitted: () => w.patients.filter((p) => p.status !== "Not admitted"),
    getPatient: (id: string) => w.patients.find((p) => p.id === id),
    serviceByName: (name: string) => w.services.find((s) => s.name === name),
  };
}

export const verifiedCount = (p: Patient) => p.documents.filter((d) => d.status === "Verified").length;
export type ClaimState = "Shared with insurer" | "Ready to share" | "In verification";
export const claimState = (p: Patient): ClaimState => (p.sharedAt ? "Shared with insurer" : p.documents.length > 0 && verifiedCount(p) === p.documents.length ? "Ready to share" : "In verification");
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
