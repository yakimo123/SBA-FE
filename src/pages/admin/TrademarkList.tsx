import { Award, ChevronLeft, ChevronRight, Edit, Globe, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { brandService } from '../../services/brandService';
import { Brand } from '../../types/product';

const PAGE_SIZE = 10;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .tl-root {
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
    --teal: #1a7a6e;
    --teal-soft: #e8f5f3;
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

  /* ── Header ── */
  .tl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .tl-header-left { display: flex; align-items: center; gap: 16px; }
  .tl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .tl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .tl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .tl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .tl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .tl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .tl-add-btn {
    display: flex; align-items: center; gap: 8px; padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .tl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }
  .tl-add-btn:active { transform: translateY(0); }

  /* ── Error ── */
  .tl-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  /* ── Loading ── */
  .tl-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .tl-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: tl-spin 0.7s linear infinite;
  }
  .tl-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes tl-spin { to { transform: rotate(360deg); } }

  /* ── Table card ── */
  .tl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .tl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .tl-search-wrap { position: relative; display: flex; align-items: center; }
  .tl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .tl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .tl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .tl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  /* ── Table ── */
  .tl-table { width: 100%; border-collapse: collapse; }
  .tl-table thead tr { border-bottom: 1px solid var(--border); }
  .tl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .tl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .tl-table tbody tr:last-child td { border-bottom: none; }
  .tl-table tbody tr:hover td { background: var(--accent-soft); }

  /* ── Brand cell ── */
  .tl-brand-cell { display: flex; align-items: center; gap: 11px; }
  .tl-brand-avatar {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent-mid) 100%);
    border: 1px solid var(--accent-mid);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Serif Display', serif;
    font-size: 0.95rem; color: var(--accent); flex-shrink: 0;
    font-weight: 400; letter-spacing: -0.5px;
  }
  .tl-brand-name { font-weight: 600; color: var(--ink); font-size: 0.88rem; }

  /* ── Country badge ── */
  .tl-country-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-soft); color: var(--teal);
    font-size: 0.75rem; font-weight: 500;
    padding: 3px 9px; border-radius: 20px; white-space: nowrap;
  }
  .tl-country-badge svg { width: 11px; height: 11px; flex-shrink: 0; }

  .tl-desc-text { font-size: 0.83rem; color: var(--ink-3); max-width: 300px; }
  .tl-id-text {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    color: var(--ink-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 2px 7px; display: inline-block;
  }

  /* ── Actions ── */
  .tl-actions { display: flex; gap: 6px; }
  .tl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .tl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .tl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .tl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  /* ── Empty ── */
  .tl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .tl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .tl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  /* ── Pagination ── */
  .tl-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 20px 0 0;
  }
  .tl-page-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-2);
    cursor: pointer; transition: all 0.15s;
  }
  .tl-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .tl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .tl-page-info {
    font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--ink-3); padding: 0 8px;
  }

  /* ── Modal ── */
  .tl-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: tl-fade 0.15s ease;
  }
  @keyframes tl-fade { from { opacity: 0; } to { opacity: 1; } }
  .tl-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 460px;
    margin: 20px; animation: tl-slide 0.2s ease; overflow: hidden;
  }
  @keyframes tl-slide {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tl-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid var(--border);
  }
  .tl-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.3rem;
    font-weight: 400; color: var(--ink); margin: 0;
  }
  .tl-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink-3); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .tl-modal-close:hover { background: var(--surface-2); color: var(--ink); }
  .tl-modal-body { padding: 22px 24px 26px; }

  .tl-field { margin-bottom: 16px; }
  .tl-m-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .tl-m-label span { color: var(--accent); margin-left: 2px; }
  .tl-m-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .tl-m-input::placeholder { color: var(--ink-3); }
  .tl-m-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }

  /* Country input with icon */
  .tl-input-wrap { position: relative; }
  .tl-input-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--ink-3); pointer-events: none; width: 15px; height: 15px;
  }
  .tl-m-input-icon { padding-left: 36px !important; }

  .tl-m-textarea {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    resize: vertical; min-height: 72px; line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .tl-m-textarea::placeholder { color: var(--ink-3); }
  .tl-m-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }

  .tl-m-error {
    display: flex; align-items: center; gap: 8px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-radius: 8px; padding: 10px 14px;
    font-size: 0.83rem; color: var(--danger); margin-top: 4px;
  }
  .tl-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .tl-btn-cancel {
    padding: 9px 18px; border: 1px solid var(--border-strong); border-radius: 9px;
    background: var(--surface); font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .tl-btn-cancel:hover { background: var(--surface-2); border-color: var(--ink-3); }
  .tl-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.3); transition: all 0.15s;
  }
  .tl-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,82,26,0.38); }
  .tl-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .tl-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: tl-spin 0.6s linear infinite;
  }
`;

// Generate initials avatar letter(s) from brand name
const getInitials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export function TrademarkList() {
  const [brands, setBrands]               = useState<Brand[]>([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState('');

  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingBrand, setEditingBrand]       = useState<Brand | null>(null);
  const [form, setForm]                       = useState({ brandName: '', country: '', description: '' });
  const [formError, setFormError]             = useState<string | null>(null);
  const [isSaving, setIsSaving]               = useState(false);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await brandService.getBrands(page, PAGE_SIZE);
      setBrands(data.content ?? (data as unknown as Brand[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ brandName: '', country: '', description: '' });
    setFormError(null); setIsModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({ brandName: brand.brandName, country: brand.country ?? '', description: brand.description ?? '' });
    setFormError(null); setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.brandName.trim()) { setFormError('Brand name is required'); return; }
    setIsSaving(true); setFormError(null);
    try {
      editingBrand
        ? await brandService.updateBrand(editingBrand.brandId, form)
        : await brandService.createBrand(form);
      setIsModalOpen(false); fetchBrands();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save brand');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Delete brand "${brand.brandName}"?`)) return;
    try { await brandService.deleteBrand(brand.brandId); fetchBrands(); }
    catch { alert('Failed to delete brand'); }
  };

  const filtered = brands.filter((b) =>
    b.brandName.toLowerCase().includes(search.toLowerCase()) ||
    (b.country ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tl-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="tl-header">
        <div className="tl-header-left">
          <div className="tl-icon-badge"><Award /></div>
          <div>
            <h1 className="tl-title">
              Trademarks
              {totalElements > 0 && <span className="tl-count-pill">{totalElements}</span>}
            </h1>
            <div className="tl-divider" />
            <p className="tl-subtitle" style={{ marginTop: 6 }}>Manage brands and trademarks</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="tl-add-btn">
          <Plus size={17} /> Add Trademark
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div className="tl-error">⚠ {error}</div>}

      {/* ── Table card ── */}
      <div className="tl-table-card">
        <div className="tl-table-toolbar">
          <div className="tl-search-wrap">
            <Search />
            <input
              className="tl-search" placeholder="Search brands or countries…"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="tl-table-meta">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="tl-loading">
            <div className="tl-spinner" />
            <p className="tl-loading-text">Loading trademarks…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="tl-empty">
            <div className="tl-empty-icon"><Award size={22} /></div>
            <p className="tl-empty-text">No brands found</p>
          </div>
        ) : (
          <table className="tl-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Country</th>
                <th>Description</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.brandId}>
                  <td>
                    <div className="tl-brand-cell">
                      <div className="tl-brand-avatar">{getInitials(b.brandName)}</div>
                      <span className="tl-brand-name">{b.brandName}</span>
                    </div>
                  </td>
                  <td>
                    {b.country
                      ? <span className="tl-country-badge"><Globe />{b.country}</span>
                      : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                  </td>
                  <td>
                    <span className="tl-desc-text">
                      {b.description ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </span>
                  </td>
                  <td><span className="tl-id-text">#{b.brandId}</span></td>
                  <td>
                    <div className="tl-actions">
                      <button type="button" className="tl-btn-edit" title="Edit" onClick={() => openEdit(b)}>
                        <Edit size={14} />
                      </button>
                      <button type="button" className="tl-btn-delete" title="Delete" onClick={() => handleDelete(b)}>
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="tl-pagination">
          <button type="button" disabled={page === 0}
            onClick={() => setPage((p) => p - 1)} className="tl-page-btn">
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="tl-page-info">{page + 1} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)} className="tl-page-btn">
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="tl-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="tl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tl-modal-header">
              <h2 className="tl-modal-title">{editingBrand ? 'Edit Trademark' : 'New Trademark'}</h2>
              <button type="button" className="tl-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="tl-modal-body">
              <div className="tl-field">
                <label className="tl-m-label">Brand Name <span>*</span></label>
                <input type="text" className="tl-m-input" autoFocus
                  value={form.brandName}
                  onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                  placeholder="e.g. Samsung"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div className="tl-field">
                <label className="tl-m-label">Country of Origin</label>
                <div className="tl-input-wrap">
                  <Globe className="tl-input-icon" />
                  <input type="text" className="tl-m-input tl-m-input-icon"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="e.g. South Korea"
                  />
                </div>
              </div>
              <div className="tl-field" style={{ marginBottom: 0 }}>
                <label className="tl-m-label">Description</label>
                <textarea className="tl-m-textarea" rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short brand description…"
                />
              </div>

              {formError && <div className="tl-m-error">⚠ {formError}</div>}

              <div className="tl-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="tl-btn-cancel">Cancel</button>
                <button type="button" onClick={handleSave} disabled={isSaving} className="tl-btn-save">
                  {isSaving && <span className="tl-save-spinner" />}
                  {editingBrand ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}