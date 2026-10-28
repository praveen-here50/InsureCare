import Link from "next/link";
import { FiActivity, FiArrowRight, FiCheck, FiCheckCircle, FiClock, FiFileText, FiMapPin, FiMessageCircle, FiPhoneCall, FiShield } from "react-icons/fi";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";
import Logo from "@/components/portal/Logo";
import { buttonClass, Pill } from "@/components/portal/ui";

// Placeholder marketing figures for the demo. Replace with verified numbers before launch.
const STATS = [
  { icon: FiActivity, value: "₹1,200 Cr+", label: "Claims settled", note: "Across the network, this year" },
  { icon: FiMapPin, value: "1,400+", label: "Network hospitals", note: "Cashless in 640+ cities" },
  { icon: FiCheckCircle, value: "98.4%", label: "Settlement ratio", note: "Cashless + reimbursement" },
  { icon: FiClock, value: "18 min", label: "Median approval time", note: "For cashless pre-authorisation" },
];

const SERVICES = [
  { tag: "Policies & benefits", title: "Know exactly what you're covered for", text: "Cover amounts, members, waiting periods and renewals, explained in plain words.", href: "/patient/policies", image: IMG.family, alt: "A father smiling with his two young children", position: "center 30%" },
  { tag: "Claims tracking", title: "Follow every claim, step by step", text: "See what's done, what's next and exactly which document is still needed.", href: "/patient/claims", image: IMG.bedside, alt: "A doctor speaking with a smiling patient in a hospital bed", position: "center 35%" },
  { tag: "Hospital network", title: "Find cashless care close to home", text: "Search hospitals by speciality, distance, emergency care and scheme support.", href: "/patient/hospitals", image: IMG.building, alt: "Exterior of a modern hospital building", position: "center 60%" },
];

const STEPS = [
  { icon: FiShield, title: "Check your cover", text: "Open any policy to see your limits, members and what's excluded before treatment." },
  { icon: FiMapPin, title: "Visit a network hospital", text: "Pick a cashless hospital near you so you pay less, or nothing, at the counter." },
  { icon: FiFileText, title: "Track to settlement", text: "Upload documents from your phone and watch your claim move to approval." },
];

const NAV = [{ label: "Plans", href: "#services" }, { label: "How it works", href: "#how" }, { label: "Hospitals", href: "/patient/hospitals" }, { label: "Support", href: "#support" }];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-display text-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="InsureCare home"><Logo tagline="Member portal" /></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-9 text-[15px] font-medium text-slate-600 md:flex">
            {NAV.map((n) => <Link key={n.label} href={n.href} className="transition hover:text-ink">{n.label}</Link>)}
          </nav>
          <Link href="/patient" className={buttonClass("primary", "h-11 px-5")}>
            <span className="hidden sm:inline">Go to my dashboard</span><span className="sm:hidden">Log in</span><FiArrowRight />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-14 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-20 lg:pt-14">
          <div className="max-w-xl animate-fade-up">
            <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[4.1rem]">
              Your family&apos;s health cover, <span className="text-care-600">finally clear.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
              See every policy, track claims step by step and find cashless hospitals near you. One simple place, built for the moments that matter.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/patient" className={buttonClass("primary", "h-[52px] px-6 text-[15px]")}>Go to my dashboard <FiArrowRight /></Link>
              <Link href="/patient/hospitals" className={buttonClass("secondary", "h-[52px] px-6 text-[15px]")}><FiMapPin />Find a cashless hospital</Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              {["Live claim tracking", "Documents in one place", "24/7 support line"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-care-50 text-care-600"><FiCheck className="size-3" /></span>{t}</li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[540px] animate-fade-in lg:mx-0 lg:ml-auto">
            {/* The two services together: a doctor and an InsureCare advisor */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] bg-slate-100 shadow-lift">
              <Photo src="/images/hero-doctor-insurer.jpg" alt="A smiling doctor in a white coat beside a smiling InsureCare advisor in a suit, both with arms crossed" position="center 20%" className="absolute inset-0" />
            </div>
            {/* Floating cover card */}
            <div className="absolute -bottom-10 -left-4 w-[260px] rounded-2xl border border-white/60 bg-white/95 p-4 shadow-lift backdrop-blur sm:-left-10 sm:w-[290px] sm:p-5">
              <div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Your cover</p><Pill tone="green">Active</Pill></div>
              <p className="mt-2 text-[1.75rem] font-extrabold tracking-[-0.03em]">₹15,00,000</p>
              <p className="text-sm text-slate-500">Family Health Shield Plus · 4 members</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[97%] rounded-full bg-care-500" /></div>
              <p className="mt-1.5 text-xs text-slate-400">97% of cover remaining</p>
            </div>
            {/* Floating claim toast */}
            <div className="absolute -bottom-6 -right-2 hidden items-center gap-3 rounded-2xl border border-white/60 bg-white/95 p-3 pr-4 shadow-lift backdrop-blur sm:flex sm:-right-8">
              <span className="flex size-10 items-center justify-center rounded-xl bg-care-600 text-white"><FiCheck className="size-5" /></span>
              <span><span className="block text-sm font-bold">Claim approved</span><span className="block text-xs text-slate-500">CLM-1042 · ₹43,200</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section aria-label="InsureCare in numbers" className="border-y border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label, note }, i) => (
            <div key={label} className={`px-5 py-9 sm:px-8 lg:py-12 ${i % 2 === 1 ? "border-l border-slate-200/80" : ""} ${i >= 2 ? "border-t border-slate-200/80 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <Icon className="size-5 text-care-600" />
              <p className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-[2.75rem] sm:leading-none">{value}</p>
              <p className="mt-3 text-[15px] font-semibold text-slate-800">{label}</p>
              <p className="mt-1 text-sm text-slate-400">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 bg-[#F5F8FC]">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">Three things every family needs. One place to do them.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Photo src={s.image} alt={s.alt} position={s.position} className="absolute inset-0 transition duration-700 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] font-bold text-care-800 shadow-sm">{s.tag}</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-7 text-slate-500">{s.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-care-600">Explore <FiArrowRight className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">From check-up to settlement, without the chasing.</h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-slate-500">No more calling three offices to find out where a claim is. Every step shows up in your dashboard the moment it happens.</p>
            </div>
            <ol className="grid grid-cols-1 gap-4">
              {STEPS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-care-50 text-care-600">
                    <Icon className="size-6" />
                  </span>
                  <div><h3 className="text-lg font-bold">{title}</h3><p className="mt-1 text-[15px] leading-7 text-slate-500">{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Assistant / support */}
      <section id="support" className="scroll-mt-20 bg-[#F5F8FC]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-20">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[32px]"><Photo src={IMG.checkup} alt="A nurse checking a patient's blood pressure" position="center 40%" className="absolute inset-0" /></div>
            <div className="absolute -bottom-6 right-4 max-w-[320px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lift sm:right-8">
              <div className="flex justify-end"><p className="rounded-2xl rounded-tr-md bg-care-600 px-4 py-2.5 text-sm text-white">Is cataract surgery covered?</p></div>
              <div className="mt-3 flex gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">IC</span>
                <p className="rounded-2xl rounded-tl-md bg-slate-100 px-4 py-2.5 text-sm leading-6 text-slate-700">Yes, it&apos;s listed under hospitalisation benefits. A waiting period may apply.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] sm:text-5xl">Questions about your cover? Just ask.</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-500">Ask InsureCare about benefits, documents or claim status in everyday words, with answers based on your own policy documents.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/patient/assistant" className={buttonClass("primary", "h-[52px] px-6 text-[15px]")}><FiMessageCircle />Ask InsureCare</Link>
              <a href="tel:1800000000" className={buttonClass("secondary", "h-[52px] px-6 text-[15px]")}><FiPhoneCall />1800-000-000</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-care-800 px-6 py-12 text-white sm:px-12 sm:py-14">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-[2.6rem]">Your family&apos;s cover, always in your pocket.</h2>
              <p className="mt-4 text-lg text-white/80">Log in to see your policies, claims and nearby hospitals in under a minute.</p>
            </div>
            <Link href="/patient" className={buttonClass("white", "h-14 shrink-0 px-7 text-base")}>Open my dashboard <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div><Logo /><p className="mt-3 text-sm text-slate-400">© 2026 InsureCare. Care that stays with you.</p></div>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-sm font-medium text-slate-500">
            <Link href="/patient/policies" className="hover:text-ink">Policies</Link>
            <Link href="/patient/claims" className="hover:text-ink">Claims</Link>
            <Link href="/hospital" className="hover:text-ink">Hospital workspace</Link>
            <Link href="/insurer" className="hover:text-ink">Insurer workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
