import { PageIntro } from "@/components/portal/ui";
import ClaimsList from "../ClaimsList";
import { getHospitalDesk } from "../server";

export default async function InsurerClaimsPage() {
  const { admitted } = await getHospitalDesk();
  return (
    <div className="flex flex-col gap-6">
      <PageIntro title="Claims to verify and share" description="Open a patient to upload and verify their documents, then send them to the insurer." />
      <ClaimsList patients={admitted()} />
    </div>
  );
}
