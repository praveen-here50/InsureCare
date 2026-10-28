import PortalShell, { type ShellNote } from "@/components/portal/PortalShell";
import { LanguageProvider } from "@/components/portal/LanguageContext";
import { getLang } from "@/lib/i18n-server";
import { requireSession } from "@/lib/session";

// Shown in English text; the shell translates each one (locales/ta.json).
const NOTES: ShellNote[] = [
  { id: "a", text: "Claim CLM-1038 needs a diagnostic report", time: "2h ago", href: "/patient/claims/CLM-1038" },
  { id: "b", text: "Accidental Death Benefit renews in 80 days", time: "Yesterday", href: "/patient/policies/accidental-death-benefit" },
  { id: "c", text: "Claim CLM-1042 was approved for ₹43,200", time: "28 Aug", href: "/patient/claims/CLM-1042" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("patient");
  const lang = await getLang();
  return (
    <LanguageProvider lang={lang}>
      <PortalShell portal="patient" session={session} notes={NOTES} subtitle={`Member · ${session.memberId}`} searchHint="Search policies, claims…">
        {children}
      </PortalShell>
    </LanguageProvider>
  );
}
