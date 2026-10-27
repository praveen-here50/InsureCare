// Member claim types and helpers. Claims are loaded with getPortal() from ../portal.
import type { Tone } from "@/components/portal/ui";

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
  claimed: number;
  approved?: number;
  status: ClaimStatus;
  updated: string;
  explanation: string;
  documents: ClaimDocument[];
  timeline: ClaimTimelineItem[];
};

export function getClaim(claims: Claim[], id: string) {
  return claims.find((claim) => claim.id.toLowerCase() === id.toLowerCase());
}

/** Plain-language status label shown to members. */
export const statusLabel: Record<ClaimStatus, string> = {
  Submitted: "Submitted",
  "Under Review": "Under review",
  "Additional Documents Required": "Action needed",
  Approved: "Approved",
  Settled: "Settled",
  Rejected: "Rejected",
};

export const statusTone: Record<ClaimStatus, Tone> = {
  Submitted: "sky",
  "Under Review": "sky",
  "Additional Documents Required": "amber",
  Approved: "green",
  Settled: "green",
  Rejected: "rose",
};

/** Timeline steps as tracker stages. */
export const claimStages = (claim: Claim) => claim.timeline.map((t) => ({ label: t.label, completed: t.completed, current: t.current }));

export const needsAction = (claim: Claim) => claim.status === "Additional Documents Required";

export const isOpenClaim = (claim: Claim) => !["Settled", "Rejected"].includes(claim.status);
