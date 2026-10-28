// Patient portal data for the signed-in member, served by the backend (GET /api/members/{id}/portal).
import { apiUrl } from "@/lib/api";
import { IMG } from "@/lib/images";
import { requireSession } from "@/lib/session";
import { serverApi } from "@/lib/server-api";
import type { Claim } from "./claims/data";
import type { Document } from "./documents/types";
import type { Hospital } from "./hospitals/data";
import type { Policy, Scheme } from "./policies/data";

type Raw = {
  member: { id: string; memberId: string; name: string; firstName: string };
  claims: Claim[]; policies: Policy[]; schemes: Scheme[];
  hospitals: (Omit<Hospital, "image"> & { image: keyof typeof IMG })[];
  documents: Document[];
};

export async function getPortal() {
  const { memberRef } = await requireSession("patient");
  const p = await serverApi<Raw>(`/api/members/${memberRef}/portal`);
  return {
    ...p,
    hospitals: p.hospitals.map((h): Hospital => ({ ...h, image: IMG[h.image] ?? IMG.building })),
    documents: p.documents.map((d) => ({ ...d, url: d.url && apiUrl(d.url) })),
  };
}
