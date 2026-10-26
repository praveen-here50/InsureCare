import PageHeader from "@/components/PageHeader";
import PatientDirectory from "../PatientDirectory";
import { admitted } from "../data";

export default function PatientsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Patients" />
      <PatientDirectory patients={admitted()} />
    </div>
  );
}
