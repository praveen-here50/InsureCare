'use client';

import { FiCreditCard, FiFileText, FiFolder, FiHeart } from 'react-icons/fi';
import { StatCard } from '@/components/portal/ui';
import { useT } from '@/components/portal/LanguageContext';
import type { Document } from '../types';

export default function DocumentSummary({ documents }: { documents: Document[] }) {
  const medicalCount = documents.filter((d) => d.category === 'Medical' || d.category === 'Reports' || d.category === 'Prescriptions').length;
  const insuranceCount = documents.filter((d) => d.category === 'Insurance').length;
  const kycCount = documents.filter((d) => d.category === 'Government / KYC').length;
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard icon={FiFolder} value={documents.length} label={t("Total documents")} note={t("Stored in your vault")} />
      <StatCard icon={FiHeart} value={medicalCount} label={t("Medical records")} note={t("Reports and prescriptions")} />
      <StatCard icon={FiFileText} value={insuranceCount} label={t("Insurance papers")} note={t("Certificates and e-cards")} />
      <StatCard icon={FiCreditCard} value={kycCount} label={t("ID and KYC")} note={t("Government documents")} />
    </div>
  );
}
