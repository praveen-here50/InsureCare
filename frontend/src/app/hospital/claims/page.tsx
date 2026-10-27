import { PageIntro } from "@/components/portal/ui";
import ClaimsBoard from "../ClaimsBoard";
import { getHospitalDesk } from "../data";

export default async function InsurerClaimsPage() {
  const { AGENT, admitted } = await getHospitalDesk();
  return (
    <div className="flex flex-col gap-6">
      <PageIntro eyebrow="Insurer claims" title="Claims to verify and share" description="Send each patient's documents to their insurer once every document is verified." />
      <ClaimsBoard patients={admitted()} agent={AGENT} />
    </div>
  );
}
