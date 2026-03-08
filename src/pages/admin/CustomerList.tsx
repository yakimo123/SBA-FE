import { Eye, Lock, Mail, Search, Unlock, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'Nguyen Van A', email: 'vana@example.com', phone: '0901234567', orders: 15, totalSpent: 25000000, status: 'Active', joinDate: '2023-01-15' },
  { id: '2', name: 'Tran Thi B', email: 'thib@example.com', phone: '0909876543', orders: 3, totalSpent: 1200000, status: 'Active', joinDate: '2023-06-20' },
  { id: '3', name: 'Le Van C', email: 'vanc@example.com', phone: '0912345678', orders: 0, totalSpent: 0, status: 'Blocked', joinDate: '2023-12-01' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .cul-root {
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
    --accent-mid: #f4c4a8;
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

  .cul-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .cul-header-left { display: flex; align-items: center; gap: 16px; }
  .cul-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .cul-icon-badge svg { color: white; width: 24px; height: 24px; }
  .cul-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .cul-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .cul-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .cul-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .cul-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .cul-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .cul-search-wrap { position: relative; display: flex; align-items: center; }
  .cul-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .cul-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cul-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .cul-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .cul-table { width: 100%; border-collapse: collapse; }
  .cul-table thead tr { border-bottom: 1px solid var(--border); }
  .cul-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .cul-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .cul-table tbody tr:last-child td { border-bottom: none; }
  .cul-table tbody tr:hover td { background: var(--accent-soft); }

  .cul-customer-cell { display: flex; align-items: center; gap: 11px; }
  .cul-avatar {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-mid) 100%);
    border: 1px solid var(--accent-mid);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 0.85rem; color: var(--accent); flex-shrink: 0;
    font-weight: 400; letter-spacing: -0.5px;
  }
  .cul-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .cul-contact-text { font-size: 0.82rem; color: var(--ink-2); line-height: 1.4; }
  .cul-price {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 500; color: var(--ink); white-space: nowrap;
  }

  .cul-status-active {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .cul-status-blocked {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .cul-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .cul-actions { display: flex; gap: 6px; align-items: center; }
  .cul-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: all 0.15s;
  }
  .cul-btn-view { color: var(--ink-3); }
  .cul-btn-view:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .cul-btn-mail { color: var(--ink-3); }
  .cul-btn-mail:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .cul-btn-block { color: var(--danger); }
  .cul-btn-block:hover { background: var(--danger-soft); border-color: #f5c2c2; }
  .cul-btn-unblock { color: var(--success); }
  .cul-btn-unblock:hover { background: var(--success-soft); border-color: var(--success); }

  .cul-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .cul-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .cul-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

const getInitials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export function CustomerList() {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="cul-root">
      <style>{css}</style>

      <div className="cul-header">
        <div className="cul-header-left">
          <div className="cul-icon-badge">
            <Users />
          </div>
          <div>
            <h1 className="cul-title">
              Customers
              {customers.length > 0 && (
                <span className="cul-count-pill">{customers.length}</span>
              )}
            </h1>
            <div className="cul-divider" />
            <p className="cul-subtitle" style={{ marginTop: 6 }}>
              Manage customer accounts
            </p>
          </div>
        </div>
      </div>

      <div className="cul-table-card">
        <div className="cul-table-toolbar">
          <div className="cul-search-wrap">
            <Search />
            <input
              className="cul-search"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="cul-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="cul-empty">
            <div className="cul-empty-icon">
              <Users size={22} />
            </div>
            <p className="cul-empty-text">No customers found</p>
          </div>
        ) : (
          <table className="cul-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cul-customer-cell">
                      <div className="cul-avatar">{getInitials(c.name)}</div>
                      <span className="cul-name-text">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cul-contact-text">
                      <div>{c.email}</div>
                      <div style={{ color: 'var(--ink-3)', fontSize: '0.78rem' }}>
                        {c.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="cul-price">{c.orders}</span>
                  </td>
                  <td>
                    <span className="cul-price">
                      ₫{c.totalSpent.toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td>{c.joinDate}</td>
                  <td>
                    <span
                      className={
                        c.status === 'Active'
                          ? 'cul-status-active'
                          : 'cul-status-blocked'
                      }
                    >
                      <span className="cul-status-dot" />
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className="cul-actions">
                      <button
                        type="button"
                        className="cul-btn cul-btn-view"
                        title="View Profile"
                        onClick={() => navigate(`/admin/customers/${c.id}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="cul-btn cul-btn-mail"
                        title="Send Email"
                      >
                        <Mail size={14} />
                      </button>
                      {c.status === 'Active' ? (
                        <button
                          type="button"
                          className="cul-btn cul-btn-block"
                          title="Block User"
                        >
                          <Lock size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="cul-btn cul-btn-unblock"
                          title="Unblock User"
                        >
                          <Unlock size={14} />
                        </button>
                      )}
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
