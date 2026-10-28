"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FiActivity, FiArrowRight, FiBriefcase, FiEye, FiEyeOff, FiLoader, FiLock, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";
import Logo from "@/components/portal/Logo";
import { buttonClass, Surface } from "@/components/portal/ui";
import { ApiError, send } from "@/lib/api";
import { homeOf, type Session } from "@/lib/session-types";
import { cn } from "@/lib/cn";
import { useLang, useSetLang, useT } from "@/components/portal/LanguageContext";

// Demo accounts created by the backend when it runs with demo data (SEED_DATA). Hide them once real accounts exist.
const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "false";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "insurecare";
const DEMO: Array<{ icon: IconType; who: string; role: string; username: string }> = [
  { icon: FiUser, who: "Priya Sharma", role: "Patient", username: "IC-7842" },
  { icon: FiActivity, who: "Anita Rao", role: "Hospital desk, Riverbend", username: "anita.rao@riverbend.example" },
  { icon: FiBriefcase, who: "Rahul Menon", role: "Claims officer, CarePlus", username: "rahul.menon@careplus.example" },
];

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();
  const lang = useLang();
  const setLang = useSetLang();

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const me = (await send<Session>("POST", "/api/auth/login", { username, password }))!;
      // Back to the page that asked for sign-in, if it belongs to this account's portal.
      const home = homeOf(me.portal);
      router.replace(next && (next === home || next.startsWith(`${home}/`)) ? next : home);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? t(e.message) : t("Couldn't reach InsureCare. Please check your connection and try again."));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F8FC] font-display text-ink">
      <header className="mx-auto flex h-[76px] w-full max-w-[1100px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label={t("InsureCare home")}><Logo tagline={t("Sign in")} /></Link>
        <div role="radiogroup" aria-label={t("Language")} className="flex rounded-xl bg-white p-1 text-sm font-semibold shadow-soft ring-1 ring-slate-200">
          {([["en", "English"], ["ta", "தமிழ்"]] as const).map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={lang === value} onClick={() => setLang(value)} className={cn("rounded-lg px-3 py-1.5 transition", lang === value ? "bg-care-600 text-white" : "text-slate-500 hover:text-slate-900")}>{label}</button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1100px] flex-1 items-start gap-6 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:pt-10">
        <Surface className="mx-auto w-full max-w-[460px] p-6 sm:p-8 lg:mx-0 lg:justify-self-end">
          <h1 className="text-2xl font-semibold tracking-tight">{t("Sign in to InsureCare")}</h1>
          <p className="mt-2 text-[15px] leading-6 text-slate-500">{t("Patients use their member ID. Hospital and insurer staff use their work email.")}</p>

          <form onSubmit={signIn} className="mt-7 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700">{t("Member ID or work email")}</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required
                placeholder={t("IC-7842 or name@hospital.example")} className="h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:ring-4 focus:ring-care-100" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700">{t("Password")}</span>
              <span className="relative">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-12 text-[15px] outline-none transition focus:border-care-400 focus:ring-4 focus:ring-care-100" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("Hide password") : t("Show password")} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-ink">
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">{error}</p>}

            <button type="submit" disabled={busy || !username.trim() || !password} className={buttonClass("primary", "mt-1 h-12 text-[15px]")}>
              {busy ? <><FiLoader className="animate-spin" />{t("Signing in…")}</> : <>{t("Sign in")}<FiArrowRight /></>}
            </button>
          </form>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-400"><FiLock className="shrink-0" />{t("Your health records are shown only to you, your hospital and your insurer.")}</p>
        </Surface>

        {SHOW_DEMO && (
          <Surface className="mx-auto w-full max-w-[460px] p-5 lg:mx-0">
            <h2 className="text-sm font-semibold">{t("Demo accounts")}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("Choose one to fill in the form. Password for all:")} <span className="font-mono font-semibold text-slate-700">{DEMO_PASSWORD}</span></p>
            <div className="mt-3 flex flex-col gap-2">
              {DEMO.map(({ icon: Icon, who, role, username: demoUser }) => (
                <button key={demoUser} type="button" onClick={() => { setUsername(demoUser); setPassword(DEMO_PASSWORD); setError(null); }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-left transition hover:border-care-200 hover:bg-care-50">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-care-50 text-care-600"><Icon /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold">{who}</span><span className="block truncate text-xs text-slate-500">{t(role)} · {demoUser}</span></span>
                </button>
              ))}
            </div>
          </Surface>
        )}
      </main>
    </div>
  );
}
