import { HOSPITAL_PORTAL, INSURER_PORTAL, PATIENT_PORTAL, type Portal } from "@/lib/portals";
import { api } from "@/lib/api";
import type { Workspace } from "@/app/hospital/data";
import { insurerData, type Snapshot } from "@/app/insurer/data";

export type PaletteEntry = { group: string; title: string; sub?: string; href: string; keywords: string };

export function pageEntries(portal: Portal): PaletteEntry[] {
  return [...portal.nav, ...(portal.footer ? [portal.footer] : [])].map((n) => ({ group: "Pages", title: n.label, href: n.href, keywords: n.label.toLowerCase() }));
}

/** Pages plus searchable records, read from the backend when the palette opens. `hospitalId` is the signed-in desk’s. */
export async function paletteEntries(portal: Portal, hospitalId?: string): Promise<PaletteEntry[]> {
  const pages = pageEntries(portal);
  if (portal.key === "hospital" && hospitalId) {
    const { patients } = await api<Workspace>(`/api/hospitals/${hospitalId}/workspace`);
    return [...pages, ...patients.map((p) => ({ group: "Patients", title: p.name, sub: `${p.memberId}${p.ward ? ` · ${p.ward}` : ""}`, href: `/hospital/patients/${p.id}`, keywords: `${p.name} ${p.memberId} ${p.ward ?? ""} ${p.diagnosis}`.toLowerCase() }))];
  }
  if (portal.key === "insurer") {
    const { CLAIMS, HOLDERS, NET_HOSPITALS, claimViews } = insurerData(await api<Snapshot>("/api/insurer"));
    return [
      ...pages,
      ...HOLDERS.map((h) => ({ group: "Policyholders", title: h.name, sub: `${h.memberId} · ${h.policy.name}`, href: `/insurer/policyholders/${h.id}`, keywords: `${h.name} ${h.memberId} ${h.policy.number} ${h.phone}`.toLowerCase() })),
      ...claimViews(CLAIMS).map((c) => ({ group: "Claims", title: c.id, sub: `${c.diagnosis} · ${c.hospitalName}`, href: `/insurer/claims/${c.id}`, keywords: `${c.id} ${c.memberId} ${c.diagnosis}`.toLowerCase() })),
      ...NET_HOSPITALS.map((h) => ({ group: "Hospitals", title: h.name, sub: h.speciality, href: `/insurer/hospitals/${h.id}`, keywords: `${h.name} ${h.speciality}`.toLowerCase() })),
    ];
  }
  return pages;
}
export { PATIENT_PORTAL, HOSPITAL_PORTAL, INSURER_PORTAL };
