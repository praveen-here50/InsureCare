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
  /** ISO date, e.g. "2026-09-12". */
  dateAdded: string;
  type: string;
  status: DocumentStatus;
  /** Size in MB. */
  size: number;
  /** Where the file is served; absent for sample records without a file. */
  url?: string;
}
