import { PageIntro } from "@/components/portal/ui";
import PatientDirectory from "../PatientDirectory";
import { getHospitalDesk } from "../server";

export default async function PatientsPage() {
  const { admitted } = await getHospitalDesk();
  return (
    <div className="flex flex-col gap-6">
      <PageIntro title="Patients in hospital" description="Everyone currently admitted, under observation or ready to go home." />
      <PatientDirectory patients={admitted()} />
    </div>
  );
}
