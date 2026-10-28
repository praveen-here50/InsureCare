// Hospital finder types and helpers. Hospitals are loaded with getPortal() from ../portal.

export type Hospital = {
  id: string;
  name: string;
  distance: string;
  locality: string;
  network: 'Network' | 'Non-network';
  cashless: boolean;
  emergency: boolean;
  specialties: string[];
  rating: string;
  address: string;
  hours: string;
  phone: string;
  description: string;
  services: string[];
  schemes: string[];
  image: string;
};

export const DEMO_LOCATION = 'Chennai, Tamil Nadu';

export function getHospital(hospitals: Hospital[], id: string) { return hospitals.find((hospital) => hospital.id === id); }

/** Opens the hospital in Google Maps (search by name and address, no API key needed). */
export const mapsUrl = (hospital: Hospital) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hospital.name}, ${hospital.address}`)}`;
