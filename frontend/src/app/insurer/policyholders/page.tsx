import PageHeader from "@/components/PageHeader";
import PolicyholderDirectory, { type HolderView } from "../PolicyholderDirectory";
import { getInsurerData, isOpen } from "../data";

export default async function PolicyholdersPage() {
  const { HOLDERS, claimsOf, getHospital } = await getInsurerData();
  const holders: HolderView[] = HOLDERS.map((h) => ({ id: h.id, memberId: h.memberId, name: h.name, age: h.age, gender: h.gender, policy: h.policy.name, policyNumber: h.policy.number, phone: h.phone, hospital: h.admission && getHospital(h.admission.hospitalId)?.name, location: h.admission?.ward, diagnosis: h.admission?.diagnosis, openClaims: claimsOf(h.memberId).filter(isOpen).length }));
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7">
      <PageHeader title="Policyholders" />
      <PolicyholderDirectory holders={holders} />
    </div>
  );
}
