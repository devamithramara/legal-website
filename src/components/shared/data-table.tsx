'use client';

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { EmptyState } from './empty-state';

/**
 * Reusable data table with search, sorting, and pagination.
 *
 * Usage:
 *   <DataTable
 *     data={cases}
 *     columns={[
 *       { key: 'caseNumber', label: 'Case #', sortable: true },
 *       { key: 'title', label: 'Title' },
 *       { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
 *     ]}
 *     searchKeys={['caseNumber', 'title']}
 *   />
 */

export interface DataTableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  pageSize = 20,
  emptyTitle = 'No data found',
  emptyDescription,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  // Filter
  const filtered = useMemo(() => {
    if (!search || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, search, searchKeys]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortKey !== columnKey) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
    if (sortDir === 'asc') return <ChevronUp className="h-3 w-3 ml-1" />;
    return <ChevronDown className="h-3 w-3 ml-1" />;
  }

  return (
    <div className={className}>
      {/* Search bar */}
      {searchKeys.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 bg-gray-800/60 border-gray-700 text-white"
          />
        </div>
      )}

      {/* Table */}
      {paged.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="rounded-md border border-gray-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700/50 hover:bg-transparent">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={`text-gray-400 ${col.sortable ? 'cursor-pointer select-none' : ''} ${col.className || ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div className="flex items-center">
                        {col.label}
                        {col.sortable && <SortIcon columnKey={col.key} />}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row, i) => (
                  <TableRow
                    key={i}
                    className={`border-gray-700/30 ${onRowClick ? 'cursor-pointer hover:bg-gray-800/40' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={`text-gray-300 ${col.className || ''}`}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] != null
                            ? String(row[col.key])
                            : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-400">
                {sorted.length} result{sorted.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="border-gray-700 text-gray-300"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400 flex items-center px-2">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="border-gray-700 text-gray-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
