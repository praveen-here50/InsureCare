import { HOSPITAL_PORTAL, INSURER_PORTAL, PATIENT_PORTAL, type Portal } from "@/lib/portals";
import { PATIENTS } from "@/app/hospital/data";
import { CLAIMS, HOLDERS, NET_HOSPITALS, getHospital } from "@/app/insurer/data";

export type PaletteEntry = { group: string; title: string; sub?: string; href: string; keywords: string };

export function paletteEntries(portal: Portal): PaletteEntry[] {
  const pages = [...portal.nav, ...(portal.footer ? [portal.footer] : [])].map((n) => ({ group: "Pages", title: n.label, href: n.href, keywords: n.label.toLowerCase() }));
  if (portal.key === "hospital") return [...pages, ...PATIENTS.map((p) => ({ group: "Patients", title: p.name, sub: `${p.memberId}${p.ward ? ` · ${p.ward}` : ""}`, href: `/hospital/patients/${p.id}`, keywords: `${p.name} ${p.memberId} ${p.ward ?? ""} ${p.diagnosis}`.toLowerCase() }))];
  if (portal.key === "insurer") return [
    ...pages,
    ...HOLDERS.map((h) => ({ group: "Policyholders", title: h.name, sub: `${h.memberId} · ${h.policy.name}`, href: `/insurer/policyholders/${h.id}`, keywords: `${h.name} ${h.memberId} ${h.policy.number} ${h.phone}`.toLowerCase() })),
    ...CLAIMS.map((c) => ({ group: "Claims", title: c.id, sub: `${c.diagnosis} · ${getHospital(c.hospitalId)?.name}`, href: `/insurer/claims/${c.id}`, keywords: `${c.id} ${c.memberId} ${c.diagnosis}`.toLowerCase() })),
    ...NET_HOSPITALS.map((h) => ({ group: "Hospitals", title: h.name, sub: h.speciality, href: `/insurer/hospitals/${h.id}`, keywords: `${h.name} ${h.speciality}`.toLowerCase() })),
  ];
  return pages;
}
export { PATIENT_PORTAL, HOSPITAL_PORTAL, INSURER_PORTAL };
