import type { Document } from '../types';

interface DocumentSummaryProps {
  documents: Document[];
}

export default function DocumentSummary({ documents }: DocumentSummaryProps) {
  const medicalCount = documents.filter((d) => d.category === 'Medical' || d.category === 'Reports' || d.category === 'Prescriptions').length;
  const insuranceCount = documents.filter((d) => d.category === 'Insurance').length;
  const kycCount = documents.filter((d) => d.category === 'Government / KYC').length;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Total Documents</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{documents.length}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Medical</p>
        <p className="mt-2 text-3xl font-semibold text-blue-600">{medicalCount}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Insurance</p>
        <p className="mt-2 text-3xl font-semibold text-emerald-600">{insuranceCount}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Government/KYC</p>
        <p className="mt-2 text-3xl font-semibold text-amber-600">{kycCount}</p>
      </div>
    </div>
  );
}
