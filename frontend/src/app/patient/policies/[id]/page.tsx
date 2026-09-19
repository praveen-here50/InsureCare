'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/cn";
import Badge from "@/components/Badge";
import { demoPolicyDetails, PolicyDetail, Policy, demoPolicies } from "@/lib/data/policies";

export default function PolicyDetailPage() {
  const params = useParams<{ id: string }>();
  const policyId = params.id;

  const policyDetail: PolicyDetail | undefined = demoPolicyDetails[policyId];
  const basePolicy: Policy | undefined = demoPolicies.find(p => p.id === policyId);

  if (!policyDetail || !basePolicy) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/patient/policies" className="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
            ← Back to Policies
          </Link>
          <div className={cn("Card", "p-8 text-center")}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Not Found</h2>
            <p className="text-gray-500">The requested policy details could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/patient/policies" className="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
          ← Back to Policies
        </Link>

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{policyDetail.name}</h1>
          <p className="mt-2 text-gray-500">
            Policy: {policyDetail.policyNumber} | {policyDetail.provider}
          </p>
        </div>

        {/* COVERAGE & BENEFITS */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className={cn("Card", "p-6")}>
            <h2 className="font-semibold text-gray-900 mb-4">Coverage & Benefits</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Total Coverage</span>
                <span>{formatINR(policyDetail.coverageAmount)}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Members Covered</span>
                <span>{policyDetail.members.join(", ")}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Policy Period</span>
                <span>
                  {new Date(policyDetail.validFrom).toLocaleDateString("en-IN")} -
                  {new Date(policyDetail.validUntil).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Network Status</span>
                {basePolicy.networkStatus === "in-network" && (
                  <Badge tone="green">In-Network</Badge>
                )}
                {basePolicy.networkStatus === "out-of-network" && (
                  <Badge tone="red">Out-of-Network</Badge>
                )}
                {basePolicy.networkStatus === "mixed" && (
                  <Badge tone="yellow">Mixed</Badge>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-medium text-gray-800 mb-2">Key Benefits</h3>
              <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                {policyDetail.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={cn("Card", "p-6")}>
            <h2 className="font-semibold text-gray-900 mb-4">Policy Information</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Policy Number</span>
                <span>{policyDetail.policyNumber}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Insurance Provider</span>
                <span>{policyDetail.provider}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 text-xs font-medium text-gray-500">Renewal Status</span>
                {basePolicy.renewalStatus === "upcoming" && (
                  <Badge tone="blue">Upcoming Renewal</Badge>
                )}
                {basePolicy.renewalStatus === "active" && (
                  <Badge tone="green">Active</Badge>
                )}
                {basePolicy.renewalStatus === "expired" && (
                  <Badge tone="red">Expired</Badge>
                )}
              </div>
              {basePolicy.renewalDate && (
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 text-xs font-medium text-gray-500">Next Renewal</span>
                  <span>{new Date(basePolicy.renewalDate).toLocaleDateString("en-IN")}</span>
                </div>
              )}
            </div>

            <div className="mt-5">
              <h3 className="font-medium text-gray-800 mb-2">Network Hospitals ({policyDetail.networkHospitals.length})</h3>
              <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                {policyDetail.networkHospitals.map((hospital, index) => (
                  <li key={index}>{hospital}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CLAIM INFORMATION */}
        <div className={cn("Card", "p-6 mb-8")}>
          <h2 className="font-semibold text-gray-900 mb-4">Claim Information</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Total Claims</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{policyDetail.claimInformation.totalClaims}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Pending Claims</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{policyDetail.claimInformation.pendingClaims}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Settled Claims</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{policyDetail.claimInformation.settledClaims}</p>
            </div>
          </div>
        </div>

        {/* EXCLUSIONS & WAITING PERIODS */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <div className={cn("Card", "p-6")}>
            <h2 className="font-semibold text-gray-900 mb-4">Exclusions</h2>
            <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
              {policyDetail.exclusions.map((exclusion, index) => (
                <li key={index}>{exclusion}</li>
              ))}
            </ul>
          </div>

          <div className={cn("Card", "p-6")}>
            <h2 className="font-semibold text-gray-900 mb-4">Waiting Periods</h2>
            <div className="space-y-2">
              {Object.entries(policyDetail.waitingPeriods).map(([condition, period], index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{condition}</span>
                  <span className="font-medium text-gray-900">{period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REQUIRED DOCUMENTS */}
        <div className={cn("Card", "p-6 mb-8")}>
          <h2 className="font-semibold text-gray-900 mb-4">Required Documents for Claims</h2>
          <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
            {policyDetail.requiredDocuments.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        </div>

        {/* RENEWAL INFORMATION */}
        <div className={cn("Card", "p-6 mb-8")}>
          <h2 className="font-semibold text-gray-900 mb-4">Renewal Information</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Last Renewed</span>
              <span>{policyDetail.renewalInformation.lastRenewed}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Next Renewal Due</span>
              <span>{policyDetail.renewalInformation.nextRenewal}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Renewal Process</span>
              <span className="text-sm text-gray-600">{policyDetail.renewalInformation.renewalProcess}</span>
            </div>
          </div>
        </div>

        {/* INSURER CONTACT */}
        <div className={cn("Card", "p-6")}>
          <h2 className="font-semibold text-gray-900 mb-4">Insurer Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Phone</span>
              <span>{policyDetail.insurerContact.phone}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Email</span>
              <span>{policyDetail.insurerContact.email}</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 text-xs font-medium text-gray-500">Address</span>
              <span className="text-sm text-gray-600">{policyDetail.insurerContact.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}