import { getPortal } from '../portal';
import HospitalExplorer from './HospitalExplorer';

export default async function HospitalsPage() {
  const { hospitals } = await getPortal();
  return <HospitalExplorer hospitals={hospitals} />;
}
