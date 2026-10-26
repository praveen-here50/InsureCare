// Sample data for the hospital portal. Replace with API calls once the backend exists.

export const HOSPITAL = { name: "Riverbend Community Hospital", location: "Kurnool, Andhra Pradesh" };
export const AGENT = "Kavya N., Claims verification agent";

/* ---------------- Beds ---------------- */
export type BedStatus = "available" | "occupied" | "reserved";
export type Ward = { id: string; name: string; prefix: string; total: number; occupied: number; reserved: number; note: string };

export const WARDS: Ward[] = [
  { id: "icu", name: "Intensive care (ICU)", prefix: "ICU", total: 12, occupied: 9, reserved: 1, note: "Ventilator and cardiac monitoring" },
  { id: "emergency", name: "Emergency", prefix: "ER", total: 10, occupied: 6, reserved: 1, note: "24×7 casualty" },
  { id: "general", name: "General ward", prefix: "GW", total: 40, occupied: 27, reserved: 2, note: "Medical and surgical" },
  { id: "private", name: "Private rooms", prefix: "PR", total: 16, occupied: 9, reserved: 2, note: "Single occupancy" },
  { id: "maternity", name: "Maternity", prefix: "MT", total: 14, occupied: 8, reserved: 1, note: "Labour and postnatal" },
  { id: "paediatrics", name: "Paediatrics", prefix: "PD", total: 12, occupied: 5, reserved: 0, note: "Children up to 14 years" },
];

export const wardAvailable = (w: Ward) => w.total - w.occupied - w.reserved;

/** Deterministic bed layout so the map is stable between renders. */
export function bedsFor(w: Ward): { label: string; status: BedStatus }[] {
  return Array.from({ length: w.total }, (_, i) => {
    const rank = (i * 11 + 3) % w.total;
    const status: BedStatus = rank < w.occupied ? "occupied" : rank < w.occupied + w.reserved ? "reserved" : "available";
    return { label: `${w.prefix}-${String(i + 1).padStart(2, "0")}`, status };
  });
}

/* ---------------- Services ---------------- */
export type Service = { name: string; available: boolean; note: string; referTo?: string };
export const SERVICES: Service[] = [
  { name: "Emergency & trauma care", available: true, note: "24×7 casualty, stabilisation and trauma surgery" },
  { name: "General medicine", available: true, note: "Fever, infections, diabetes and chronic disease care" },
  { name: "General surgery", available: true, note: "Laparoscopic and open surgeries" },
  { name: "Orthopaedics", available: true, note: "Fracture fixation, knee and hip replacement" },
  { name: "Cardiology (non-surgical)", available: true, note: "Angiography, angioplasty and cardiac ICU" },
  { name: "Maternity & gynaecology", available: true, note: "Normal and caesarean delivery" },
  { name: "Paediatrics", available: true, note: "Inpatient care for children up to 14 years" },
  { name: "Dialysis", available: true, note: "8 haemodialysis stations" },
  { name: "Ophthalmology", available: true, note: "Cataract surgery and retina laser" },
  { name: "Chemotherapy day care", available: true, note: "Outpatient chemotherapy infusion" },
  { name: "Cardiac surgery", available: false, note: "Bypass and valve surgery", referTo: "Sunrise Heart Institute, 18 km" },
  { name: "Neurosurgery", available: false, note: "Brain and spine surgery", referTo: "Apex Neuro Centre, 22 km" },
  { name: "Neonatal ICU (NICU)", available: false, note: "Critical care for newborns", referTo: "Care Children’s Hospital, 12 km" },
  { name: "Radiation therapy & organ transplant", available: false, note: "Radiotherapy and transplant programmes", referTo: "Kurnool Cancer Centre, 9 km" },
];
export const serviceByName = (name: string) => SERVICES.find((s) => s.name === name);

/* ---------------- Patients ---------------- */
export type PatientStatus = "Admitted" | "Under observation" | "Ready for discharge" | "Not admitted";
export type DocStatus = "Verified" | "Pending review" | "Needs correction" | "Missing";
export type Coverage = "Covered" | "Partially covered" | "Not covered";
export type Doc = { name: string; status: DocStatus; note?: string };
export type Patient = {
  id: string; memberId: string; name: string; age: number; gender: "Male" | "Female"; phone: string; bloodGroup: string;
  status: PatientStatus; ward?: string; bed?: string; admittedOn?: string; doctor?: string; diagnosis: string;
  policy: { name: string; provider: string; number: string; coverage: number; balance: number; cashless: boolean; validTill: string };
  allergies: string[]; medications: string[]; history: { year: string; event: string }[];
  treatments: { service: string; coverage: Coverage }[];
  documents: Doc[]; sharedAt?: string;
};

export const REQUIRED_DOCS = ["Admission note", "Pre-authorisation form", "Patient ID proof", "Treatment plan", "Investigation reports", "Interim bill"];
const STATUS = { V: "Verified", P: "Pending review", C: "Needs correction", M: "Missing" } as const;
const docs = (codes: string, notes: Record<number, string> = {}): Doc[] =>
  REQUIRED_DOCS.map((name, i) => ({ name, status: STATUS[codes[i] as keyof typeof STATUS], note: notes[i] }));

export const PATIENTS: Patient[] = [
  { id: "ic-5310", memberId: "IC-5310", name: "Ramesh Kumar", age: 62, gender: "Male", phone: "+91 98480 11023", bloodGroup: "B+", status: "Admitted", ward: "ICU", bed: "ICU-04", admittedOn: "20 Oct 2026", doctor: "Dr. S. Menon", diagnosis: "Acute myocardial infarction",
    policy: { name: "Senior Care Gold", provider: "SecureLife Assurance", number: "IC-SC-••••-3391", coverage: 1000000, balance: 1000000, cashless: true, validTill: "30 Jun 2027" },
    allergies: ["Sulfa drugs"], medications: ["Aspirin 75 mg", "Atorvastatin 40 mg", "Metformin 500 mg"],
    history: [{ year: "2024", event: "Hospitalised for unstable angina" }, { year: "2022", event: "Diagnosed with hypertension" }, { year: "2019", event: "Diagnosed with type 2 diabetes" }],
    treatments: [{ service: "Cardiology (non-surgical)", coverage: "Covered" }, { service: "Cardiac surgery", coverage: "Covered" }],
    documents: docs("VVVPCM", { 3: "Awaiting cardiologist signature", 4: "ECG report is missing the doctor’s signature" }) },
  { id: "ic-2208", memberId: "IC-2208", name: "Lakshmi Devi", age: 29, gender: "Female", phone: "+91 99890 45512", bloodGroup: "O+", status: "Admitted", ward: "Maternity", bed: "MT-06", admittedOn: "22 Oct 2026", doctor: "Dr. Kavitha Reddy", diagnosis: "Planned delivery, 39 weeks",
    policy: { name: "Maternity Plus", provider: "CarePlus Insurance", number: "IC-MP-••••-7720", coverage: 100000, balance: 100000, cashless: true, validTill: "31 Mar 2027" },
    allergies: [], medications: ["Folic acid", "Iron supplement"],
    history: [{ year: "2026", event: "Uncomplicated pregnancy, regular antenatal visits" }, { year: "2023", event: "First delivery, normal" }],
    treatments: [{ service: "Maternity & gynaecology", coverage: "Covered" }, { service: "Neonatal ICU (NICU)", coverage: "Partially covered" }],
    documents: docs("VVVVVV") },
  { id: "ic-6104", memberId: "IC-6104", name: "Arjun Reddy", age: 8, gender: "Male", phone: "+91 98660 20871", bloodGroup: "A+", status: "Under observation", ward: "Paediatrics", bed: "PD-03", admittedOn: "23 Oct 2026", doctor: "Dr. Imran Shaikh", diagnosis: "Viral pneumonia",
    policy: { name: "Family Floater Basic", provider: "CarePlus Insurance", number: "IC-FF-••••-1845", coverage: 500000, balance: 480000, cashless: true, validTill: "10 Feb 2027" },
    allergies: ["Peanuts"], medications: ["Paracetamol syrup", "Nebulisation"],
    history: [{ year: "2025", event: "Seasonal asthma, managed with inhaler" }],
    treatments: [{ service: "Paediatrics", coverage: "Covered" }],
    documents: docs("VVVPPM", { 3: "Doctor review pending", 4: "Chest X-ray uploaded, awaiting check" }) },
  { id: "ic-8873", memberId: "IC-8873", name: "Fatima Begum", age: 71, gender: "Female", phone: "+91 97010 33418", bloodGroup: "AB+", status: "Admitted", ward: "General ward", bed: "GW-18", admittedOn: "19 Oct 2026", doctor: "Dr. S. Menon", diagnosis: "Hip fracture, surgery planned",
    policy: { name: "Senior Care Gold", provider: "SecureLife Assurance", number: "IC-SC-••••-5532", coverage: 1000000, balance: 920000, cashless: false, validTill: "30 Jun 2027" },
    allergies: ["Penicillin"], medications: ["Calcium + vitamin D", "Pantoprazole"],
    history: [{ year: "2025", event: "Chronic kidney disease, stage 3" }, { year: "2021", event: "Osteoporosis diagnosed" }],
    treatments: [{ service: "Orthopaedics", coverage: "Covered" }, { service: "Dialysis", coverage: "Partially covered" }],
    documents: docs("VCVVPM", { 1: "Policy number does not match the insurer’s record", 4: "Pre-operative blood tests pending", 5: "Not generated yet" }) },
  { id: "ic-3946", memberId: "IC-3946", name: "Suresh Naidu", age: 45, gender: "Male", phone: "+91 98850 76620", bloodGroup: "O−", status: "Ready for discharge", ward: "General ward", bed: "GW-07", admittedOn: "17 Oct 2026", doctor: "Dr. Anand P.", diagnosis: "Acute appendicitis, post laparoscopic surgery",
    policy: { name: "Corporate Group Cover", provider: "SafeGuard General", number: "IC-CG-••••-9016", coverage: 300000, balance: 300000, cashless: true, validTill: "31 Dec 2026" },
    allergies: [], medications: ["Oral antibiotics (3 days)"],
    history: [{ year: "2026", event: "Laparoscopic appendectomy" }],
    treatments: [{ service: "General surgery", coverage: "Covered" }],
    documents: docs("VVVVVV"), sharedAt: "24 Oct, 9:40 AM" },
  { id: "ic-4471", memberId: "IC-4471", name: "Meera Joshi", age: 52, gender: "Female", phone: "+91 98490 52277", bloodGroup: "B−", status: "Admitted", ward: "Emergency", bed: "ER-02", admittedOn: "24 Oct 2026", doctor: "Dr. Rohit Verma", diagnosis: "Suspected stroke, stabilised",
    policy: { name: "Family Health Shield Plus", provider: "CarePlus Insurance", number: "IC-FH-••••-6203", coverage: 1500000, balance: 1500000, cashless: true, validTill: "15 Mar 2027" },
    allergies: ["Latex"], medications: ["Clopidogrel 75 mg"],
    history: [{ year: "2023", event: "Hypertension, on regular medication" }],
    treatments: [{ service: "Emergency & trauma care", coverage: "Covered" }, { service: "Neurosurgery", coverage: "Covered" }],
    documents: docs("VPMMMM", { 1: "Form submitted, awaiting check" }) },
  { id: "ic-7842", memberId: "IC-7842", name: "Priya Sharma", age: 34, gender: "Female", phone: "+91 98765 43210", bloodGroup: "A+", status: "Not admitted", diagnosis: "No active admission",
    policy: { name: "Family Health Shield Plus", provider: "CarePlus Insurance", number: "IC-FH-••••-4821", coverage: 1500000, balance: 1456800, cashless: true, validTill: "15 Mar 2027" },
    allergies: ["Penicillin"], medications: [],
    history: [{ year: "2026", event: "Laparoscopic appendectomy at this hospital (claim CLM-1042, approved)" }, { year: "2021", event: "Routine health check, no findings" }],
    treatments: [], documents: [] },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);
export const admitted = () => PATIENTS.filter((p) => p.status !== "Not admitted");
export const verifiedCount = (p: Patient) => p.documents.filter((d) => d.status === "Verified").length;
export type ClaimState = "Shared with insurer" | "Ready to share" | "In verification";
export const claimState = (p: Patient): ClaimState => (p.sharedAt ? "Shared with insurer" : p.documents.length > 0 && verifiedCount(p) === p.documents.length ? "Ready to share" : "In verification");
export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
