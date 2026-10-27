'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiBell, FiChevronRight, FiFileText, FiGlobe, FiHelpCircle, FiLock, FiLogOut, FiMonitor, FiUser } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { cn } from '@/lib/cn';
import { Field, IconBadge, PageIntro, Pill, Surface } from '@/components/portal/ui';

const LANGUAGES = [{ value: 'english', label: 'English' }, { value: 'tamil', label: 'தமிழ்', hint: 'Tamil' }, { value: 'hindi', label: 'हिन्दी', hint: 'Hindi' }];
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
  return (
    <Surface>
      <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <IconBadge icon={icon} />
        <div><h2 className="font-bold text-ink">{title}</h2><p className="text-sm text-slate-500">{description}</p></div>
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
    <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={cn('rounded-xl px-3 py-2.5 font-semibold transition', o.preview ?? 'text-sm', value === o.value ? 'bg-white text-ink shadow-soft' : 'text-slate-500 hover:text-ink')}>
          {o.label}{o.hint && <span className="block text-[11px] font-medium text-slate-400">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [language, setLanguage] = useState('english');
  const [textSize, setTextSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({ policyReminders: true, claimUpdates: true, documentUpdates: true, hospitalAlerts: true, schemeUpdates: false });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageIntro eyebrow="Settings" title="Your account and preferences" description="Manage your profile, language, notifications and privacy." />
      <p className="rounded-xl bg-care-50 px-4 py-3 text-sm text-care-800">Preview: these preferences are not saved yet. They will be stored with your account once the backend is connected.</p>

      <Surface className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-care-700 text-xl font-extrabold text-white">PS</span>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">Priya Sharma</Field>
          <Field label="Member ID"><span className="font-mono">IC-7842</span></Field>
          <Field label="Email">priya.sharma@example.com</Field>
          <Field label="Phone">+91 98765 43210</Field>
        </div>
        <Pill tone="green" dot className="self-start">KYC verified</Pill>
      </Surface>

      <Section icon={FiGlobe} title="Language and display" description="Choose how InsureCare looks and reads">
        <div className="flex flex-col gap-6">
          <div><p className="mb-2 text-sm font-semibold text-slate-700">Preferred language</p><Segmented label="Preferred language" value={language} options={LANGUAGES} onChange={setLanguage} /></div>
          <div><p className="mb-2 text-sm font-semibold text-slate-700">Text size</p><Segmented label="Text size" value={textSize} options={TEXT_SIZES} onChange={setTextSize} /></div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3"><FiMonitor className="text-slate-400" /><div><p className="text-sm font-semibold text-ink">Reduce motion</p><p className="text-xs text-slate-500">Minimise animations and transitions</p></div></div>
            <Toggle label="Reduce motion" checked={reducedMotion} onChange={() => setReducedMotion((v) => !v)} />
          </div>
        </div>
      </Section>

      <Section icon={FiBell} title="Notifications" description="Choose which updates you receive">
        <ul className="flex flex-col divide-y divide-slate-100">
          {NOTIFICATIONS.map((n) => (
            <li key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
              <div><p className="text-sm font-semibold text-ink">{n.label}</p><p className="text-xs text-slate-500">{n.description}</p></div>
              <Toggle label={n.label} checked={notifications[n.key]} onChange={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))} />
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={FiLock} title="Privacy and security" description="Control your data and sessions">
        <ul className="flex flex-col gap-2">
          {[{ icon: FiFileText, label: 'Document privacy', description: 'Who can see the documents in your vault' }, { icon: FiUser, label: 'Data usage', description: 'How support conversations use your data' }, { icon: FiLock, label: 'Sessions and login history', description: 'Devices signed in to your account' }].map((item) => (
            <li key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <item.icon className="shrink-0 text-slate-400" />
              <div className="flex-1"><p className="text-sm font-semibold text-ink">{item.label}</p><p className="text-xs text-slate-500">{item.description}</p></div>
              <Pill>Coming soon</Pill>
            </li>
          ))}
        </ul>
      </Section>

      <Surface className="flex flex-col gap-2 p-3">
        <Link href="/patient/assistant" className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"><FiHelpCircle className="text-slate-400" /><span className="flex-1 text-sm font-semibold text-ink">Help and support</span><FiChevronRight className="text-slate-300" /></Link>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-rose-700 transition hover:bg-rose-50"><FiLogOut /><span className="flex-1 text-sm font-semibold">Sign out</span><FiChevronRight className="text-rose-300" /></Link>
      </Surface>
    </div>
  );
}
