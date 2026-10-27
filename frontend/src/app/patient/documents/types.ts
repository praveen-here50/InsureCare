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
  /** Object URL for files uploaded in this browser session (no backend yet). */
  url?: string;
}
