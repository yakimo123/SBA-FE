import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface BulkOrder {
  id: string;
  companyName: string;
  product: string;
  quantity: number;
  requestedPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

const mockBulkOrders: BulkOrder[] = [
  { id: 'BLK-001', companyName: 'Corporate Solutions Ltd', product: 'MacBook Air M2', quantity: 50, requestedPrice: 25000000, status: 'Pending', date: '2024-01-22' },
  { id: 'BLK-002', companyName: 'Tech Start Inc', product: 'Sony WH-1000XM5', quantity: 20, requestedPrice: 8500000, status: 'Approved', date: '2024-01-21' },
  { id: 'BLK-003', companyName: 'Edu Partners', product: 'iPad Air 5', quantity: 100, requestedPrice: 14000000, status: 'Rejected', date: '2024-01-20' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .bol-root {
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
    --warning: #905a10;
    --warning-soft: #fef6eb;
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

  .bol-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .bol-header-left { display: flex; align-items: center; gap: 16px; }
  .bol-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .bol-icon-badge svg { color: white; width: 24px; height: 24px; }
  .bol-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .bol-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .bol-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .bol-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .bol-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .bol-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .bol-search-wrap { position: relative; display: flex; align-items: center; }
  .bol-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .bol-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .bol-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .bol-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .bol-table { width: 100%; border-collapse: collapse; }
  .bol-table thead tr { border-bottom: 1px solid var(--border); }
  .bol-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .bol-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .bol-table tbody tr:last-child td { border-bottom: none; }
  .bol-table tbody tr:hover td { background: var(--accent-soft); }

  .bol-id-text {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    color: var(--ink-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 2px 7px; display: inline-block;
  }
  .bol-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .bol-price {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 500; color: var(--ink); white-space: nowrap;
  }

  .bol-status-pending {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--warning-soft); color: var(--warning);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .bol-status-approved {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .bol-status-rejected {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .bol-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .bol-actions { display: flex; gap: 6px; align-items: center; }
  .bol-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
  }
  .bol-btn-approve { color: var(--success); }
  .bol-btn-approve:hover { background: var(--success-soft); border-color: var(--success); }
  .bol-btn-reject { color: var(--danger); }
  .bol-btn-reject:hover { background: var(--danger-soft); border-color: #f5c2c2; }
  .bol-btn-copy { color: var(--ink-3); }
  .bol-btn-copy:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }

  .bol-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .bol-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .bol-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function BulkRequestList() {
  const [requests] = useState<BulkOrder[]>(mockBulkOrders);
  const [search, setSearch] = useState('');

  const filtered = requests.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName.toLowerCase().includes(search.toLowerCase()) ||
      r.product.toLowerCase().includes(search.toLowerCase())
  );

  const statusClass = (status: string) =>
    status === 'Approved'
      ? 'bol-status-approved'
      : status === 'Rejected'
        ? 'bol-status-rejected'
        : 'bol-status-pending';

  return (
    <div className="bol-root">
      <style>{css}</style>

      <div className="bol-header">
        <div className="bol-header-left">
          <div className="bol-icon-badge">
            <ShoppingBag />
          </div>
          <div>
            <h1 className="bol-title">
              Bulk Order Requests
              {requests.length > 0 && (
                <span className="bol-count-pill">{requests.length}</span>
              )}
            </h1>
            <div className="bol-divider" />
            <p className="bol-subtitle" style={{ marginTop: 6 }}>
              Manage B2B wholesale pricing requests
            </p>
          </div>
        </div>
      </div>

      <div className="bol-table-card">
        <div className="bol-table-toolbar">
          <div className="bol-search-wrap">
            <Search />
            <input
              className="bol-search"
              placeholder="Search requests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="bol-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bol-empty">
            <div className="bol-empty-icon">
              <ShoppingBag size={22} />
            </div>
            <p className="bol-empty-text">No bulk requests found</p>
          </div>
        ) : (
          <table className="bol-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Company</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Target Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>
                    <span className="bol-id-text">{req.id}</span>
                  </td>
                  <td>
                    <span className="bol-name-text">{req.companyName}</span>
                  </td>
                  <td>{req.product}</td>
                  <td>
                    <span className="bol-price">{req.quantity}</span>
                  </td>
                  <td>
                    <span className="bol-price">
                      ₫{req.requestedPrice.toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td>
                    <span className={statusClass(req.status)}>
                      <span className="bol-status-dot" />
                      {req.status}
                    </span>
                  </td>
                  <td>{req.date}</td>
                  <td>
                    <div className="bol-actions">
                      {req.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="bol-btn bol-btn-approve"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="bol-btn bol-btn-reject"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="bol-btn bol-btn-copy"
                        title="Copy"
                      >
                        <Copy size={14} />
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
