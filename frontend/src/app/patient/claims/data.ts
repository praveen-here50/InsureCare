export type ClaimStatus = "Submitted" | "Under Review" | "Additional Documents Required" | "Approved" | "Settled" | "Rejected";

export type ClaimDocument = { name: string; status: "Required" | "Received" };
export type ClaimTimelineItem = { label: string; date: string; note: string; completed: boolean; current?: boolean };

export type Claim = {
  id: string;
  type: string;
  provider: string;
  policy: string;
  treatmentDate: string;
  submittedDate: string;
  amountClaimed: string;
  amountApproved?: string;
  status: ClaimStatus;
  updated: string;
  explanation: string;
  documents: ClaimDocument[];
  timeline: ClaimTimelineItem[];
};

export const claims: Claim[] = [
  {
    id: "DEMO-CLM-1042",
    type: "Hospitalization",
    provider: "Riverbend Community Hospital",
    policy: "Family Health Shield Plus · IC-FH-••••-4821",
    treatmentDate: "18 Aug 2026",
    submittedDate: "21 Aug 2026",
    amountClaimed: "₹48,500",
    amountApproved: "₹43,200",
    status: "Approved",
    updated: "28 Aug 2026",
    explanation: "The claim has been approved for the displayed amount. Settlement processing may follow the insurer's normal schedule.",
    documents: [{ name: "Hospital bill", status: "Received" }, { name: "Discharge summary", status: "Received" }, { name: "Prescription", status: "Received" }],
    timeline: [
      { label: "Claim submitted", date: "21 Aug 2026", note: "Claim information was recorded for demo tracking.", completed: true },
      { label: "Documents verified", date: "23 Aug 2026", note: "The submitted documents were marked as received.", completed: true },
      { label: "Insurer review", date: "25 Aug 2026", note: "The claim was assessed against the policy information.", completed: true },
      { label: "Approved", date: "28 Aug 2026", note: "Approved amount: ₹43,200.", completed: true, current: true },
      { label: "Settlement", date: "Pending", note: "Settlement status is not represented by this demo.", completed: false },
    ],
  },
  {
    id: "DEMO-CLM-1038",
    type: "Day-care procedure",
    provider: "Meadowline Diagnostic Centre",
    policy: "Family Health Shield Plus · IC-FH-••••-4821",
    treatmentDate: "04 Sep 2026",
    submittedDate: "06 Sep 2026",
    amountClaimed: "₹12,800",
    status: "Additional Documents Required",
    updated: "09 Sep 2026",
    explanation: "Some documents are needed before review can continue. Uploading them is shown as a UI-only demo action.",
    documents: [{ name: "Hospital bill", status: "Received" }, { name: "Diagnostic report", status: "Required" }, { name: "Prescription", status: "Received" }],
    timeline: [
      { label: "Claim submitted", date: "06 Sep 2026", note: "Claim information was recorded for demo tracking.", completed: true },
      { label: "Documents verified", date: "08 Sep 2026", note: "Initial documents were marked as received.", completed: true },
      { label: "Additional information requested", date: "09 Sep 2026", note: "A diagnostic report is needed to continue review.", completed: true, current: true },
      { label: "Insurer review", date: "Pending", note: "Review can continue after the required document is received.", completed: false },
      { label: "Decision", date: "Pending", note: "No coverage decision is represented by this demo.", completed: false },
    ],
  },
  {
    id: "DEMO-CLM-1027",
    type: "Outpatient consultation",
    provider: "Sunfield Primary Care Clinic",
    policy: "Critical Illness Rider · IC-CI-••••-9037",
    treatmentDate: "11 Jul 2026",
    submittedDate: "13 Jul 2026",
    amountClaimed: "₹3,600",
    amountApproved: "₹3,600",
    status: "Settled",
    updated: "02 Aug 2026",
    explanation: "This demo claim is marked as settled. It does not represent a real payment or transaction.",
    documents: [{ name: "Hospital bill", status: "Received" }, { name: "Prescription", status: "Received" }],
    timeline: [
      { label: "Claim submitted", date: "13 Jul 2026", note: "Claim information was recorded for demo tracking.", completed: true },
      { label: "Documents verified", date: "16 Jul 2026", note: "The submitted documents were marked as received.", completed: true },
      { label: "Approved", date: "21 Jul 2026", note: "Approved amount: ₹3,600.", completed: true },
      { label: "Settled", date: "02 Aug 2026", note: "Marked settled for demonstration only.", completed: true, current: true },
    ],
  },
  {
    id: "DEMO-CLM-1019",
    type: "Pharmacy reimbursement",
    provider: "Greenway Pharmacy Network",
    policy: "Family Health Shield Plus · IC-FH-••••-4821",
    treatmentDate: "22 Jun 2026",
    submittedDate: "24 Jun 2026",
    amountClaimed: "₹2,150",
    status: "Under Review",
    updated: "27 Jun 2026",
    explanation: "The insurer is currently reviewing the submitted information. No outcome is implied by this synthetic status.",
    documents: [{ name: "Pharmacy bill", status: "Received" }, { name: "Prescription", status: "Received" }],
    timeline: [
      { label: "Claim submitted", date: "24 Jun 2026", note: "Claim information was recorded for demo tracking.", completed: true },
      { label: "Documents verified", date: "26 Jun 2026", note: "The submitted documents were marked as received.", completed: true },
      { label: "Insurer review", date: "27 Jun 2026", note: "The claim is currently in review.", completed: true, current: true },
      { label: "Decision", date: "Pending", note: "No decision is represented by this demo.", completed: false },
    ],
  },
];

export function getClaim(id: string) {
  return claims.find((claim) => claim.id.toLowerCase() === id.toLowerCase()) ?? claims[0];
}

export const statusClasses: Record<ClaimStatus, string> = {
  Submitted: "border-sky-200 bg-sky-50 text-sky-800",
  "Under Review": "border-amber-200 bg-amber-50 text-amber-800",
  "Additional Documents Required": "border-orange-200 bg-orange-50 text-orange-800",
  Approved: "border-teal-200 bg-teal-50 text-teal-800",
  Settled: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

export const statusDotClasses: Record<ClaimStatus, string> = {
  Submitted: "bg-sky-500",
  "Under Review": "bg-amber-500",
  "Additional Documents Required": "bg-orange-500",
  Approved: "bg-teal-600",
  Settled: "bg-emerald-600",
  Rejected: "bg-rose-600",
};

void claims;
void getClaim;
void statusClasses;
void statusDotClasses;
