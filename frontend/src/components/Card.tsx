import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/** White rounded panel with a soft shadow, the standard surface of the dashboard. */
export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}