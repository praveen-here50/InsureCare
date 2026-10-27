import PortalShell, { type ShellNote } from "@/components/portal/PortalShell";

const NOTES: ShellNote[] = [
  { id: "a", text: "CLM-2046 pre-authorisation received from Apex Neuro Centre", time: "20m ago", href: "/insurer/claims/CLM-2046" },
  { id: "b", text: "CLM-2031 query is waiting on the hospital", time: "2h ago", href: "/insurer/claims/CLM-2031" },
  { id: "c", text: "CLM-2038 is a high-value claim awaiting review", time: "Yesterday", href: "/insurer/claims/CLM-2038" },
];

export default function InsurerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell portal="insurer" notes={NOTES} subtitle="Claims Officer, CarePlus" email="rahul.menon@careplus.example" searchHint="Search claims, policyholders…">
      {children}
    </PortalShell>
  );
}
