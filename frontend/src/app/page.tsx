import Link from "next/link";
import { FiArrowRight, FiCheck, FiChevronRight, FiHeart, FiMapPin, FiShield } from "react-icons/fi";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";

const services = [
  { href: "/patient/policies", icon: FiShield, title: "Health insurance", detail: "Cover that fits your family" },
  { href: "/patient/claims", icon: FiHeart, title: "Claims support", detail: "Clear updates at every step" },
  { href: "/patient/hospitals", icon: FiMapPin, title: "Find care nearby", detail: "Explore your hospital network" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="InsureCare home"><span className="flex size-10 items-center justify-center rounded-xl bg-[#173d70] text-white"><FiHeart className="size-5" /></span><span className="text-lg font-semibold tracking-tight">InsureCare</span></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Main navigation"><a href="#cover" className="transition hover:text-slate-950">Explore cover</a><Link href="/patient/hospitals" className="transition hover:text-slate-950">Hospital network</Link><Link href="/patient/claims" className="transition hover:text-slate-950">Claims support</Link></nav>
        <Link href="/patient" className="inline-flex items-center gap-2 rounded-lg bg-[#173d70] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102f59]">Member login <FiArrowRight /></Link>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-7 sm:px-8 md:grid-cols-[1fr_0.95fr] md:gap-12 md:pb-20 md:pt-12">
        <div className="max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#edf5fa] px-3.5 py-2 text-sm font-medium text-[#285878]"><FiCheck className="size-4" /> Care and cover, together</p>
          <h1 className="text-balance text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-[#142c49] sm:text-5xl lg:text-[58px]">Your health cover, made easier.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">Keep your policies, claims and hospital options in one clear place. Get the support you need, when you need it.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/patient" className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#173d70] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102f59]">Go to my dashboard <FiArrowRight /></Link><Link href="/patient/hospitals" className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Find a hospital</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><FiCheck className="text-emerald-700" /> Policy details at a glance</span><span className="inline-flex items-center gap-2"><FiCheck className="text-emerald-700" /> Claim progress, kept clear</span></div>
        </div>
        <div className="relative min-h-[330px] overflow-hidden rounded-[26px] bg-[#dcecf3] sm:min-h-[420px]"><Photo src={IMG.doctorPatient} alt="Doctor speaking with a patient in a bright clinic" position="center 38%" className="absolute inset-0 [&_img]:object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#102f45]/60 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-7 sm:left-7 sm:right-auto sm:min-w-[290px] sm:p-5"><p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Your cover, in one place</p><div className="mt-2 flex items-end justify-between gap-6"><div><p className="text-2xl font-semibold tracking-tight text-[#142c49]">₹15 lakh</p><p className="mt-1 text-sm text-slate-600">Family Health Shield Plus</p></div><Link href="/patient/policies" aria-label="View your policy" className="mb-1 flex size-10 items-center justify-center rounded-full bg-[#edf5fa] text-[#173d70] transition hover:bg-[#d8eaf3]"><FiChevronRight /></Link></div></div></div>
      </section>

      <section id="cover" className="border-y border-slate-100 bg-[#f8fafb]"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#2b6683]">A simpler way to manage care</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#142c49] sm:text-3xl">Everything you need, close by</h2></div><Link href="/patient" className="hidden items-center gap-1 text-sm font-semibold text-[#173d70] sm:inline-flex">Explore your account <FiChevronRight /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">{services.map(({ href, icon: Icon, title, detail }) => <Link key={href} href={href} className="group flex min-h-36 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5fa] text-[#173d70]"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">{title}</span><span className="mt-1 block text-sm text-slate-500">{detail}</span></span><FiArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#173d70]" /></Link>)}</div>
      </div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><span>© 2026 InsureCare. Care that stays with you.</span><div className="flex gap-5"><Link href="/hospital" className="hover:text-slate-800">Hospital workspace</Link><Link href="/insurer" className="hover:text-slate-800">Insurer workspace</Link></div></footer>
    </main>
  );
}



