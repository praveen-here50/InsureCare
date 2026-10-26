export interface Policy {
  id: string;
  provider: string;
  name: string;
  policyNumber: string;
  coverageAmount: number;
  members: string[];
  validFrom: string;
  validUntil: string;
  renewalStatus: 'upcoming' | 'active' | 'expired';
  networkStatus: 'in-network' | 'out-of-network' | 'mixed';
  renewalDate?: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  eligibility: string;
  status: 'active' | 'inactive' | 'pending';
  benefits: string;
  validity: string;
}

// Extended interface for policy detail view
export interface PolicyDetail extends Policy {
  benefits: string[];
  exclusions: string[];
  waitingPeriods: { [key: string]: string }; // e.g., { "Initial": "30 days" }
  networkHospitals: string[];
  claimInformation: {
    totalClaims: number;
    pendingClaims: number;
    settledClaims: number;
  };
  requiredDocuments: string[];
  renewalInformation: {
    lastRenewed: string;
    nextRenewal: string;
    renewalProcess: string;
  };
  insurerContact: {
    phone: string;
    email: string;
    address: string;
  };
}

export const demoPolicies: Policy[] = [
  {
    id: 'pol-001',
    provider: 'Demo Health Insurance Ltd.',
    name: 'Family Health Plus',
    policyNumber: 'DEMO-POL-XXXX-1234',
    coverageAmount: 500000,
    members: ['John Doe', 'Jane Doe', 'Junior Doe'],
    validFrom: '2023-01-15',
    validUntil: '2024-01-14',
    renewalStatus: 'upcoming',
    networkStatus: 'in-network',
    renewalDate: '2024-01-15',
  },
  {
    id: 'pol-002',
    provider: 'Synthetic Mediclaim Corp.',
    name: 'Senior Citizen Secure',
    policyNumber: 'SYN-MED-XXXX-5678',
    coverageAmount: 300000,
    members: ['Robert Smith'],
    validFrom: '2022-06-01',
    validUntil: '2023-05-31',
    renewalStatus: 'expired',
    networkStatus: 'out-of-network',
  },
];

export const demoGovernmentSchemes: GovernmentScheme[] = [
  {
    id: 'sch-001',
    name: 'Ayushman Bharat PM-JAY',
    eligibility: 'Families below poverty line',
    status: 'active',
    benefits: 'Up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization',
    validity: 'Ongoing',
  },
  {
    id: 'sch-002',
    name: 'State Health Security Scheme',
    eligibility: 'Residents of the state with annual income < ₹2,50,000',
    status: 'active',
    benefits: 'Cashless treatment up to ₹2,00,000 per annum',
    validity: 'Ongoing',
  },
];

// Demo data for policy detail view (extended)
export const demoPolicyDetails: Record<string, PolicyDetail> = {
  'pol-001': {
    id: 'pol-001',
    provider: 'Demo Health Insurance Ltd.',
    name: 'Family Health Plus',
    policyNumber: 'DEMO-POL-XXXX-1234',
    coverageAmount: 500000,
    members: ['John Doe', 'Jane Doe', 'Junior Doe'],
    validFrom: '2023-01-15',
    validUntil: '2024-01-14',
    renewalStatus: 'upcoming',
    networkStatus: 'in-network',
    renewalDate: '2024-01-15',
    benefits: [
      'In-patient hospitalization',
      'Pre and post-hospitalization (30 days before, 60 days after)',
      'Day care procedures',
      'Ambulance charges',
      'Organ donor expenses',
    ],
    exclusions: [
      'Pre-existing diseases (for first 2 years)',
      'War, nuclear perils',
      'Self-inflicted injuries',
      'Cosmetic surgery',
      'Dental treatment (unless due to accident)',
    ],
    waitingPeriods: {
      'Initial': '30 days',
      'Pre-existing diseases': '2 years',
      'Specific diseases (e.g., cataract, hernia)': '1 year',
      'Maternity benefits': '2 years',
    },
    networkHospitals: [
      'Apollo Hospital, Delhi',
      'Fortis Memorial Research Institute, Gurgaon',
      'Max Super Speciality Hospital, Saket',
      'Artemis Hospital, Gurgaon',
      'Medanta - The Medicity, Gurgaon',
    ],
    claimInformation: {
      totalClaims: 2,
      pendingClaims: 0,
      settledClaims: 2,
    },
    requiredDocuments: [
      'Duly filled claim form',
      'Original discharge summary',
      'Original hospital bills and receipts',
      'Original pharmacy bills',
      'Investigation reports (X-ray, MRI, etc.)',
      'Doctor\'s consultation notes',
      'ID proof of patient',
      'Policy copy',
    ],
    renewalInformation: {
      lastRenewed: '2023-01-15',
      nextRenewal: '2024-01-15',
      renewalProcess: 'Auto-renewal upon payment of premium before due date.',
    },
    insurerContact: {
      phone: '1800-123-4567',
      email: 'care@demohealth.com',
      address: '123, Insurance Tower, New Delhi - 110001',
    },
  },
  'pol-002': {
    id: 'pol-002',
    provider: 'Synthetic Mediclaim Corp.',
    name: 'Senior Citizen Secure',
    policyNumber: 'SYN-MED-XXXX-5678',
    coverageAmount: 300000,
    members: ['Robert Smith'],
    validFrom: '2022-06-01',
    validUntil: '2023-05-31',
    renewalStatus: 'expired',
    networkStatus: 'out-of-network',
    benefits: [
      'Hospitalization expenses',
      'Pre-existing disease coverage (after 1 year waiting period)',
      'Domiciliary hospitalization',
      'AYUSH treatment',
    ],
    exclusions: [
      'Pre-existing diseases (for first year)',
      'Injuries due to adventure sports',
      'HIV/AIDS',
      'Congenital diseases',
      'Treatment outside India',
    ],
    waitingPeriods: {
      'Initial': '30 days',
      'Pre-existing diseases': '1 year',
      'Specific diseases': '2 years',
    },
    networkHospitals: [
      'City Hospital, Mumbai',
      'Life Line Hospital, Bangalore',
    ],
    claimInformation: {
      totalClaims: 1,
      pendingClaims: 0,
      settledClaims: 1,
    },
    requiredDocuments: [
      'Claim form',
      'Hospital discharge certificate',
      'Hospital bills and receipts',
      'Pharmacy bills',
      'Investigation reports',
      "Patient's ID proof",
      'Policy documents',
    ],
    renewalInformation: {
      lastRenewed: '2022-06-01',
      nextRenewal: '2023-06-01',
      renewalProcess: 'Renewal application to be submitted 30 days before expiry.',
    },
    insurerContact: {
      phone: '1800-987-6543',
      email: 'support@syntheticed.com',
      address: '456, Health Care Building, Mumbai - 400001',
    },
  },
};
