import { cn } from "@/lib/cn";
import Badge from "@/components/Badge";
import Link from "next/link";
import { Policy } from "@/lib/data/policies";

interface PolicyCardProps {
  policy: Policy;
}

export default function PolicyCard({ policy }: PolicyCardProps) {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const renewalStatusBadge = () => {
    switch (policy.renewalStatus) {
      case "upcoming":
        return <Badge tone="blue">Upcoming Renewal</Badge>;
      case "active":
        return <Badge tone="green">Active</Badge>;
      case "expired":
        return <Badge tone="red">Expired</Badge>;
      default:
        return <Badge tone="gray">Unknown</Badge>;
    }
  };

  const networkStatusBadge = () => {
    switch (policy.networkStatus) {
      case "in-network":
        return <Badge tone="green">In-Network</Badge>;
      case "out-of-network":
        return <Badge tone="red">Out-of-Network</Badge>;
      case "mixed":
        return <Badge tone="yellow">Mixed</Badge>;
      default:
        return <Badge tone="gray">Unknown</Badge>;
    }
  };

  return (
    <Link href={`/patient/policies/${policy.id}`} className="block hover:shadow-md transition-shadow">
      <div className={cn("Card", "h-full")}>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{policy.name}</h3>
              <p className="text-sm text-gray-500">{policy.provider}</p>
            </div>
            {renewalStatusBadge()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium">Policy Number</p>
              <p>{policy.policyNumber}</p>
            </div>
            <div>
              <p className="font-medium">Coverage</p>
              <p>{formatINR(policy.coverageAmount)}</p>
            </div>
            <div>
              <p className="font-medium">Members</p>
              <p>{policy.members.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium">Validity</p>
              <p>
                {new Date(policy.validFrom).toLocaleDateString("en-IN")} -
                {new Date(policy.validUntil).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {networkStatusBadge()}
          </div>

          <div className="mt-4 text-right">
            <Link
              href={`/patient/policies/${policy.id}`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}
