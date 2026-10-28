import PortalShell, { type ShellNote } from "@/components/portal/PortalShell";
import { requireSession } from "@/lib/session";

const NOTES: ShellNote[] = [
  { id: "a", text: "Meera Joshi admitted to ER-02. Documents pending", time: "12m ago", href: "/hospital/patients/ic-4471" },
  { id: "b", text: "Lakshmi Devi’s documents are verified and ready to send", time: "1h ago", href: "/hospital/claims" },
  { id: "c", text: "ICU has 2 beds left", time: "3h ago", href: "/hospital/beds" },
];

export default async function HospitalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("hospital");
  return (
    <PortalShell portal="hospital" session={session} notes={NOTES} subtitle={`Admissions desk · ${session.hospitalName}`} searchHint="Search patients, member IDs…">
      {children}
    </PortalShell>
  );
}
