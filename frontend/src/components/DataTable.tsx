"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { cn } from "@/lib/cn";

export type Column<T> = { key: string; label: string; render: (row: T) => React.ReactNode; sort?: (row: T) => string | number; className?: string; align?: "right" };

/** Sortable table; clicking a row opens it. */
export default function DataTable<T>({ rows, columns, rowKey, href, empty = "Nothing to show" }: { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string; href?: (row: T) => string; empty?: string }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!sort || !col?.sort) return rows;
    const get = col.sort;
    return [...rows].sort((a, b) => { const x = get(a), y = get(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  }, [rows, columns, sort]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined} className={cn("whitespace-nowrap px-4 py-3 font-medium first:pl-6 last:pr-6", c.align === "right" && "text-right")}>
                {c.sort ? (
                  <button type="button" onClick={() => setSort((s) => (s?.key === c.key ? (s.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 }))} className={cn("inline-flex items-center gap-1 transition-colors hover:text-slate-900", sort?.key === c.key && "text-slate-900")}>
                    {c.label}
                    <span className="flex flex-col"><FiChevronUp className={cn("-mb-1 size-3", sort?.key === c.key && sort.dir === 1 ? "text-slate-900" : "text-slate-300")} /><FiChevronDown className={cn("size-3", sort?.key === c.key && sort.dir === -1 ? "text-slate-900" : "text-slate-300")} /></span>
                  </button>
                ) : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">{empty}</td></tr>}
          {sorted.map((row) => (
            <tr key={rowKey(row)} onClick={href ? () => router.push(href(row)) : undefined} className={cn("border-b border-slate-100 transition-colors last:border-0", href && "cursor-pointer hover:bg-slate-50")}>
              {columns.map((c) => <td key={c.key} className={cn("px-4 py-3.5 align-middle first:pl-6 last:pr-6", c.align === "right" && "text-right", c.className)}>{c.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
