import { ArrowUpDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
  selectable = false,
  onSelectionChange,
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<any>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Sorting
  const sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === currentData.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelectedIds = new Set(
        currentData.map((item) => item[keyField])
      );
      setSelectedIds(newSelectedIds);
      onSelectionChange?.(currentData);
    }
  };

  const toggleSelectItem = (item: T) => {
    const newSelectedIds = new Set(selectedIds);
    const id = item[keyField];

    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }

    setSelectedIds(newSelectedIds);
    onSelectionChange?.(
      data.filter((d) => newSelectedIds.has(d[keyField]))
    );
  };

  const handleSort = (accessor: string) => {
    setSortConfig((prev) => {
      if (prev?.key === accessor) {
        return {
          key: accessor,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: accessor, direction: 'asc' };
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-purple-200 bg-white shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full font-['Fira_Sans']">
          <thead className="bg-purple-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      selectedIds.size === currentData.length &&
                      currentData.length > 0
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-gray-300 bg-white hover:border-purple-600'
                    }`}
                    type="button"
                  >
                    {selectedIds.size === currentData.length &&
                      currentData.length > 0 && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                  </button>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900"
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.accessor as string)}
                      className="flex items-center gap-1 hover:text-purple-700"
                      type="button"
                    >
                      {column.header}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100">
            {currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((item) => (
                <tr
                  key={item[keyField]}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-purple-50'
                      : ''
                  } ${selectedIds.has(item[keyField]) ? 'bg-orange-50' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectItem(item);
                        }}
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                          selectedIds.has(item[keyField])
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300 bg-white hover:border-purple-600'
                        }`}
                        type="button"
                      >
                        {selectedIds.has(item[keyField]) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {column.render
                        ? column.render(item)
                        : (item[column.accessor as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-purple-200 bg-white px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{' '}
            {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
