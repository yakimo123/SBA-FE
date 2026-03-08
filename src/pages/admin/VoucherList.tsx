import { Copy, Edit, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Voucher {
  id: string;
  code: string;
  discount: string;
  type: 'Percentage' | 'Fixed';
  usage: number;
  limit: number;
  expiry: string;
  status: 'Active' | 'Expired';
}

const mockVouchers: Voucher[] = [
  { id: '1', code: 'WELCOME2024', discount: '10%', type: 'Percentage', usage: 154, limit: 1000, expiry: '2024-12-31', status: 'Active' },
  { id: '2', code: 'SUMMERSALE', discount: '₫50,000', type: 'Fixed', usage: 45, limit: 200, expiry: '2024-06-30', status: 'Active' },
  { id: '3', code: 'FLASH50', discount: '50%', type: 'Percentage', usage: 100, limit: 100, expiry: '2024-01-01', status: 'Expired' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .vl-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --border-strong: #c9bfad;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .vl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .vl-header-left { display: flex; align-items: center; gap: 16px; }
  .vl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .vl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .vl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .vl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .vl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .vl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .vl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .vl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .vl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .vl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .vl-search-wrap { position: relative; display: flex; align-items: center; }
  .vl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .vl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .vl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .vl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .vl-table { width: 100%; border-collapse: collapse; }
  .vl-table thead tr { border-bottom: 1px solid var(--border); }
  .vl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .vl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .vl-table tbody tr:last-child td { border-bottom: none; }
  .vl-table tbody tr:hover td { background: var(--accent-soft); }

  .vl-code-text {
    font-family: 'DM Mono', monospace; font-size: 0.8rem;
    font-weight: 600; color: var(--violet);
    background: var(--violet-soft); border: 1px solid rgba(74,63,143,0.2);
    border-radius: 5px; padding: 3px 8px; display: inline-block;
  }
  .vl-discount-text {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 600; color: var(--success);
  }
  .vl-expiry-text {
    font-family: 'DM Mono', monospace; font-size: 0.78rem;
    color: var(--ink-2);
  }
  .vl-expiry-expired { color: var(--danger); }

  .vl-status-active {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .vl-status-expired {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .vl-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .vl-actions { display: flex; gap: 6px; align-items: center; }
  .vl-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
  }
  .vl-btn-copy { color: var(--ink-3); }
  .vl-btn-copy:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .vl-btn-edit { color: var(--violet); }
  .vl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .vl-btn-delete { color: var(--danger); }
  .vl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .vl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .vl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .vl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function VoucherList() {
  const [vouchers] = useState<Voucher[]>(mockVouchers);
  const [search, setSearch] = useState('');

  const filtered = vouchers.filter(
    (v) =>
      v.code.toLowerCase().includes(search.toLowerCase()) ||
      v.discount.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vl-root">
      <style>{css}</style>

      <div className="vl-header">
        <div className="vl-header-left">
          <div className="vl-icon-badge">
            <Tag />
          </div>
          <div>
            <h1 className="vl-title">
              Vouchers
              {vouchers.length > 0 && (
                <span className="vl-count-pill">{vouchers.length}</span>
              )}
            </h1>
            <div className="vl-divider" />
            <p className="vl-subtitle" style={{ marginTop: 6 }}>
              Manage discount codes and promotions
            </p>
          </div>
        </div>
        <button type="button" className="vl-add-btn">
          <Plus size={17} /> Create Voucher
        </button>
      </div>

      <div className="vl-table-card">
        <div className="vl-table-toolbar">
          <div className="vl-search-wrap">
            <Search />
            <input
              className="vl-search"
              placeholder="Search vouchers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="vl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="vl-empty">
            <div className="vl-empty-icon">
              <Tag size={22} />
            </div>
            <p className="vl-empty-text">No vouchers found</p>
          </div>
        ) : (
          <table className="vl-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Type</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="vl-code-text">{v.code}</span>
                  </td>
                  <td>
                    <span className="vl-discount-text">{v.discount}</span>
                  </td>
                  <td>{v.type}</td>
                  <td>
                    <span className="vl-expiry-text">
                      {v.usage} / {v.limit}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        v.status === 'Expired'
                          ? 'vl-expiry-text vl-expiry-expired'
                          : 'vl-expiry-text'
                      }
                    >
                      {v.expiry}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        v.status === 'Active'
                          ? 'vl-status-active'
                          : 'vl-status-expired'
                      }
                    >
                      <span className="vl-status-dot" />
                      {v.status}
                    </span>
                  </td>
                  <td>
                    <div className="vl-actions">
                      <button
                        type="button"
                        className="vl-btn vl-btn-copy"
                        title="Copy Code"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="vl-btn vl-btn-edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="vl-btn vl-btn-delete"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
