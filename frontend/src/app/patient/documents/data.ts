// Document vault constants. Documents are loaded with getPortal() from ../portal.
import type { Tone } from '@/components/portal/ui';
import type { DocumentCategory } from './types';

export const CATEGORIES: DocumentCategory[] = ['Insurance', 'Medical', 'Government / KYC', 'Prescriptions', 'Reports', 'Other'];

export const CATEGORY_TONE: Record<DocumentCategory, Tone> = {
  Insurance: 'slate',
  Medical: 'slate',
  'Government / KYC': 'slate',
  Prescriptions: 'slate',
  Reports: 'slate',
  Other: 'slate',
};

export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_SIZE_MB = 10;

export { formatDate as formatDocDate } from '../policies/data';
