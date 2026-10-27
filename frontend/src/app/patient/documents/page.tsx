import { getPortal } from '../portal';
import DocumentsView from './components/DocumentsView';

export default async function DocumentsPage() {
  const { documents } = await getPortal();
  return <DocumentsView documents={documents} />;
}
