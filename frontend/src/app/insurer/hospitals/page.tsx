import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import StaticTable from "@/components/StaticTable";
import { inr } from "../../hospital/data";
import { isOpen } from "../data";
import { getInsurerData } from "../server";

export default async function HospitalsPage() {
  const { CLAIMS, HOLDERS, NET_HOSPITALS, claimsAt } = await getInsurerData();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Network hospitals" />
      <Card className="overflow-hidden">
        <StaticTable rows={NET_HOSPITALS} rowKey={(h) => h.id} href={(h) => `/insurer/hospitals/${h.id}`} columns={[
          { label: "Hospital", render: (h) => <><span className="block font-medium text-slate-900">{h.name}</span><span className="text-xs text-slate-500">{h.speciality} · {h.city}</span></> },
          { label: "Admitted", render: (h) => <span className="text-slate-700">{HOLDERS.filter((x) => x.admission?.hospitalId === h.id).length}</span> },
          { label: "Open claims", render: (h) => <span className="text-slate-700">{claimsAt(h.id).filter(isOpen).length}</span> },
          { label: "Total claimed", align: "right", render: (h) => <span className="font-medium text-slate-900">{inr(CLAIMS.filter((c) => c.hospitalId === h.id).reduce((n, c) => n + c.claimed, 0))}</span> },
          { label: "Avg. turnaround", align: "right", render: (h) => <span className="text-slate-600">{h.avgTat} days</span> },
        ]} />
      </Card>
    </div>
  );
}
