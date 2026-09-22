export type DocumentCategory =
  | 'Insurance'
  | 'Medical'
  | 'Government / KYC'
  | 'Prescriptions'
  | 'Reports'
  | 'Other';

export type DocumentStatus = 'verified' | 'pending' | 'archived';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  dateAdded: Date;
  type: string;
  status: DocumentStatus;
  size: number;
}
