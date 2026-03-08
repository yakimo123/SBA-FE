import { Edit, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Guarantee {
  id: string;
  name: string;
  duration: string;
  type: 'Standard' | 'Extended' | 'Premium';
  coverage: string;
  status: 'Active' | 'Inactive';
}

const mockGuarantees: Guarantee[] = [
  { id: '1', name: 'Standard 12 Months', duration: '12 Months', type: 'Standard', coverage: 'Manufacturer defects', status: 'Active' },
  { id: '2', name: 'AppleCare+', duration: '24 Months', type: 'Premium', coverage: 'Accidental damage coverage', status: 'Active' },
  { id: '3', name: 'Extended 2 Year', duration: '24 Months', type: 'Extended', coverage: 'Parts and labor', status: 'Active' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .gl-root {
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

  .gl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .gl-header-left { display: flex; align-items: center; gap: 16px; }
  .gl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .gl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .gl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .gl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .gl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .gl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .gl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .gl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .gl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .gl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .gl-search-wrap { position: relative; display: flex; align-items: center; }
  .gl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .gl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .gl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .gl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .gl-table { width: 100%; border-collapse: collapse; }
  .gl-table thead tr { border-bottom: 1px solid var(--border); }
  .gl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .gl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .gl-table tbody tr:last-child td { border-bottom: none; }
  .gl-table tbody tr:hover td { background: var(--accent-soft); }

  .gl-policy-cell { display: flex; align-items: center; gap: 10px; }
  .gl-shield-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--violet-soft); display: flex;
    align-items: center; justify-content: center;
    color: var(--violet); flex-shrink: 0;
  }
  .gl-shield-icon svg { width: 15px; height: 15px; }
  .gl-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .gl-coverage-text { font-size: 0.83rem; color: var(--ink-3); max-width: 260px; }
  .gl-type-badge {
    display: inline-flex; align-items: center;
    background: var(--surface-2); border: 1px solid var(--border);
    color: var(--ink-2); font-size: 0.75rem; font-weight: 500;
    padding: 2px 8px; border-radius: 5px;
  }

  .gl-status-active {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .gl-status-inactive {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--surface-2); color: var(--ink-3);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; border: 1px solid var(--border); letter-spacing: 0.02em;
  }
  .gl-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .gl-actions { display: flex; gap: 6px; align-items: center; }
  .gl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .gl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .gl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .gl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .gl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .gl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .gl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function GuaranteeList() {
  const [guarantees] = useState<Guarantee[]>(mockGuarantees);
  const [search, setSearch] = useState('');

  const filtered = guarantees.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.coverage.toLowerCase().includes(search.toLowerCase()) ||
      g.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gl-root">
      <style>{css}</style>

      <div className="gl-header">
        <div className="gl-header-left">
          <div className="gl-icon-badge">
            <ShieldCheck />
          </div>
          <div>
            <h1 className="gl-title">
              Guarantee Policies
              {guarantees.length > 0 && (
                <span className="gl-count-pill">{guarantees.length}</span>
              )}
            </h1>
            <div className="gl-divider" />
            <p className="gl-subtitle" style={{ marginTop: 6 }}>
              Manage warranty and guarantee terms
            </p>
          </div>
        </div>
        <button type="button" className="gl-add-btn">
          <Plus size={17} /> Add Policy
        </button>
      </div>

      <div className="gl-table-card">
        <div className="gl-table-toolbar">
          <div className="gl-search-wrap">
            <Search />
            <input
              className="gl-search"
              placeholder="Search policies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="gl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="gl-empty">
            <div className="gl-empty-icon">
              <ShieldCheck size={22} />
            </div>
            <p className="gl-empty-text">No guarantee policies found</p>
          </div>
        ) : (
          <table className="gl-table">
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Duration</th>
                <th>Type</th>
                <th>Coverage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="gl-policy-cell">
                      <div className="gl-shield-icon">
                        <ShieldCheck />
                      </div>
                      <span className="gl-name-text">{g.name}</span>
                    </div>
                  </td>
                  <td>{g.duration}</td>
                  <td>
                    <span className="gl-type-badge">{g.type}</span>
                  </td>
                  <td>
                    <span className="gl-coverage-text">{g.coverage}</span>
                  </td>
                  <td>
                    <span
                      className={
                        g.status === 'Active'
                          ? 'gl-status-active'
                          : 'gl-status-inactive'
                      }
                    >
                      <span className="gl-status-dot" />
                      {g.status}
                    </span>
                  </td>
                  <td>
                    <div className="gl-actions">
                      <button
                        type="button"
                        className="gl-btn-edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="gl-btn-delete"
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
