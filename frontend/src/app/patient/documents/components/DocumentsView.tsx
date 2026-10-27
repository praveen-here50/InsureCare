'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { useToast } from '@/components/Toast';
import { buttonClass, PageIntro } from '@/components/portal/ui';
import { send } from '@/lib/api';
import { MEMBER_REF } from '../../portal';
import type { Document } from '../types';
import DocumentCategories from './DocumentCategories';
import DocumentList from './DocumentList';
import DocumentSummary from './DocumentSummary';
import UploadSection from './UploadSection';

export default function DocumentsView({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploaded = () => {
    setUploadOpen(false);
    router.refresh();
  };

  const handleDelete = async (doc: Document) => {
    try {
      await send('DELETE', `/api/members/${MEMBER_REF}/documents/${doc.id}`);
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not remove the document');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Documents"
        title="Your health records, organised"
        description="Policy papers, medical reports, prescriptions and ID, all in one secure place and ready to share when a claim needs them."
        actions={<button type="button" onClick={() => setUploadOpen(true)} className={buttonClass('primary')}><FiUploadCloud />Upload document</button>}
      />
      <DocumentSummary documents={documents} />
      {uploadOpen && <UploadSection onUploaded={handleUploaded} onClose={() => setUploadOpen(false)} />}
      <div className="flex flex-col gap-4">
        <DocumentCategories documents={documents} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        <DocumentList documents={filteredDocuments} searchQuery={searchQuery} onSearchChange={setSearchQuery} onDelete={handleDelete} />
      </div>
    </div>
  );
}
