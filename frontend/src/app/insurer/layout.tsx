import PortalShell from "@/components/portal/PortalShell";
import { requireSession } from "@/lib/session";
import { insurerNotes } from "./notes";
import { getInsurerData } from "./server";

export default async function InsurerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("insurer");
  const { CLAIMS, claimViews } = await getInsurerData();
  return (
    <PortalShell portal="insurer" session={session} notes={insurerNotes(claimViews(CLAIMS))} subtitle="Claims Officer, CarePlus" searchHint="Search claims, policyholders…">
      {children}
    </PortalShell>
  );
}
