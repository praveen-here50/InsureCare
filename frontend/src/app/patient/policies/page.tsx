import { cn } from "@/lib/cn";
import Badge from "@/components/Badge";
import { demoPolicies, demoGovernmentSchemes, Policy, GovernmentScheme } from "@/lib/data/policies";
import PolicyCard from "./PolicyCard";
import Link from "next/link";

export default function PoliciesPage() {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const activePolicies = demoPolicies.filter((p) => p.renewalStatus === "active" || p.renewalStatus === "upcoming");
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
  const governmentSchemes = demoGovernmentSchemes.filter((s) => s.status === "active");
  const upcomingRenewal = demoPolicies.find((p) => p.renewalStatus === "upcoming")?.renewalDate;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Policies</h1>
        <p className="mt-2 text-gray-500">
          View your active insurance policies and government schemes. Track coverage, renewals, and benefits.
        </p>
      </div>

      {/* SUMMARY SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={cn("Card", "p-4")}>
          <h3 className="font-medium text-gray-600">Active Policies</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{activePolicies.length}</p>
        </div>
        <div className={cn("Card", "p-4")}>
          <h3 className="font-medium text-gray-600">Total Coverage</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatINR(totalCoverage)}</p>
        </div>
        <div className={cn("Card", "p-4")}>
          <h3 className="font-medium text-gray-600">Government Schemes</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{governmentSchemes.length}</p>
        </div>
        <div className={cn("Card", "p-4")}>
          <h3 className="font-medium text-gray-600">Upcoming Renewal</h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {upcomingRenewal ? new Date(upcomingRenewal).toLocaleDateString("en-IN") : "None"}
          </p>
        </div>
      </div>

      {/* ACTIVE INSURANCE POLICY CARDS */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Insurance Policies</h2>
        {activePolicies.length === 0 ? (
          <p className="text-gray-500">No active policies found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activePolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        )}
      </div>

      {/* GOVERNMENT SCHEMES SECTION */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Government Schemes</h2>
        {governmentSchemes.length === 0 ? (
          <p className="text-gray-500">No government schemes found.</p>
        ) : (
          <div className="grid gap-4">
            {governmentSchemes.map((scheme) => (
              <div key={scheme.id} className={cn("Card", "p-4")}>
                <h3 className="font-semibold text-gray-900">{scheme.name}</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 text-xs font-medium text-gray-500">Eligibility</span>
                    <span>{scheme.eligibility}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 text-xs font-medium text-gray-500">Status</span>
                    <Badge
                      tone={scheme.status === "active" ? "green" : scheme.status === "inactive" ? "red" : "yellow"}
                    >
                      {scheme.status}
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 text-xs font-medium text-gray-500">Benefits</span>
                    <span>{scheme.benefits}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 text-xs font-medium text-gray-500">Validity</span>
                    <span>{scheme.validity}</span>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <Link
                    href={`/patient/schemes/${scheme.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POLICY COMPARISON ENTRY POINT */}
      <div className={cn("Card", "p-6 text-center")}>
        <h2 className="font-semibold text-gray-900 mb-2">Compare Policies</h2>
        <p className="text-gray-500">
          Compare coverage, benefits, and costs of your active policies side-by-side.
        </p>
        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 ring-indigo-500">
          Compare Policies →
        </button>
      </div>
    </div>
  );
}
