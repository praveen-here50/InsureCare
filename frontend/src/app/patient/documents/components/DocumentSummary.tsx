import { FiCreditCard, FiFileText, FiFolder, FiHeart } from 'react-icons/fi';
import { StatCard } from '@/components/portal/ui';
import type { Document } from '../types';

export default function DocumentSummary({ documents }: { documents: Document[] }) {
  const medicalCount = documents.filter((d) => d.category === 'Medical' || d.category === 'Reports' || d.category === 'Prescriptions').length;
  const insuranceCount = documents.filter((d) => d.category === 'Insurance').length;
  const kycCount = documents.filter((d) => d.category === 'Government / KYC').length;

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={FiFolder} value={documents.length} label="Total documents" note="Stored in your vault" />
      <StatCard icon={FiHeart} value={medicalCount} label="Medical records" note="Reports and prescriptions" />
      <StatCard icon={FiFileText} value={insuranceCount} label="Insurance papers" note="Certificates and e-cards" />
      <StatCard icon={FiCreditCard} value={kycCount} label="ID and KYC" note="Government documents" />
    </div>
  );
}
