import PortalShell, { type ShellNote } from "@/components/portal/PortalShell";

const NOTES: ShellNote[] = [
  { id: "a", text: "Claim CLM-1038 needs a diagnostic report", time: "2h ago", href: "/patient/claims/CLM-1038" },
  { id: "b", text: "Accidental Death Benefit renews in 80 days", time: "Yesterday", href: "/patient/policies/accidental-death-benefit" },
  { id: "c", text: "Claim CLM-1042 was approved for ₹43,200", time: "28 Aug", href: "/patient/claims/CLM-1042" },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell portal="patient" notes={NOTES} subtitle="Member · IC-7842" email="priya.sharma@example.com" searchHint="Search policies, claims…">
      {children}
    </PortalShell>
  );
}
