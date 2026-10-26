// Sample data for the insurer portal (CarePlus Insurance). Replace with API calls once the backend exists.
import { REQUIRED_DOCS } from "../hospital/data";

export const INSURER = { name: "CarePlus Insurance", tagline: "Claims operations" };

export type NetHospital = { id: string; name: string; city: string; speciality: string; phone: string; avgTat: number };
export const NET_HOSPITALS: NetHospital[] = [
  { id: "riverbend", name: "Riverbend Community Hospital", city: "Kurnool", speciality: "Multi-speciality", phone: "+91 90000 10001", avgTat: 3 },
  { id: "sunrise-heart", name: "Sunrise Heart Institute", city: "Kurnool", speciality: "Cardiac care", phone: "+91 90000 20002", avgTat: 5 },
  { id: "care-children", name: "Care Children’s Hospital", city: "Kurnool", speciality: "Paediatrics & neonatal", phone: "+91 90000 30003", avgTat: 4 },
  { id: "apex-neuro", name: "Apex Neuro Centre", city: "Kurnool", speciality: "Neurology & neurosurgery", phone: "+91 90000 40004", avgTat: 6 },
  { id: "kurnool-cancer", name: "Kurnool Cancer Centre", city: "Kurnool", speciality: "Oncology", phone: "+91 90000 50005", avgTat: 5 },
];

export type Policyholder = {
  id: string; memberId: string; name: string; age: number; gender: "Male" | "Female"; phone: string;
  policy: { name: string; number: string; coverage: number; balance: number; startedOn: string; validTill: string; waitingMonths: number };
  declared: string[];
  admission?: { hospitalId: string; ward: string; bed: string; doctor: string; since: string; diagnosis: string };
};
export const HOLDERS: Policyholder[] = [
  { id: "ic-2208", memberId: "IC-2208", name: "Lakshmi Devi", age: 29, gender: "Female", phone: "+91 99890 45512", policy: { name: "Maternity Plus", number: "IC-MP-••••-7720", coverage: 100000, balance: 100000, startedOn: "1 Apr 2025", validTill: "31 Mar 2027", waitingMonths: 9 }, declared: [], admission: { hospitalId: "riverbend", ward: "Maternity", bed: "MT-06", doctor: "Dr. Kavitha Reddy", since: "22 Oct 2026", diagnosis: "Planned delivery, 39 weeks" } },
  { id: "ic-6104", memberId: "IC-6104", name: "Arjun Reddy", age: 8, gender: "Male", phone: "+91 98660 20871", policy: { name: "Family Floater Basic", number: "IC-FF-••••-1845", coverage: 500000, balance: 480000, startedOn: "11 Feb 2024", validTill: "10 Feb 2027", waitingMonths: 12 }, declared: ["Seasonal asthma"], admission: { hospitalId: "riverbend", ward: "Paediatrics", bed: "PD-03", doctor: "Dr. Imran Shaikh", since: "23 Oct 2026", diagnosis: "Viral pneumonia" } },
  { id: "ic-4471", memberId: "IC-4471", name: "Meera Joshi", age: 52, gender: "Female", phone: "+91 98490 52277", policy: { name: "Family Health Shield Plus", number: "IC-FH-••••-6203", coverage: 1500000, balance: 1500000, startedOn: "16 Mar 2023", validTill: "15 Mar 2027", waitingMonths: 24 }, declared: ["Hypertension"], admission: { hospitalId: "riverbend", ward: "Emergency", bed: "ER-02", doctor: "Dr. Rohit Verma", since: "24 Oct 2026", diagnosis: "Suspected stroke, stabilised" } },
  { id: "ic-7842", memberId: "IC-7842", name: "Priya Sharma", age: 34, gender: "Female", phone: "+91 98765 43210", policy: { name: "Family Health Shield Plus", number: "IC-FH-••••-4821", coverage: 1500000, balance: 1456800, startedOn: "16 Mar 2022", validTill: "15 Mar 2027", waitingMonths: 24 }, declared: [] },
  { id: "ic-1156", memberId: "IC-1156", name: "Sanjay Gupta", age: 57, gender: "Male", phone: "+91 98480 66120", policy: { name: "Family Health Shield Plus", number: "IC-FH-••••-3057", coverage: 1500000, balance: 1250000, startedOn: "5 Jul 2021", validTill: "4 Jul 2027", waitingMonths: 24 }, declared: ["Hypertension", "Type 2 diabetes"], admission: { hospitalId: "sunrise-heart", ward: "Cardiac ICU", bed: "CICU-03", doctor: "Dr. A. Krishnan", since: "18 Oct 2026", diagnosis: "Triple-vessel coronary artery disease" } },
  { id: "ic-9034", memberId: "IC-9034", name: "Anitha Rao", age: 41, gender: "Female", phone: "+91 97010 28844", policy: { name: "Critical Illness Rider", number: "IC-CI-••••-9034", coverage: 500000, balance: 355000, startedOn: "1 Jan 2025", validTill: "31 Dec 2026", waitingMonths: 12 }, declared: [], admission: { hospitalId: "kurnool-cancer", ward: "Day care", bed: "DC-05", doctor: "Dr. Meghna Iyer", since: "15 Oct 2026", diagnosis: "Breast carcinoma, radiation course" } },
  { id: "ic-3321", memberId: "IC-3321", name: "Vikram Singh", age: 36, gender: "Male", phone: "+91 98850 14409", policy: { name: "Family Health Shield Plus", number: "IC-FH-••••-8812", coverage: 1500000, balance: 1440600, startedOn: "1 Sep 2023", validTill: "31 Aug 2027", waitingMonths: 24 }, declared: [] },
  { id: "ic-6678", memberId: "IC-6678", name: "Divya Nair", age: 5, gender: "Female", phone: "+91 99120 70331", policy: { name: "Family Floater Basic", number: "IC-FF-••••-2290", coverage: 500000, balance: 500000, startedOn: "10 Feb 2026", validTill: "9 Feb 2027", waitingMonths: 24 }, declared: [] },
];

export type ClaimStatus = "Received" | "Under review" | "Query raised" | "Approved" | "Settled" | "Rejected";
export type DocState = "Verified" | "Pending" | "Missing";
export type Claim = {
  id: string; memberId: string; hospitalId: string; type: string; diagnosis: string; claimed: number; approved?: number;
  status: ClaimStatus; submittedOn: string; updatedOn: string; preauth: boolean; officer: string; waitingOk: boolean;
  docs: { name: string; status: DocState }[]; timeline: { label: string; date: string; done: boolean; current: boolean }[];
  note?: string; flags: string[];
};

const STEPS = ["Claim received", "Documents verified", "Medical review", "Decision", "Settlement"];
const tl = (done: number, dates: string[]) => STEPS.map((label, i) => ({ label, date: dates[i] ?? "", done: i < done, current: i === done }));
const MAP = { V: "Verified", P: "Pending", M: "Missing" } as const;
const docs = (codes: string) => REQUIRED_DOCS.map((name, i) => ({ name, status: MAP[codes[i] as keyof typeof MAP] }));
const RM = "Rahul Menon";

export const CLAIMS: Claim[] = [
  { id: "CLM-2051", memberId: "IC-2208", hospitalId: "riverbend", type: "Maternity", diagnosis: "Planned delivery", claimed: 62000, status: "Received", submittedOn: "24 Oct 2026", updatedOn: "24 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVVVV"), timeline: tl(1, ["24 Oct"]), flags: [] },
  { id: "CLM-2049", memberId: "IC-6104", hospitalId: "riverbend", type: "Hospitalisation", diagnosis: "Viral pneumonia", claimed: 38500, status: "Under review", submittedOn: "23 Oct 2026", updatedOn: "24 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVPPM"), timeline: tl(2, ["23 Oct", "24 Oct"]), flags: [] },
  { id: "CLM-2047", memberId: "IC-4471", hospitalId: "riverbend", type: "Emergency care", diagnosis: "Suspected stroke, stabilised", claimed: 125000, status: "Under review", submittedOn: "24 Oct 2026", updatedOn: "24 Oct 2026", preauth: false, officer: RM, waitingOk: true, docs: docs("VPMMMM"), timeline: tl(1, ["24 Oct"]), flags: ["Emergency admission", "Transfer to Apex Neuro Centre requested"] },
  { id: "CLM-2046", memberId: "IC-4471", hospitalId: "apex-neuro", type: "Pre-authorisation", diagnosis: "Neurosurgery after stroke", claimed: 580000, status: "Received", submittedOn: "24 Oct 2026", updatedOn: "24 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVPMM"), timeline: tl(1, ["24 Oct"]), flags: ["High-value claim", "Linked to CLM-2047"] },
  { id: "CLM-2038", memberId: "IC-1156", hospitalId: "sunrise-heart", type: "Surgery", diagnosis: "Coronary artery bypass (CABG)", claimed: 380000, status: "Under review", submittedOn: "18 Oct 2026", updatedOn: "22 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVVVP"), timeline: tl(2, ["18 Oct", "20 Oct"]), flags: ["High-value claim", "Pre-existing: hypertension, diabetes"] },
  { id: "CLM-2031", memberId: "IC-9034", hospitalId: "kurnool-cancer", type: "Day care", diagnosis: "Breast carcinoma, radiation therapy", claimed: 145000, status: "Query raised", submittedOn: "15 Oct 2026", updatedOn: "21 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVVMV"), timeline: tl(2, ["15 Oct", "17 Oct"]), note: "Histopathology report is required before medical review can continue.", flags: ["Query awaiting hospital reply"] },
  { id: "CLM-2043", memberId: "IC-1156", hospitalId: "sunrise-heart", type: "Diagnostics", diagnosis: "Coronary angiography", claimed: 42000, approved: 38000, status: "Approved", submittedOn: "8 Oct 2026", updatedOn: "10 Oct 2026", preauth: false, officer: RM, waitingOk: true, docs: docs("VVVVVV"), timeline: tl(4, ["8 Oct", "9 Oct", "9 Oct", "10 Oct"]), note: "Approved. Payment to hospital is scheduled.", flags: [] },
  { id: "CLM-2022", memberId: "IC-3321", hospitalId: "riverbend", type: "Surgery", diagnosis: "Fracture fixation (tibia)", claimed: 62000, approved: 59400, status: "Settled", submittedOn: "2 Oct 2026", updatedOn: "12 Oct 2026", preauth: true, officer: RM, waitingOk: true, docs: docs("VVVVVV"), timeline: tl(5, ["2 Oct", "3 Oct", "5 Oct", "8 Oct", "12 Oct"]), note: "₹2,600 deducted as room-rent proportionate charges.", flags: [] },
  { id: "CLM-2019", memberId: "IC-6678", hospitalId: "care-children", type: "Surgery", diagnosis: "Tonsillectomy", claimed: 28000, status: "Rejected", submittedOn: "7 Oct 2026", updatedOn: "9 Oct 2026", preauth: true, officer: RM, waitingOk: false, docs: docs("VVVVVV"), timeline: tl(4, ["7 Oct", "8 Oct", "8 Oct", "9 Oct"]), note: "Procedure falls within the 24-month waiting period. Policy started 10 Feb 2026.", flags: ["Waiting period not met"] },
  { id: "CLM-1042", memberId: "IC-7842", hospitalId: "riverbend", type: "Hospitalisation", diagnosis: "Laparoscopic appendectomy", claimed: 48500, approved: 43200, status: "Settled", submittedOn: "21 Aug 2026", updatedOn: "28 Aug 2026", preauth: false, officer: RM, waitingOk: true, docs: docs("VVVVVV"), timeline: tl(5, ["21 Aug", "22 Aug", "24 Aug", "26 Aug", "28 Aug"]), flags: [] },
];

export const OPEN: ClaimStatus[] = ["Received", "Under review", "Query raised"];
export const isOpen = (c: Claim) => OPEN.includes(c.status);
export const getHospital = (id: string) => NET_HOSPITALS.find((h) => h.id === id);
export const getHolder = (id: string) => HOLDERS.find((h) => h.id === id);
export const getClaim = (id: string) => CLAIMS.find((c) => c.id === id);
export const claimsOf = (memberId: string) => CLAIMS.filter((c) => c.memberId === memberId);
export const claimsAt = (hospitalId: string) => CLAIMS.filter((c) => c.hospitalId === hospitalId);

export type ClaimView = Claim & { patientName: string; patientSlug: string; hospitalName: string };
export const claimViews = (list: Claim[] = CLAIMS): ClaimView[] =>
  list.map((c) => { const h = HOLDERS.find((x) => x.memberId === c.memberId); return { ...c, patientName: h?.name ?? c.memberId, patientSlug: h?.id ?? "", hospitalName: getHospital(c.hospitalId)?.name ?? "" }; });
