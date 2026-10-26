import AppShell from "../patient/_shell";

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
