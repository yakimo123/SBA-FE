import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  .dt-wrap {
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --accent-mid: #f4c4a8;
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Table ── */
  .dt-scroll { overflow-x: auto; }
  .dt-table { width: 100%; border-collapse: collapse; }

  /* ── Head ── */
  .dt-thead { background: var(--surface-2); }
  .dt-th {
    padding: 11px 18px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .dt-th-select { width: 44px; padding: 11px 0 11px 16px; }

  .dt-sort-btn {
    display: inline-flex; align-items: center; gap: 5px;
    background: none; border: none; cursor: pointer; padding: 0;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); transition: color 0.15s;
  }
  .dt-sort-btn:hover { color: var(--accent); }
  .dt-sort-btn.active { color: var(--accent); }
  .dt-sort-btn svg { width: 12px; height: 12px; flex-shrink: 0; }

  /* ── Checkbox ── */
  .dt-checkbox {
    display: flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 5px;
    border: 1.5px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  }
  .dt-checkbox:hover { border-color: var(--accent); }
  .dt-checkbox.checked {
    background: var(--accent); border-color: var(--accent);
  }
  .dt-checkbox svg { width: 10px; height: 10px; color: white; }

  /* ── Body ── */
  .dt-tbody tr { transition: background 0.1s; }
  .dt-tbody tr:not(:last-child) td { border-bottom: 1px solid var(--border); }
  .dt-tbody tr:hover td { background: var(--accent-soft); }
  .dt-tbody tr.selected td { background: #fff8f5; }
  .dt-tbody tr.clickable { cursor: pointer; }

  .dt-td {
    padding: 13px 18px; font-size: 0.875rem;
    color: var(--ink-2); vertical-align: middle;
  }
  .dt-td-select { padding: 13px 0 13px 16px; }

  /* ── Empty ── */
  .dt-empty {
    padding: 56px 20px; text-align: center;
    font-size: 0.875rem; color: var(--ink-3);
  }

  /* ── Footer / Pagination ── */
  .dt-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px; border-top: 1px solid var(--border);
    background: var(--surface-2);
  }
  .dt-results {
    font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--ink-3);
  }
  .dt-results strong { color: var(--ink-2); font-weight: 500; }
  .dt-page-controls { display: flex; align-items: center; gap: 6px; }
  .dt-page-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .dt-page-btn:hover:not(:disabled) {
    border-color: var(--accent); color: var(--accent); background: var(--accent-soft);
  }
  .dt-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .dt-page-btn svg { width: 14px; height: 14px; }
  .dt-page-info {
    font-family: 'DM Mono', monospace; font-size: 0.75rem; color: var(--ink-3);
    padding: 0 4px; user-select: none;
  }

  /* ── Selection count pill ── */
  .dt-sel-pill {
    display: inline-flex; align-items: center;
    background: var(--accent-soft); border: 1px solid var(--accent-mid);
    color: var(--accent); font-family: 'DM Mono', monospace;
    font-size: 0.72rem; font-weight: 500;
    padding: 2px 8px; border-radius: 20px; margin-left: 10px;
  }
`;

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // ── Sort ──
  const sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const av = a[sortConfig.key], bv = b[sortConfig.key];
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // ── Paginate ──
  const totalPages  = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const startIndex  = (currentPage - 1) * pageSize;
  const currentData = sortedData.slice(startIndex, startIndex + pageSize);

  // ── Select ──
  const allSelected = currentData.length > 0 && selectedIds.size === currentData.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = new Set(currentData.map((i) => i[keyField]));
      setSelectedIds(ids);
      onSelectionChange?.(currentData);
    }
  };

  const toggleSelectItem = (item: T) => {
    const next = new Set(selectedIds);
    const id   = item[keyField];
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
    onSelectionChange?.(data.filter((d) => next.has(d[keyField])));
  };

  // ── Sort toggle ──
  const handleSort = (accessor: string) => {
    setSortConfig((prev) =>
      prev?.key === accessor
        ? { key: accessor, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: accessor, direction: 'asc' }
    );
    setCurrentPage(1);
  };

  const SortIcon = ({ accessor }: { accessor: string }) => {
    if (sortConfig?.key !== accessor) return <ArrowUpDown />;
    return sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />;
  };

  return (
    <div className="dt-wrap">
      <style>{css}</style>

      <div className="dt-scroll">
        <table className="dt-table">
          <thead className="dt-thead">
            <tr>
              {selectable && (
                <th className="dt-th dt-th-select">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className={`dt-checkbox${allSelected ? ' checked' : ''}`}
                  >
                    {allSelected && <Check />}
                  </button>
                </th>
              )}
              {columns.map((col, i) => (
                <th key={i} className="dt-th">
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.accessor as string)}
                      className={`dt-sort-btn${sortConfig?.key === col.accessor ? ' active' : ''}`}
                    >
                      {col.header}
                      <SortIcon accessor={col.accessor as string} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="dt-tbody">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="dt-empty">
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((item) => {
                const isSelected = selectedIds.has(item[keyField]);
                return (
                  <tr
                    key={item[keyField]}
                    onClick={() => onRowClick?.(item)}
                    className={[
                      onRowClick ? 'clickable' : '',
                      isSelected ? 'selected' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {selectable && (
                      <td className="dt-td dt-td-select">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelectItem(item); }}
                          className={`dt-checkbox${isSelected ? ' checked' : ''}`}
                        >
                          {isSelected && <Check />}
                        </button>
                      </td>
                    )}
                    {columns.map((col, ci) => (
                      <td key={ci} className="dt-td">
                        {col.render
                          ? col.render(item)
                          : (item[col.accessor as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      {totalPages > 1 && (
        <div className="dt-footer">
          <span className="dt-results">
            Showing{' '}
            <strong>{startIndex + 1}–{Math.min(startIndex + pageSize, data.length)}</strong>
            {' '}of <strong>{data.length}</strong>
            {selectable && selectedIds.size > 0 && (
              <span className="dt-sel-pill">{selectedIds.size} selected</span>
            )}
          </span>
          <div className="dt-page-controls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="dt-page-btn"
            >
              <ChevronLeft />
            </button>
            <span className="dt-page-info">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="dt-page-btn"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}