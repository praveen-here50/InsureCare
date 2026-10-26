import PageHeader from "@/components/PageHeader";
import ClaimsTable from "../ClaimsTable";
import { NET_HOSPITALS, claimViews } from "../data";

export default function ClaimsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <PageHeader title="Claims" />
      <ClaimsTable claims={claimViews()} hospitals={NET_HOSPITALS.map((h) => ({ id: h.id, name: h.name }))} />
    </div>
  );
}
