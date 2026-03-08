import { Edit, MapPin, Phone, Plus, Search, Store, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { branchService, BranchResponse } from '../../services/branchService';

interface StoreBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .stl-root {
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

  .stl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .stl-header-left { display: flex; align-items: center; gap: 16px; }
  .stl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .stl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .stl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .stl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .stl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .stl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .stl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .stl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .stl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .stl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .stl-search-wrap { position: relative; display: flex; align-items: center; }
  .stl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .stl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .stl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .stl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .stl-table { width: 100%; border-collapse: collapse; }
  .stl-table thead tr { border-bottom: 1px solid var(--border); }
  .stl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .stl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .stl-table tbody tr:last-child td { border-bottom: none; }
  .stl-table tbody tr:hover td { background: var(--accent-soft); }

  .stl-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .stl-contact-text { font-size: 0.83rem; color: var(--ink-2); display: flex; align-items: center; gap: 6; }

  .stl-actions { display: flex; gap: 6px; align-items: center; }
  .stl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .stl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .stl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .stl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .stl-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .stl-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: stl-spin 0.7s linear infinite;
  }
  .stl-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes stl-spin { to { transform: rotate(360deg); } }

  .stl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .stl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .stl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function StoreBranchList() {
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const data = await branchService.getBranches({ size: 100 });
        const mapped: StoreBranch[] = (data.content ?? []).map(
          (b: BranchResponse) => ({
            id: String(b.branchId),
            name: b.branchName,
            address: b.location,
            phone: b.contactNumber,
            manager: b.managerName,
          })
        );
        setStores(mapped);
      } catch {
        setStores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.manager ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="stl-root">
      <style>{css}</style>

      <div className="stl-header">
        <div className="stl-header-left">
          <div className="stl-icon-badge">
            <Store />
          </div>
          <div>
            <h1 className="stl-title">
              Store Branches
              {stores.length > 0 && (
                <span className="stl-count-pill">{stores.length}</span>
              )}
            </h1>
            <div className="stl-divider" />
            <p className="stl-subtitle" style={{ marginTop: 6 }}>
              Manage physical store locations
            </p>
          </div>
        </div>
        <button type="button" className="stl-add-btn">
          <Plus size={17} /> Add New Branch
        </button>
      </div>

      <div className="stl-table-card">
        <div className="stl-table-toolbar">
          <div className="stl-search-wrap">
            <Search />
            <input
              className="stl-search"
              placeholder="Search branches…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="stl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="stl-loading">
            <div className="stl-spinner" />
            <p className="stl-loading-text">Loading branches…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="stl-empty">
            <div className="stl-empty-icon">
              <Store size={22} />
            </div>
            <p className="stl-empty-text">No store branches found</p>
          </div>
        ) : (
          <table className="stl-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="stl-name-text">{s.name}</span>
                  </td>
                  <td>
                    <div className="stl-contact-text">
                      <MapPin size={12} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                      {s.address ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="stl-contact-text">
                      <Phone size={12} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                      {s.phone ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </div>
                  </td>
                  <td>{s.manager ?? '—'}</td>
                  <td>
                    <div className="stl-actions">
                      <button
                        type="button"
                        className="stl-btn-edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="stl-btn-delete"
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
