import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/** White rounded panel with a soft shadow, the standard surface of the dashboard. */
export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,45,53,0.28)]", className)}>
      {children}
    </div>
  );
}
