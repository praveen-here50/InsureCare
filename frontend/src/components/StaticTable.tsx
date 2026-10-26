import Link from "next/link";
import { cn } from "@/lib/cn";

export type StaticColumn<T> = { label: string; render: (row: T) => React.ReactNode; align?: "right"; className?: string };

/** Read-only table for server pages. Each row is a link when `href` is given. */
export default function StaticTable<T>({ rows, columns, rowKey, href }: { rows: T[]; columns: StaticColumn<T>[]; rowKey: (row: T) => string; href?: (row: T) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead><tr className="border-b border-slate-200 text-xs text-slate-500">{columns.map((c) => <th key={c.label} scope="col" className={cn("whitespace-nowrap px-4 py-3 font-medium first:pl-6 last:pr-6", c.align === "right" && "text-right")}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={rowKey(row)} className="relative border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
            {columns.map((c, i) => (
              <td key={c.label} className={cn("px-4 py-3.5 align-middle first:pl-6 last:pr-6", c.align === "right" && "text-right", c.className)}>
                {i === 0 && href ? <Link href={href(row)} className="after:absolute after:inset-0 focus-visible:outline-none">{c.render(row)}</Link> : c.render(row)}
              </td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
