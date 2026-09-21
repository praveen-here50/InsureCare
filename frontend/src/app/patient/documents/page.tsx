'use client';

import { useState } from 'react';
import DocumentHeader from './components/DocumentHeader';
import DocumentSummary from './components/DocumentSummary';
import DocumentCategories from './components/DocumentCategories';
import DocumentList from './components/DocumentList';
import UploadSection from './components/UploadSection';
import type { Document } from './types';

// Synthetic demo documents
const DEMO_DOCUMENTS: Document[] = [
  {
    id: 'policy-cert-001',
    name: 'Policy Certificate - Family Health Shield Plus',
    category: 'Insurance',
    dateAdded: new Date('2024-01-15'),
    type: 'PDF',
    status: 'verified',
    size: 2.4,
  },
  {
    id: 'discharge-001',
    name: 'Hospital Discharge Summary - Appendectomy',
    category: 'Medical',
    dateAdded: new Date('2024-02-10'),
    type: 'PDF',
    status: 'verified',
    size: 1.8,
  },
  {
    id: 'lab-001',
    name: 'Lab Report - Annual Health Checkup',
    category: 'Reports',
    dateAdded: new Date('2024-02-08'),
    type: 'PDF',
    status: 'verified',
    size: 3.2,
  },
  {
    id: 'prescription-001',
    name: 'Prescription - Diabetes Management',
    category: 'Prescriptions',
    dateAdded: new Date('2024-02-05'),
    type: 'PDF',
    status: 'verified',
    size: 0.8,
  },
  {
    id: 'aadhar-001',
    name: 'Aadhar Document - KYC Verification',
    category: 'Government / KYC',
    dateAdded: new Date('2024-01-20'),
    type: 'PDF',
    status: 'verified',
    size: 1.2,
  },
  {
    id: 'card-001',
    name: 'Health Insurance Card - Front & Back',
    category: 'Insurance',
    dateAdded: new Date('2024-01-18'),
    type: 'PDF',
    status: 'verified',
    size: 0.5,
  },
  {
    id: 'rx-001',
    name: 'Prescription - Blood Pressure Management',
    category: 'Prescriptions',
    dateAdded: new Date('2024-01-25'),
    type: 'PDF',
    status: 'verified',
    size: 0.6,
  },
  {
    id: 'scan-001',
    name: 'CT Scan Report - Thoracic',
    category: 'Reports',
    dateAdded: new Date('2024-02-01'),
    type: 'PDF',
    status: 'verified',
    size: 4.1,
  },
  {
    id: 'other-001',
    name: 'Medical Report - Consultant Opinion',
    category: 'Other',
    dateAdded: new Date('2024-02-03'),
    type: 'PDF',
    status: 'verified',
    size: 2.3,
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(DEMO_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <DocumentHeader />

      {/* Summary Cards */}
      <DocumentSummary documents={documents} />

      {/* Document Categories */}
      <DocumentCategories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* Upload Section */}
      <UploadSection open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={false}
      />
    </div>
  );
}
