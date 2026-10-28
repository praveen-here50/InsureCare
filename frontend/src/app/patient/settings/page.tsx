'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiBell, FiChevronRight, FiFileText, FiGlobe, FiHelpCircle, FiLock, FiLogOut, FiMonitor, FiUser } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/cn';
import { Field, IconBadge, PageIntro, Pill, Surface } from '@/components/portal/ui';
import { useSession, useSignOut } from '@/components/portal/SessionContext';
import { useLang, useSetLang, useT } from '@/components/portal/LanguageContext';
import type { Lang } from '@/lib/i18n';

// Each language is named in itself, so it can be found whichever one is showing.
const LANGUAGES: { value: Lang; label: string; hint?: string }[] = [{ value: 'en', label: 'English' }, { value: 'ta', label: 'தமிழ்', hint: 'Tamil' }];
const TEXT_SIZES = [{ value: 'small', label: 'Small', preview: 'text-sm' }, { value: 'medium', label: 'Default', preview: 'text-base' }, { value: 'large', label: 'Large', preview: 'text-lg' }];
const NOTIFICATIONS = [
  { key: 'policyReminders', label: 'Policy renewal reminders', description: 'Before any policy is due for renewal' },
  { key: 'claimUpdates', label: 'Claim updates', description: 'Every time a claim changes status' },
  { key: 'documentUpdates', label: 'Document updates', description: 'When a new document is ready or verified' },
  { key: 'hospitalAlerts', label: 'Hospital alerts', description: 'Important announcements from network hospitals' },
  { key: 'schemeUpdates', label: 'Government scheme updates', description: 'New public healthcare schemes you may qualify for' },
] as const;
type NotificationKey = (typeof NOTIFICATIONS)[number]['key'];

function Section({ icon, title, description, children }: { icon: IconType; title: string; description: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <Surface>
      <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <IconBadge icon={icon} />
        <div><h2 className="font-semibold text-slate-900">{t(title)}</h2><p className="text-sm text-slate-500">{t(description)}</p></div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Surface>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-care-600' : 'bg-slate-200')}>
      <span className={cn('absolute left-0 top-0.5 size-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { value: T; label: string; hint?: string; preview?: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("grid gap-2 rounded-2xl bg-slate-100 p-1.5", options.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={cn('rounded-xl px-3 py-2.5 font-semibold transition', o.preview ?? 'text-sm', value === o.value ? 'bg-white text-slate-900 shadow-soft' : 'text-slate-500 hover:text-slate-900')}>
          {o.label}{o.hint && <span className="block text-[11px] font-medium text-slate-400">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const signOut = useSignOut();
  const session = useSession();
  const t = useT();
  const language = useLang();
  const setLanguage = useSetLang();
  const initials = session.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const [textSize, setTextSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({ policyReminders: true, claimUpdates: true, documentUpdates: true, hospitalAlerts: true, schemeUpdates: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageIntro title={t("Your account and preferences")} description={t("Manage your profile, language, notifications and privacy.")} />
      <p className="rounded-xl bg-care-50 px-4 py-3 text-sm text-care-800">{t("Your language is saved on this device. The other preferences are a preview and are not saved yet.")}</p>

      <Surface className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-care-700 text-xl font-semibold text-white">{initials}</span>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("Name")}>{session.name}</Field>
          <Field label={t("Member ID")}><span className="font-mono">{session.memberId}</span></Field>
        </div>
      </Surface>

      <Section icon={FiGlobe} title="Language and display" description="Choose how InsureCare looks and reads">
        <div className="flex flex-col gap-6">
          <div><p className="mb-2 text-sm font-semibold text-slate-700">{t("Preferred language")}</p><Segmented label={t("Preferred language")} value={language} options={LANGUAGES} onChange={setLanguage} /><p className="mt-2 text-xs text-slate-500">{t("The assistant answers in English for now.")}</p></div>
          <div><p className="mb-2 text-sm font-semibold text-slate-700">{t("Text size")}</p><Segmented label={t("Text size")} value={textSize} options={TEXT_SIZES.map((o) => ({ ...o, label: t(o.label) }))} onChange={setTextSize} /></div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3"><FiMonitor className="text-slate-400" /><div><p className="text-sm font-semibold text-slate-900">{t("Reduce motion")}</p><p className="text-xs text-slate-500">{t("Minimise animations and transitions")}</p></div></div>
            <Toggle label={t("Reduce motion")} checked={reducedMotion} onChange={() => setReducedMotion((v) => !v)} />
          </div>
        </div>
      </Section>

      <Section icon={FiBell} title="Notifications" description="Choose which updates you receive">
        <ul className="flex flex-col divide-y divide-slate-100">
          {NOTIFICATIONS.map((n) => (
            <li key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div><p className="text-sm font-semibold text-slate-900">{t(n.label)}</p><p className="text-xs text-slate-500">{t(n.description)}</p></div>
              <Toggle label={t(n.label)} checked={notifications[n.key]} onChange={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))} />
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={FiLock} title="Privacy and security" description="Control your data and sessions">
        <ul className="flex flex-col gap-2">
          {[{ icon: FiFileText, label: 'Document privacy', description: 'Who can see the documents in your vault' }, { icon: FiUser, label: 'Data usage', description: 'How support conversations use your data' }, { icon: FiLock, label: 'Sessions and login history', description: 'Devices signed in to your account' }].map((item) => (
            <li key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <item.icon className="shrink-0 text-slate-400" />
              <div className="flex-1"><p className="text-sm font-semibold text-slate-900">{t(item.label)}</p><p className="text-xs text-slate-500">{t(item.description)}</p></div>
              <Pill>{t("Coming soon")}</Pill>
            </li>
          ))}
        </ul>
      </Section>

      <Surface className="flex flex-col gap-2 p-3">
        <Link href="/patient/assistant" className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"><FiHelpCircle className="text-slate-400" /><span className="flex-1 text-sm font-semibold text-slate-900">{t("Help and support")}</span><FiChevronRight className="text-slate-300" /></Link>
        <button type="button" onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-rose-700 transition hover:bg-rose-50"><FiLogOut /><span className="flex-1 text-sm font-semibold">{t("Sign out")}</span><FiChevronRight className="text-rose-300" /></button>
      </Surface>
    </div>
  );
}
