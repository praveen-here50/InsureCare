import PortalShell from "@/components/portal/PortalShell";
import { requireSession } from "@/lib/session";
import { hospitalNotes } from "./notes";
import { getHospitalDesk } from "./server";

export default async function HospitalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("hospital");
  const { PATIENTS, WARDS } = await getHospitalDesk();
  return (
    <PortalShell portal="hospital" session={session} notes={hospitalNotes(PATIENTS, WARDS)} subtitle={`Admissions desk · ${session.hospitalName}`} searchHint="Search patients, member IDs…">
      {children}
    </PortalShell>
  );
}
