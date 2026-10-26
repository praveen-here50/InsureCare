import Badge from "@/components/Badge";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import StaticTable from "@/components/StaticTable";
import { SERVICES } from "../data";

export default function ServicesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Treatments and services" />
      <Card className="overflow-hidden">
        <StaticTable rows={SERVICES} rowKey={(s) => s.name} columns={[
          { label: "Service", render: (s) => <><span className="block font-medium text-slate-900">{s.name}</span><span className="text-xs text-slate-500">{s.note}</span></> },
          { label: "Availability", render: (s) => <Badge tone={s.available ? "green" : "red"}>{s.available ? "Available here" : "Not available"}</Badge> },
          { label: "Refer to", render: (s) => <span className="text-slate-600">{s.referTo ?? "—"}</span> },
        ]} />
      </Card>
    </div>
  );
}
