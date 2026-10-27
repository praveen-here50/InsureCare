import PageHeader from "@/components/PageHeader";
import ClaimsTable from "../ClaimsTable";
import { getInsurerData } from "../data";

export default async function ClaimsPage() {
  const { NET_HOSPITALS, claimViews } = await getInsurerData();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <PageHeader title="Claims" />
      <ClaimsTable claims={claimViews()} hospitals={NET_HOSPITALS.map((h) => ({ id: h.id, name: h.name }))} />
    </div>
  );
}
