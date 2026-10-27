import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiCheck, FiClock, FiFileText, FiMail, FiMapPin, FiPhone, FiShield, FiSlash } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { buttonClass, Field, IconBadge, inr, Pill, Surface } from "@/components/portal/ui";
import { getPortal } from "../../portal";
import { daysUntil, formatDate, getPolicy, policyTone } from "../data";


const SECTION_STYLE: Record<string, { icon: typeof FiCheck; dot: string }> = {
  "Coverage and benefits": { icon: FiCheck, dot: "bg-emerald-500" },
  Exclusions: { icon: FiSlash, dot: "bg-rose-400" },
  "Waiting periods": { icon: FiClock, dot: "bg-amber-400" },
};

export default async function PolicyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { policies } = await getPortal();
  const policy = getPolicy(policies, id);
  if (!policy) notFound();
  const days = daysUntil(policy.validTill);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/patient/policies" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-care-700"><FiArrowLeft />My policies</Link>

      {/* Hero */}
      <section className={cn("relative overflow-hidden rounded-3xl p-6 text-white sm:p-9", policy.face)}>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{policy.kind}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{policy.status}</span>
            </div>
            <h1 className="mt-4 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">{policy.name}</h1>
            <p className="mt-2 text-white/75">{policy.provider} · <span className="font-mono">{policy.number}</span></p>
          </div>
          <div className="lg:text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">Sum insured</p>
            <p className="text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">{inr(policy.coverage)}</p>
          </div>
        </div>
      </section>

      <Surface className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        <Field label="Cover remaining">
          {inr(policy.coverage - policy.used)}
          <span className="mt-0.5 block text-xs font-medium text-slate-400">{inr(policy.used)} used so far</span>
        </Field>
        <Field label="Policy period">{formatDate(policy.validFrom)} – {formatDate(policy.validTill)}</Field>
        <Field label="Renewal"><span className={cn("inline-flex items-center gap-1.5", days < 100 && "text-amber-700")}><FiCalendar />In {days} days</span></Field>
        <Field label="Hospital network">{policy.network}</Field>
      </Surface>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="flex flex-col gap-6">
          {policy.details.map((section) => {
            const style = SECTION_STYLE[section.title] ?? { icon: FiCheck, dot: "bg-care-500" };
            return (
              <Surface key={section.title} className="p-5 sm:p-6">
                <h2 className="flex items-center gap-3 text-lg font-bold text-ink"><IconBadge icon={style.icon} className="size-9" />{section.title}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3.5 text-sm leading-6 text-slate-700">
                      <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", style.dot)} />{item}
                    </li>
                  ))}
                </ul>
              </Surface>
            );
          })}

          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Members covered</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {policy.members.map((m, i) => (
                <li key={m} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{m.split(" ").map((w) => w[0]).join("")}</span>
                  <span><span className="block text-sm font-bold text-ink">{m}</span><span className="text-xs text-slate-400">{i === 0 ? "Primary member" : "Dependant"}</span></span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>

        <aside className="flex flex-col gap-6">
          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Planning treatment?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">For a planned admission, notify your insurer before treatment. For emergencies, notify within the timeline in your policy terms.</p>
            <Link href="/patient/hospitals" className={buttonClass("primary", "mt-5 w-full")}><FiMapPin />Find a network hospital</Link>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-ink">Documents for a claim</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {policy.documents.map((d) => <li key={d} className="flex items-center gap-3 text-sm font-medium text-slate-700"><FiFileText className="text-care-500" />{d}</li>)}
            </ul>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-ink">Renewal</h2><Pill tone={policyTone(policy)} dot>{policy.status}</Pill></div>
            <p className="mt-2 text-sm leading-6 text-slate-500">Renews on <span className="font-semibold text-ink">{formatDate(policy.validTill)}</span>. Review benefits and premium before renewing.</p>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink"><FiShield className="text-care-600" />Insurer support</h2>
            <p className="mt-1 text-sm text-slate-500">24/7 emergency line</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm font-semibold text-slate-700">
              <a href="tel:1800000000" className="flex items-center gap-2 hover:text-care-700"><FiPhone className="text-care-500" />1800-000-000</a>
              <a href="mailto:support@example.com" className="flex items-center gap-2 hover:text-care-700"><FiMail className="text-care-500" />support@example.com</a>
            </div>
          </Surface>
        </aside>
      </div>
    </div>
  );
}
