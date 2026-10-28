import PortalShell from "@/components/portal/PortalShell";
import { LanguageProvider } from "@/components/portal/LanguageContext";
import { getLang } from "@/lib/i18n-server";
import { requireSession } from "@/lib/session";
import { patientNotes } from "./notes";
import { getPortal } from "./portal";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("patient");
  const [lang, { claims, policies }] = await Promise.all([getLang(), getPortal()]);
  return (
    <LanguageProvider lang={lang}>
      <PortalShell portal="patient" session={session} notes={patientNotes(claims, policies)} subtitle={`Member · ${session.memberId}`} searchHint="Search policies, claims…">
        {children}
      </PortalShell>
    </LanguageProvider>
  );
}
