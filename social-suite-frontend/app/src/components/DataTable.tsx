"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T & string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

/** Generic sortable table — rows are typed by the caller, not by DataTable. */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  pageSize = 10,
}: {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey as keyof T];
      const bv = b[sortKey as keyof T];
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <table className="w-full text-sm">
        <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-slate">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("px-4 py-2 font-medium", col.sortable && "cursor-pointer select-none")}
                onClick={() => {
                  if (!col.sortable) return;
                  if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                  else {
                    setSortKey(col.key);
                    setSortDir("asc");
                  }
                }}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortKey === col.key &&
                    (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-slate">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
