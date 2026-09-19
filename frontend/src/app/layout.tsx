import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsureCare",
  description: "Rural and affordable healthcare & health-insurance platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}