import { Eye, Search, Trash2, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService, { UserResponse } from '../../services/userService';

const css = `
  .cul-root {
    --bg: #f3f4f6;
    --surface: #ffffff;
    --surface-2: #f9fafb;
    --border: #e5e7eb;
    --border-strong: #d1d5db;
    --ink: #111827;
    --ink-2: #4b5563;
    --ink-3: #6b7280;
    --accent: #ee4d2d;
    --accent-soft: #fef2f2;
    --accent-mid: #fca5a5;
    --violet: #ee4d2d;
    --violet-soft: #fff1f0;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'Inter', sans-serif;
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
    background: linear-gradient(135deg, var(--accent) 0%, #d73211 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(238,77,45,0.35); flex-shrink: 0;
  }
  .cul-icon-badge svg { color: white; width: 24px; height: 24px; }
  .cul-title {
    font-family: 'Outfit', sans-serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .cul-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'Outfit', sans-serif; font-size: 0.7rem;
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
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cul-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .cul-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .cul-table { width: 100%; border-collapse: collapse; }
  .cul-table thead tr { border-bottom: 1px solid var(--border); }
  .cul-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'Outfit', sans-serif; font-size: 0.69rem;
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
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem; color: var(--accent); flex-shrink: 0;
    font-weight: 400; letter-spacing: -0.5px;
  }
  .cul-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .cul-contact-text { font-size: 0.82rem; color: var(--ink-2); line-height: 1.4; }
  .cul-price {
    font-family: 'Outfit', sans-serif; font-size: 0.82rem;
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
  .cul-btn-block { color: var(--danger); }
  .cul-btn-block:hover { background: var(--danger-soft); border-color: #fca5a5; }

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

const getInitials = (name?: string) => {
  if (!name) return 'U';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};

export function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ size: 100 });
      setCustomers(res.content || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer? This cannot be undone.')) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. They might have related data.');
      }
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber?.includes(search)
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
              {!loading && customers.length > 0 && (
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
            {loading ? 'Loading...' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading ? (
          <div className="cul-empty">
            <Loader2 className="animate-spin" size={32} color="var(--accent)" />
            <p className="cul-empty-text">Loading customers...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                <th>Role</th>
                <th>Points</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.userId}>
                  <td>
                    <div className="cul-customer-cell">
                      <div className="cul-avatar">{getInitials(c.fullName)}</div>
                      <span className="cul-name-text">{c.fullName || 'No Name'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cul-contact-text">
                      <div>{c.email}</div>
                      <div style={{ color: 'var(--ink-3)', fontSize: '0.78rem' }}>
                        {c.phoneNumber || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="cul-price">{c.role}</span>
                  </td>
                  <td>
                    <span className="cul-price">
                      {c.rewardPoint?.toLocaleString('vi-VN')}
                    </span>
                  </td>
                  <td>{new Date(c.registrationDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span
                      className={
                        c.isActive && c.status === 'ACTIVE'
                          ? 'cul-status-active'
                          : 'cul-status-blocked'
                      }
                    >
                      <span className="cul-status-dot" />
                      {c.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <div className="cul-actions">
                      <button
                        type="button"
                        className="cul-btn cul-btn-view"
                        title="View Profile"
                        onClick={() => navigate(`/admin/customers/${c.userId}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="cul-btn cul-btn-block"
                        title="Delete User"
                        onClick={() => handleDelete(c.userId)}
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
