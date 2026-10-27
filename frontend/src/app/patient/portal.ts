// Patient portal data for the signed-in member, served by the backend (GET /api/members/{id}/portal).
import { api, apiUrl } from "@/lib/api";
import { IMG } from "@/lib/images";
import type { Claim } from "./claims/data";
import type { Document } from "./documents/types";
import type { Hospital } from "./hospitals/data";
import type { Policy, Scheme } from "./policies/data";

/** Until sign-in exists, the portal shows this member. */
export const MEMBER_REF = process.env.NEXT_PUBLIC_MEMBER_ID ?? "ic-7842";

type Raw = {
  member: { id: string; memberId: string; name: string; firstName: string };
  claims: Claim[]; policies: Policy[]; schemes: Scheme[];
  hospitals: (Omit<Hospital, "image"> & { image: keyof typeof IMG })[];
  documents: Document[];
};

export async function getPortal() {
  const p = await api<Raw>(`/api/members/${MEMBER_REF}/portal`);
  return {
    ...p,
    hospitals: p.hospitals.map((h): Hospital => ({ ...h, image: IMG[h.image] ?? IMG.building })),
    documents: p.documents.map((d) => ({ ...d, url: d.url && apiUrl(d.url) })),
  };
}
