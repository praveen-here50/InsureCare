import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertCircle, FiArrowLeft, FiCheck, FiClock, FiExternalLink, FiMap, FiMapPin, FiPhone, FiShield } from "react-icons/fi";
import Photo from "@/components/Photo";
import { buttonClass, Field, Pill, Surface } from "@/components/portal/ui";
import { getT } from "@/lib/i18n-server";
import { getPortal } from "../../portal";
import { getHospital, mapsUrl } from "../data";


export default async function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { hospitals } = await getPortal();
  const hospital = getHospital(hospitals, id);
  if (!hospital) notFound();
  const network = hospital.network === "Network";
  const t = await getT();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/patient/hospitals" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-care-700"><FiArrowLeft />{t("All hospitals")}</Link>

      <section className="relative overflow-hidden rounded-[28px] shadow-lift">
        <div className="relative h-[300px] sm:h-[360px]">
          <Photo src={hospital.image} alt={hospital.name} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 text-white sm:p-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-care-800">{network ? t("Cashless network") : t("Non-network")}</span>
              {hospital.emergency && <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/30">{t("24/7 emergency")}</span>}
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">★ {hospital.rating}</span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{hospital.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-white/80"><FiMapPin />{hospital.address}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <a href={mapsUrl(hospital)} target="_blank" rel="noopener noreferrer" className={buttonClass("white")}><FiMap />{t("Get directions")}</a>
            <a href={`tel:${hospital.phone.replace(/\s/g, "")}`} className={buttonClass("secondary", "border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20")}><FiPhone />{t("Call")}</a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <Surface className="p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">{t("About this hospital")}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{t(hospital.description)}</p>
            <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <Field label={t("Distance")}>{hospital.distance}</Field>
              <Field label={t("Emergency")}>{hospital.emergency ? t("Available 24/7") : t("Not available")}</Field>
              <Field label={t("Hours")}>{t(hospital.hours)}</Field>
            </div>
          </Surface>

          <Surface className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-7">
            {[{ title: t("Specialities"), items: hospital.specialties }, { title: t("Services"), items: hospital.services }].map((group) => (
              <div key={group.title}>
                <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.items.map((item) => <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700"><span className="flex size-5 items-center justify-center rounded-full bg-care-50 text-care-600"><FiCheck className="size-3" /></span>{t(item)}</li>)}
                </ul>
              </div>
            ))}
          </Surface>

          <div className="flex gap-3 rounded-2xl border border-care-200 bg-care-50/60 p-5">
            <FiAlertCircle className="mt-0.5 shrink-0 text-care-700" aria-hidden="true" />
            <div><h2 className="text-sm font-semibold text-slate-900">{t("Confirm before admission")}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{t("Check network status and cashless eligibility with the hospital and your insurer before a planned admission.")}</p></div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <Surface className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><FiShield className="text-care-600" />{t("Your coverage here")}</h2>
            <dl className="mt-4 flex flex-col divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-3"><dt className="text-slate-500">{t("Network status")}</dt><dd><Pill tone={network ? "green" : "slate"}>{t(hospital.network)}</Pill></dd></div>
              <div className="flex items-center justify-between py-3"><dt className="text-slate-500">{t("Cashless")}</dt><dd><Pill tone={hospital.cashless ? "green" : "slate"}>{hospital.cashless ? t("Available") : t("Not listed")}</Pill></dd></div>
              <div className="flex items-center justify-between py-3"><dt className="text-slate-500">{t("Schemes accepted")}</dt><dd className="font-semibold text-slate-900">{hospital.schemes.length}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">{hospital.schemes.map((s) => <Pill key={s} tone="sky">{s}</Pill>)}</div>
          </Surface>

          <Surface className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">{t("Contact and hours")}</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm font-medium text-slate-700">
              <a href={`tel:${hospital.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-care-700"><FiPhone className="text-care-500" />{hospital.phone}</a>
              <p className="flex items-center gap-2.5"><FiClock className="text-care-500" />{t(hospital.hours)}</p>
              <p className="flex items-center gap-2.5"><FiMapPin className="text-care-500" />{hospital.locality}</p>
            </div>
            <a href={mapsUrl(hospital)} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary", "mt-5 w-full")}><FiMap className="text-care-600" />{t("Open in Google Maps")}<FiExternalLink className="size-3.5 text-slate-400" /></a>
          </Surface>
        </aside>
      </div>
    </div>
  );
}
