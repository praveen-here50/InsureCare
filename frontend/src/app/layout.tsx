import type { Metadata } from "next";
import { Noto_Sans_Tamil, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted by Next.js at build time. Exposed as a CSS variable so only the pages
// that opt in with the `font-display` class use it.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
// Tamil letters for the patient portal in Tamil; Jakarta has none, so the browser takes them from here.
const tamil = Noto_Sans_Tamil({ subsets: ["tamil"], variable: "--font-tamil", display: "swap" });

export const metadata: Metadata = {
  title: { default: "InsureCare | Health cover, made easier", template: "%s | InsureCare" },
  description: "Manage health policies, claims, documents and nearby hospitals in one clear place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${jakarta.variable} ${tamil.variable}`}><body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body></html>;
}
