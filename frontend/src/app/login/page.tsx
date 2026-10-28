import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LanguageProvider } from "@/components/portal/LanguageContext";
import { getLang } from "@/lib/i18n-server";
import { getSession, homeOf } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · InsureCare" };

/** Only paths on this site, so a link can't send someone elsewhere after signing in. */
function safeNext(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login") ? value : undefined;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const session = await getSession();
  if (session) redirect(homeOf(session.portal));
  const { next } = await searchParams;
  return <LanguageProvider lang={await getLang()}><LoginForm next={safeNext(next)} /></LanguageProvider>;
}
