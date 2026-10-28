"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FiActivity, FiArrowRight, FiBriefcase, FiChevronsLeft, FiChevronsRight, FiEye, FiEyeOff, FiLoader, FiLock, FiMapPin, FiShield, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";
import Photo from "@/components/Photo";
import Logo from "@/components/portal/Logo";
import { buttonClass } from "@/components/portal/ui";
import { ApiError, send } from "@/lib/api";
import { cn } from "@/lib/cn";
import { IMG } from "@/lib/images";
import { homeOf, type Session } from "@/lib/session-types";
import { useLang, useSetLang, useT } from "@/components/portal/LanguageContext";

// Demo accounts created by the backend when it runs with demo data (SEED_DATA). Hide them once real accounts exist.
const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "false";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "insurecare";
const DEMO: Array<{ icon: IconType; who: string; role: string; username: string }> = [
  { icon: FiUser, who: "Priya Raman", role: "Patient", username: "IC-7842" },
  { icon: FiActivity, who: "Rukmini Rajan", role: "Hospital desk, Adyar Community", username: "rukmini.rajan@adyarcommunity.example" },
  { icon: FiBriefcase, who: "Arun Prakash", role: "Claims officer, CarePlus", username: "arun.prakash@careplus.example" },
];

const REASONS: Array<{ icon: IconType; title: string; text: string }> = [
  { icon: FiShield, title: "Know your cover", text: "Policies, limits and waiting periods in plain words." },
  { icon: FiActivity, title: "Follow every claim", text: "See each step, and exactly which document is still needed." },
  { icon: FiMapPin, title: "Cashless care nearby", text: "Network hospitals across Chennai, with directions." },
];

// Remembers on this device whether the blue side panel was closed.
const PANEL_KEY = "ic-login-panel-closed";

const fieldClass = "h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-care-400 focus:ring-4 focus:ring-care-100";

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
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => { try { if (localStorage.getItem(PANEL_KEY) === "1") setPanelOpen(false); } catch {} }, []);
  const togglePanel = (open: boolean) => { setPanelOpen(open); try { localStorage.setItem(PANEL_KEY, open ? "0" : "1"); } catch {} };

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
    <div className="flex min-h-screen bg-white font-display text-slate-900">
      {/* Brand panel (wide screens). It slides closed; its content keeps its width so nothing reflows while it moves. */}
      <aside aria-hidden={!panelOpen} style={{ width: panelOpen ? "min(46vw, 680px)" : 0 }} className="relative hidden shrink-0 overflow-hidden bg-care-900 text-white transition-[width] duration-300 ease-out lg:block">
        <Photo src={IMG.lobby} alt="" className="absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-care-900 via-care-900/90 to-care-700/80" />
        <div className="relative flex h-full min-h-screen w-[min(46vw,680px)] flex-col justify-between p-10 xl:px-14">

        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label={t("InsureCare home")} tabIndex={panelOpen ? undefined : -1} className="w-fit"><Logo inverted /></Link>
          <button type="button" onClick={() => togglePanel(false)} tabIndex={panelOpen ? undefined : -1} aria-label={t("Hide side panel")} title={t("Hide side panel")}
            className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 transition hover:bg-white/20 hover:text-white"><FiChevronsLeft /></button>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight">{t("Your family’s health cover, all in one place.")}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/75">{t("Sign in to see your policies, track claims and keep your medical documents ready.")}</p>
          <ul className="mt-9 flex flex-col gap-5">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15"><Icon className="size-[18px]" /></span>
                <span><span className="block font-semibold">{t(title)}</span><span className="mt-0.5 block text-sm leading-6 text-white/70">{t(text)}</span></span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/60"><FiLock className="shrink-0" />{t("Your health records are shown only to you, your hospital and your insurer.")}</p>
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-1 flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className={cn("flex items-center gap-3", panelOpen && "lg:invisible")}>
            <button type="button" onClick={() => togglePanel(true)} aria-label={t("Show side panel")} title={t("Show side panel")}
              className="hidden size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:flex"><FiChevronsRight /></button>
            <Link href="/" aria-label={t("InsureCare home")}><Logo /></Link>
          </div>
          <div role="radiogroup" aria-label={t("Language")} className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            {([["en", "English"], ["ta", "தமிழ்"]] as const).map(([value, label]) => (
              <button key={value} type="button" role="radio" aria-checked={lang === value} onClick={() => setLang(value)} className={cn("rounded-lg px-3 py-1.5 transition", lang === value ? "bg-white text-slate-900 shadow-soft" : "text-slate-500 hover:text-slate-900")}>{label}</button>
            ))}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-4">
          <h1 className="text-[1.75rem] font-bold tracking-tight">{t("Welcome back")}</h1>
          <p className="mt-2 text-[15px] leading-6 text-slate-500">{t("Patients use their member ID. Hospital and insurer staff use their work email.")}</p>

          <form onSubmit={signIn} className="mt-7 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700">{t("Member ID or work email")}</span>
              <span className="relative">
                <FiUser aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required
                  placeholder={t("IC-7842 or name@hospital.example")} className={cn(fieldClass, "pr-3.5")} />
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-slate-700">{t("Password")}</span>
              <span className="relative">
                <FiLock aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} autoComplete="current-password" required className={cn(fieldClass, "pr-12")} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("Hide password") : t("Show password")} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-900">
                  {show ? <FiEyeOff /> : <FiEye />}
                </button>
              </span>
            </label>

            {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">{error}</p>}

            <button type="submit" disabled={busy || !username.trim() || !password} className={buttonClass("primary", "h-12 text-[15px]")}>
              {busy ? <><FiLoader className="animate-spin" />{t("Signing in…")}</> : <>{t("Sign in")}<FiArrowRight /></>}
            </button>
          </form>

          {SHOW_DEMO && (
            <section className="mt-7">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" />{t("Or try a demo account")}<span className="h-px flex-1 bg-slate-200" /></div>
              <div className="mt-4 flex flex-col gap-2">
                {DEMO.map(({ icon: Icon, who, role, username: demoUser }) => (
                  <button key={demoUser} type="button" onClick={() => { setUsername(demoUser); setPassword(DEMO_PASSWORD); setError(null); }}
                    className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition hover:border-care-200 hover:bg-care-50", username === demoUser ? "border-care-300 bg-care-50" : "border-slate-200")}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-care-50 text-care-600"><Icon className="size-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{who}</span><span className="block truncate text-xs text-slate-500">{t(role)}</span></span>
                    <span className="text-xs font-medium text-care-700">{t("Use")}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 lg:hidden">{t("Your health records are shown only to you, your hospital and your insurer.")}</p>
      </main>
    </div>
  );
}
