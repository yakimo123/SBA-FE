import {
  Check,
  MessageSquare,
  Search,
  ShieldAlert,
  Star,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface Feedback {
  id: string;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockFeedback: Feedback[] = [
  { id: '1', customer: 'Nguyen Van A', product: 'iPhone 15 Pro Max', rating: 5, comment: 'Excellent product, fast delivery!', date: '2024-01-21', status: 'Approved' },
  { id: '2', customer: 'Tran Thi B', product: 'MacBook Air M2', rating: 4, comment: 'Good quality but packaging was damaged.', date: '2024-01-20', status: 'Pending' },
  { id: '3', customer: 'Le Van C', product: 'AirPods Pro 2', rating: 1, comment: 'Fake product! Do not buy!', date: '2024-01-19', status: 'Rejected' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .fbl-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
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
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .fbl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .fbl-header-left { display: flex; align-items: center; gap: 16px; }
  .fbl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .fbl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .fbl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .fbl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .fbl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .fbl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .fbl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .fbl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .fbl-search-wrap { position: relative; display: flex; align-items: center; }
  .fbl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .fbl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .fbl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .fbl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .fbl-table { width: 100%; border-collapse: collapse; }
  .fbl-table thead tr { border-bottom: 1px solid var(--border); }
  .fbl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .fbl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .fbl-table tbody tr:last-child td { border-bottom: none; }
  .fbl-table tbody tr:hover td { background: var(--accent-soft); }

  .fbl-product-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .fbl-comment-text { font-size: 0.83rem; color: var(--ink-2); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .fbl-rating {
    display: flex; align-items: center; gap: 8px;
    color: var(--accent); font-size: 0.85rem; font-weight: 600;
  }
  .fbl-rating svg { width: 14px; height: 14px; fill: currentColor; }

  .fbl-status-pending {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--warning-soft); color: var(--warning);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .fbl-status-approved {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .fbl-status-rejected {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .fbl-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .fbl-actions { display: flex; gap: 6px; align-items: center; }
  .fbl-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
  }
  .fbl-btn-approve { color: var(--success); }
  .fbl-btn-approve:hover { background: var(--success-soft); border-color: var(--success); }
  .fbl-btn-reject { color: var(--danger); }
  .fbl-btn-reject:hover { background: var(--danger-soft); border-color: #f5c2c2; }
  .fbl-btn-reply { color: var(--ink-3); }
  .fbl-btn-reply:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .fbl-btn-flag { color: var(--warning); }
  .fbl-btn-flag:hover { background: var(--warning-soft); border-color: var(--warning); }

  .fbl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .fbl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .fbl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function FeedbackList() {
  const [feedbacks] = useState<Feedback[]>(mockFeedback);
  const [search, setSearch] = useState('');

  const filtered = feedbacks.filter(
    (f) =>
      f.product.toLowerCase().includes(search.toLowerCase()) ||
      f.customer.toLowerCase().includes(search.toLowerCase()) ||
      f.comment.toLowerCase().includes(search.toLowerCase())
  );

  const statusClass = (status: string) =>
    status === 'Approved'
      ? 'fbl-status-approved'
      : status === 'Rejected'
        ? 'fbl-status-rejected'
        : 'fbl-status-pending';

  return (
    <div className="fbl-root">
      <style>{css}</style>

      <div className="fbl-header">
        <div className="fbl-header-left">
          <div className="fbl-icon-badge">
            <Star />
          </div>
          <div>
            <h1 className="fbl-title">
              Feedback & Reviews
              {feedbacks.length > 0 && (
                <span className="fbl-count-pill">{feedbacks.length}</span>
              )}
            </h1>
            <div className="fbl-divider" />
            <p className="fbl-subtitle" style={{ marginTop: 6 }}>
              Moderate product reviews and customer feedback
            </p>
          </div>
        </div>
      </div>

      <div className="fbl-table-card">
        <div className="fbl-table-toolbar">
          <div className="fbl-search-wrap">
            <Search />
            <input
              className="fbl-search"
              placeholder="Search feedback…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="fbl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="fbl-empty">
            <div className="fbl-empty-icon">
              <Star size={22} />
            </div>
            <p className="fbl-empty-text">No feedback found</p>
          </div>
        ) : (
          <table className="fbl-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="fbl-product-text">{f.product}</span>
                  </td>
                  <td>{f.customer}</td>
                  <td>
                    <div className="fbl-rating">
                      {f.rating}
                      <Star size={14} />
                    </div>
                  </td>
                  <td>
                    <span
                      className="fbl-comment-text"
                      title={f.comment}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        maxWidth: 240,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.comment}
                    </span>
                  </td>
                  <td>{f.date}</td>
                  <td>
                    <span className={statusClass(f.status)}>
                      <span className="fbl-status-dot" />
                      {f.status}
                    </span>
                  </td>
                  <td>
                    <div className="fbl-actions">
                      {f.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="fbl-btn fbl-btn-approve"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="fbl-btn fbl-btn-reject"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="fbl-btn fbl-btn-reply"
                        title="Reply"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button
                        type="button"
                        className="fbl-btn fbl-btn-flag"
                        title="Flag"
                      >
                        <ShieldAlert size={14} />
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
