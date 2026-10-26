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
};

export const DEMO_LOCATION = 'Kurnool, Andhra Pradesh';

export const HOSPITALS: Hospital[] = [
  { id: 'riverbend-community', name: 'Riverbend Community Hospital', distance: '3.2 km', locality: 'Nandyal Road, Kurnool', network: 'Network', cashless: true, emergency: true, specialties: ['General medicine', 'Cardiology', 'Orthopedics'], rating: '4.6 / 5', address: '12 Riverbend Avenue, Nandyal Road, Kurnool', hours: 'Open 24 hours', phone: '+91 90000 10001', description: 'A 24-hour community hospital offering emergency care, diagnostics and general medicine.', services: ['24-hour emergency desk', 'Diagnostics and imaging', 'Pharmacy counter', 'Ambulance coordination'], schemes: ['Family Health Shield Plus', 'State Care Scheme'] },
  { id: 'mandala-womens', name: 'Mandala Women’s & Children’s Centre', distance: '5.8 km', locality: 'Gandhi Nagar, Kurnool', network: 'Network', cashless: true, emergency: false, specialties: ['Maternity', 'Pediatrics', 'Women’s health'], rating: '4.4 / 5', address: '44 Mandala Street, Gandhi Nagar, Kurnool', hours: '6:00 AM – 10:00 PM', phone: '+91 90000 10002', description: 'A specialist centre focused on maternity, women’s health and children’s care.', services: ['Maternity consultation', 'Child wellness clinic', 'Ultrasound imaging', 'Vaccination clinic'], schemes: ['Family Health Shield Plus', 'Rural Care Assist'] },
  { id: 'hillside-general', name: 'Hillside General Hospital', distance: '9.4 km', locality: 'B. Camp, Kurnool', network: 'Non-network', cashless: false, emergency: true, specialties: ['Emergency care', 'General surgery', 'Neurology'], rating: '4.2 / 5', address: '8 Hillside Service Road, B. Camp, Kurnool', hours: 'Open 24 hours', phone: '+91 90000 10003', description: 'A non-network emergency and surgical hospital. Reimbursement depends on your policy terms.', services: ['24-hour emergency desk', 'Surgical theatre', 'Neurology clinic', 'Pathology lab'], schemes: ['State Care Scheme'] },
  { id: 'sunfield-primary', name: 'Sunfield Primary Care Centre', distance: '12.6 km', locality: 'Orvakal, Kurnool district', network: 'Network', cashless: true, emergency: false, specialties: ['Primary care', 'Diabetes care', 'Preventive health'], rating: '4.1 / 5', address: '3 Sunfield Main Road, Orvakal', hours: '8:00 AM – 8:00 PM', phone: '+91 90000 10004', description: 'A primary-care centre for routine consultations, diabetes screening and preventive health.', services: ['Family medicine', 'Diabetes screening', 'Basic diagnostics', 'Teleconsult support'], schemes: ['Rural Care Assist'] },
];

export function getHospital(id: string) { return HOSPITALS.find((hospital) => hospital.id === id); }
