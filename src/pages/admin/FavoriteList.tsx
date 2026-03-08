import { Heart, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Favorite {
  id: string;
  customerName: string;
  productName: string;
  dateAdded: string;
}

const mockFavorites: Favorite[] = [
  { id: '1', customerName: 'Nguyen Van A', productName: 'iPhone 15 Pro Max', dateAdded: '2024-01-20' },
  { id: '2', customerName: 'Tran Thi B', productName: 'MacBook Air M2', dateAdded: '2024-01-18' },
  { id: '3', customerName: 'Nguyen Van A', productName: 'AirPods Pro 2', dateAdded: '2024-01-15' },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .fl-root {
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

  .fl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .fl-header-left { display: flex; align-items: center; gap: 16px; }
  .fl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .fl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .fl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .fl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .fl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .fl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .fl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .fl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .fl-search-wrap { position: relative; display: flex; align-items: center; }
  .fl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .fl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .fl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .fl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .fl-table { width: 100%; border-collapse: collapse; }
  .fl-table thead tr { border-bottom: 1px solid var(--border); }
  .fl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .fl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .fl-table tbody tr:last-child td { border-bottom: none; }
  .fl-table tbody tr:hover td { background: var(--accent-soft); }

  .fl-product-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .fl-customer-text { font-size: 0.875rem; color: var(--ink-2); }

  .fl-actions { display: flex; gap: 6px; align-items: center; }
  .fl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .fl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .fl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .fl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .fl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }
`;

export function FavoriteList() {
  const [favorites] = useState<Favorite[]>(mockFavorites);
  const [search, setSearch] = useState('');

  const filtered = favorites.filter(
    (f) =>
      f.productName.toLowerCase().includes(search.toLowerCase()) ||
      f.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fl-root">
      <style>{css}</style>

      <div className="fl-header">
        <div className="fl-header-left">
          <div className="fl-icon-badge">
            <Heart />
          </div>
          <div>
            <h1 className="fl-title">
              Favorites
              {favorites.length > 0 && (
                <span className="fl-count-pill">{favorites.length}</span>
              )}
            </h1>
            <div className="fl-divider" />
            <p className="fl-subtitle" style={{ marginTop: 6 }}>
              View what products customers are saving
            </p>
          </div>
        </div>
      </div>

      <div className="fl-table-card">
        <div className="fl-table-toolbar">
          <div className="fl-search-wrap">
            <Search />
            <input
              className="fl-search"
              placeholder="Search favorites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="fl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="fl-empty">
            <div className="fl-empty-icon">
              <Heart size={22} />
            </div>
            <p className="fl-empty-text">No favorites found</p>
          </div>
        ) : (
          <table className="fl-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="fl-product-text">{f.productName}</span>
                  </td>
                  <td>
                    <span className="fl-customer-text">{f.customerName}</span>
                  </td>
                  <td>{f.dateAdded}</td>
                  <td>
                    <div className="fl-actions">
                      <button
                        type="button"
                        className="fl-btn-delete"
                        title="Remove"
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
