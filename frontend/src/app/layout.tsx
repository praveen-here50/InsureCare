import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "InsureCare | Health cover, made easier", template: "%s | InsureCare" },
  description: "Manage health policies, claims, documents and nearby hospitals in one clear place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body></html>;
}
