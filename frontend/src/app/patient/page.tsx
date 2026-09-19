import Link from "next/link";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  FiShield,
  FiCalendar,
  FiHeart,
  FiList,
  FiArrowRight,
  FiFileText,
  FiMapPin,
  FiTrendingUp,
  FiUpload,
  FiCopy,
  FiRefreshCw,
} from "react-icons/fi";
import { MdOutlineSupportAgent } from "react-icons/md";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const patient = {
  name: "Priya Sharma",
  memberId: "IC-IND-7842",
  location: "Jaipur, Rajasthan",
  familyCovered: 4,
};

const activePolicies = [
  {
    id: "POL-001",
    name: "Family Health Shield Plus",
    provider: "CarePlus Insurance",
    coverage: 1500000, // ₹15,00,000
    validTill: "15 Mar 2027",
    status: "active",
  },
  {
    id: "POL-002",
    name: "Critical Illness Rider",
    provider: "SecureLife Assurance",
    coverage: 500000, // ₹5,00,000
    validTill: "30 Jun 2027",
    status: "active",
  },
  {
    id: "POL-003",
    name: "Accidental Death Benefit",
    provider: "SafeGuard General",
    coverage: 1000000, // ₹10,00,000
    validTill: "14 Jan 2027",
    status: "active",
  },
];

const govtSchemes = [
  {
    name: "Ayushman Bharat PM-JAY",
    status: "enrolled",
    benefit: "₹5,00,000 family coverage",
  },
  {
    name: "Chiranjeevi Yojana (Rajasthan)",
    status: "applied",
    benefit: "Cashless treatment up to ₹10 lakhs",
  },
];

const upcomingRenewal = {
  policy: "Family Health Shield Plus",
  date: "15 Mar 2027",
  amount: "₹18,500",
  daysLeft: 12,
};

const activeClaim = {
  id: "CLM-IND-2026-0876",
  type: "Hospitalization",
  amount: "₹45,000",
  status: "approved",
  hospital: "Apollo Hospitals, Jaipur",
  date: "10 Sep 2026",
};

const nearbyHospitals = [
  {
    name: "Fortis Hospital",
    distance: "2.3 km",
    specialties: ["Cardiology", "Orthopedics", "Emergency"],
    rating: 4.8,
    emergency: true,
  },
  {
    name: "Narayana Multispecialty Hospital",
    distance: "3.7 km",
    specialties: ["Neurology", "Oncology", "Pediatrics"],
    rating: 4.6,
    emergency: true,
  },
  {
    name: "Santokba Durlabhji Memorial Hospital",
    distance: "1.8 km",
    specialties: ["General Medicine", "Surgery", "Maternity"],
    rating: 4.7,
    emergency: false,
  },
];

const quickActions = [
  {
    label: "Ask AI",
    hint: "Get instant answers about coverage",
    icon: MdOutlineSupportAgent,
    href: "/patient/assistant",
    tint: "bg-blue-50 text-blue-600",
  },
  {
    label: "Find Hospital",
    hint: "Locate network hospitals",
    icon: FiMapPin,
    href: "/patient/hospitals",
    tint: "bg-teal-50 text-teal-600",
  },
  {
    label: "Upload Document",
    hint: "Add policy or medical files",
    icon: FiUpload,
    href: "/patient/documents",
    tint: "bg-green-50 text-green-600",
  },
  {
    label: "Compare Policies",
    hint: "Review and compare plans",
    icon: FiCopy,
    href: "/patient/policies",
    tint: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Track Claim",
    hint: "Check claim status",
    icon: FiList,
    href: "/patient/claims",
    tint: "bg-orange-50 text-orange-600",
  },
];

const recentDocuments = [
  {
    name: "Policy Certificate - Family Health Shield Plus.pdf",
    category: "Policy",
    added: "12 Sep 2026",
  },
  {
    name: "Discharge Summary - Apollo Hospitals.pdf",
    category: "Medical",
    added: "10 Sep 2026",
  },
  {
    name: "Aadhaar Card (Verified).pdf",
    category: "KYC",
    added: "28 Aug 2026",
  },
];

const recentActivity: {
  type: ActivityType;
  description: string;
  timestamp: string;
  tone: "green" | "blue" | "teal";
}[] = [
  {
    type: "policy_renewal",
    description: "Renewed Family Health Shield Plus policy",
    timestamp: "2 days ago",
    tone: "green" as const,
  },
  {
    type: "claim_submitted",
    description: "Submitted dental claim for ₹2,500",
    timestamp: "5 days ago",
    tone: "blue" as const,
  },
  {
    type: "hospital_visit",
    description: "Visited Apollo Hospital for checkup",
    timestamp: "1 week ago",
    tone: "teal" as const,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const ACTIVITY_ICONS = {
  policy_renewal: FiRefreshCw,
  claim_submitted: FiFileText,
  hospital_visit: FiMapPin,
} as const;

type ActivityType = keyof typeof ACTIVITY_ICONS;

const ACTIVITY_TINT: Record<string, string> = {
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
  teal: "bg-teal-50 text-teal-600",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PatientDashboard() {
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverage, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome section */}
      <Card className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {patient.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Member ID: {patient.memberId} • {patient.location} •{" "}
              {patient.familyCovered} members covered
            </p>
          </div>
        </div>
        <Badge tone="green">All policies active</Badge>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active policies */}
        <Link href="/patient/policies" className="group" aria-label="View my policies">
          <Card className="p-5 transition-shadow group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Active Policies</h2>
              <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                <FiShield className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {activePolicies.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">policies active</p>
          </Card>
        </Link>

        {/* Total coverage */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900">Total Coverage</h2>
            <div className="rounded-full bg-teal-50 p-2 text-teal-600">
              <FiHeart className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-700">
            {formatINR(totalCoverage)}
          </p>
          <p className="mt-1 text-sm text-gray-500">across all policies</p>
        </Card>

        {/* Government schemes */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900">Govt. Schemes</h2>
            <div className="rounded-full bg-green-50 p-2 text-green-600">
              <FiShield className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{govtSchemes.length}</p>
          <p className="mt-1 text-sm text-gray-500">
            {govtSchemes.filter((s) => s.status === "enrolled").length} enrolled
          </p>
        </Card>

        {/* Upcoming renewal */}
        <Link
          href="/patient/policies"
          className="group"
          aria-label="View upcoming renewal"
        >
          <Card className="p-5 transition-shadow group-hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Upcoming Renewal</h2>
              <div className="rounded-full bg-yellow-50 p-2 text-yellow-600">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {upcomingRenewal.daysLeft} days
            </p>
            <p className="mt-1 text-sm text-gray-500">{upcomingRenewal.policy}</p>
          </Card>
        </Link>
      </div>

      {/* Active claim + nearby hospitals */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active claim */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                <FiList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Active Claim</h2>
                <p className="text-sm text-gray-500">#{activeClaim.id.slice(-4)}</p>
              </div>
            </div>
            <Badge tone="green">{activeClaim.status}</Badge>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium text-gray-900">{activeClaim.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Amount</dt>
              <dd className="font-medium text-gray-900">{activeClaim.amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Hospital</dt>
              <dd className="font-medium text-gray-900">{activeClaim.hospital}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date</dt>
              <dd className="font-medium text-gray-900">{activeClaim.date}</dd>
            </div>
          </dl>
          <Link
            href="/patient/claims"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View claim details
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        {/* Nearby hospitals */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                <FiMapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Nearby Hospitals</h2>
                <p className="text-sm text-gray-500">
                  {nearbyHospitals.length} in-network facilities nearby
                </p>
              </div>
            </div>
          </div>
          <ul className="space-y-3">
            {nearbyHospitals.map((hospital) => (
              <li key={hospital.name} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-gray-900">
                      {hospital.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {hospital.distance} away
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {hospital.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-baseline justify-end">
                      <span className="text-lg font-semibold text-gray-900">
                        {hospital.rating}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">/5</span>
                    </div>
                    {hospital.emergency && (
                      <span className="mt-1 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/patient/hospitals"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            See all hospitals
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className={`rounded-full p-2.5 ${action.tint}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{action.label}</p>
                <p className="truncate text-xs text-gray-500">{action.hint}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent documents + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent documents */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <FiFileText className="h-5 w-5" />
              </div>
              <h2 className="font-medium text-gray-900">Recent Documents</h2>
            </div>
            <Link
              href="/patient/documents"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentDocuments.map((doc) => (
              <li key={doc.name} className="flex items-center justify-between py-3">
                <div className="min-w-0 pr-3">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">Added {doc.added}</p>
                </div>
                <Badge tone="gray">{doc.category}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent activity */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FiTrendingUp className="h-5 w-5" />
            </div>
            <h2 className="font-medium text-gray-900">Recent Activity</h2>
          </div>
          <ul className="space-y-3">
            {recentActivity.map((activity, i) => {
              const Icon = ACTIVITY_ICONS[activity.type];
              return (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className={`mt-0.5 rounded-full p-2 ${ACTIVITY_TINT[activity.tone]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}