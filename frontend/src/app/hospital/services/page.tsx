import { FiCheck, FiCornerUpRight } from "react-icons/fi";
import { PageIntro, Pill, SectionHeading, Surface } from "@/components/portal/ui";
import { getHospitalDesk } from "../data";

export default async function ServicesPage() {
  const { SERVICES } = await getHospitalDesk();
  const here = SERVICES.filter((s) => s.available);
  const referred = SERVICES.filter((s) => !s.available);
  return (
    <div className="flex flex-col gap-6">
      <PageIntro eyebrow="Services" title="Treatments and services" description={`${here.length} services available here. ${referred.length} are referred to partner hospitals.`} />

      <section>
        <SectionHeading title="Available at this hospital" />
        <Surface className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0">
          {here.map((s, i) => (
            <div key={s.name} className={`flex items-start gap-3 px-5 py-4 ${i >= 2 ? "md:border-t md:border-slate-100" : ""} ${i % 2 === 1 ? "md:border-l md:border-slate-100" : ""}`}>
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-care-50 text-care-600"><FiCheck className="size-3" /></span>
              <div><p className="text-sm font-bold text-ink">{s.name}</p><p className="mt-0.5 text-xs text-slate-500">{s.note}</p></div>
            </div>
          ))}
        </Surface>
      </section>

      <section>
        <SectionHeading title="Referred to partner hospitals" />
        <Surface className="divide-y divide-slate-100">
          {referred.map((s) => (
            <div key={s.name} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex-1"><p className="text-sm font-bold text-ink">{s.name}</p><p className="mt-0.5 text-xs text-slate-500">{s.note}</p></div>
              <Pill className="self-start sm:self-auto"><FiCornerUpRight className="size-3" />{s.referTo}</Pill>
            </div>
          ))}
        </Surface>
      </section>
    </div>
  );
}
