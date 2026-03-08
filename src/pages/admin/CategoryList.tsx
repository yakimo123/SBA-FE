import { ChevronLeft, ChevronRight, Edit, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/product';

const PAGE_SIZE = 10;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .cl-root {
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
  .cl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .cl-header-left { display: flex; align-items: center; gap: 16px; }
  .cl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .cl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .cl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .cl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .cl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .cl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .cl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .cl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }
  .cl-add-btn:active { transform: translateY(0); }

  /* ── Error ── */
  .cl-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  /* ── Loading ── */
  .cl-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .cl-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: cl-spin 0.7s linear infinite;
  }
  .cl-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes cl-spin { to { transform: rotate(360deg); } }

  /* ── Table card ── */
  .cl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .cl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .cl-search-wrap { position: relative; display: flex; align-items: center; }
  .cl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .cl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .cl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .cl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  /* ── Table ── */
  .cl-table { width: 100%; border-collapse: collapse; }
  .cl-table thead tr { border-bottom: 1px solid var(--border); }
  .cl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .cl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .cl-table tbody tr:last-child td { border-bottom: none; }
  .cl-table tbody tr:hover td { background: var(--accent-soft); }

  .cl-name-cell { display: flex; align-items: center; gap: 10px; }
  .cl-folder-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--violet-soft); display: flex;
    align-items: center; justify-content: center;
    color: var(--violet); flex-shrink: 0;
  }
  .cl-folder-icon svg { width: 15px; height: 15px; }
  .cl-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }

  .cl-desc-text {
    font-size: 0.83rem; color: var(--ink-3); line-height: 1.4;
    max-width: 340px;
  }
  .cl-id-text {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    color: var(--ink-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 2px 7px; display: inline-block;
  }

  .cl-actions { display: flex; gap: 6px; align-items: center; }
  .cl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .cl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .cl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .cl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  /* ── Empty ── */
  .cl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .cl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .cl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  /* ── Pagination ── */
  .cl-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 20px 0 0;
  }
  .cl-page-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-2);
    cursor: pointer; transition: all 0.15s;
  }
  .cl-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .cl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .cl-page-info {
    font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--ink-3); padding: 0 8px;
  }

  /* ── Modal ── */
  .cl-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: cl-fade 0.15s ease;
  }
  @keyframes cl-fade { from { opacity: 0; } to { opacity: 1; } }
  .cl-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 460px;
    margin: 20px; animation: cl-slide 0.2s ease; overflow: hidden;
  }
  @keyframes cl-slide {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cl-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid var(--border);
  }
  .cl-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.3rem;
    font-weight: 400; color: var(--ink); margin: 0;
  }
  .cl-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink-3); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .cl-modal-close:hover { background: var(--surface-2); color: var(--ink); }
  .cl-modal-body { padding: 22px 24px 26px; }
  .cl-m-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .cl-m-label span { color: var(--accent); margin-left: 2px; }
  .cl-m-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .cl-m-input::placeholder { color: var(--ink-3); }
  .cl-m-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .cl-m-textarea {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    resize: vertical; min-height: 80px; line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .cl-m-textarea::placeholder { color: var(--ink-3); }
  .cl-m-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .cl-m-error {
    display: flex; align-items: center; gap: 8px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-radius: 8px; padding: 10px 14px;
    font-size: 0.83rem; color: var(--danger); margin-top: 12px;
  }
  .cl-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
  }
  .cl-btn-cancel {
    padding: 9px 18px; border: 1px solid var(--border-strong);
    border-radius: 9px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .cl-btn-cancel:hover { background: var(--surface-2); border-color: var(--ink-3); }
  .cl-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.3); transition: all 0.15s;
  }
  .cl-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,82,26,0.38); }
  .cl-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .cl-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: cl-spin 0.6s linear infinite;
  }
`;

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const [page, setPage]                     = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [totalElements, setTotalElements]   = useState(0);

  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [editingCategory, setEditingCategory]   = useState<Category | null>(null);
  const [form, setForm]                         = useState({ categoryName: '', description: '' });
  const [formError, setFormError]               = useState<string | null>(null);
  const [isSaving, setIsSaving]                 = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await categoryService.getCategories(page, PAGE_SIZE);
      setCategories(data.content ?? (data as unknown as Category[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally { setIsLoading(false); }
  }, [page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ categoryName: '', description: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ categoryName: cat.categoryName, description: cat.description ?? '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.categoryName.trim()) { setFormError('Category name is required'); return; }
    setIsSaving(true); setFormError(null);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.categoryId, form);
      } else {
        await categoryService.createCategory(form);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.categoryName}"?`)) return;
    try {
      await categoryService.deleteCategory(cat.categoryId);
      fetchCategories();
    } catch { alert('Failed to delete category'); }
  };

  const filtered = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cl-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="cl-header">
        <div className="cl-header-left">
          <div className="cl-icon-badge"><FolderOpen /></div>
          <div>
            <h1 className="cl-title">
              Categories
              {totalElements > 0 && <span className="cl-count-pill">{totalElements}</span>}
            </h1>
            <div className="cl-divider" />
            <p className="cl-subtitle" style={{ marginTop: 6 }}>Manage product categories</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="cl-add-btn">
          <Plus size={17} /> Add Category
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div className="cl-error">⚠ {error}</div>}

      {/* ── Table card ── */}
      <div className="cl-table-card">
        <div className="cl-table-toolbar">
          <div className="cl-search-wrap">
            <Search />
            <input
              className="cl-search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="cl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="cl-loading">
            <div className="cl-spinner" />
            <p className="cl-loading-text">Loading categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cl-empty">
            <div className="cl-empty-icon"><FolderOpen size={22} /></div>
            <p className="cl-empty-text">No categories found</p>
          </div>
        ) : (
          <table className="cl-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.categoryId}>
                  <td>
                    <div className="cl-name-cell">
                      <div className="cl-folder-icon"><FolderOpen /></div>
                      <span className="cl-name-text">{cat.categoryName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="cl-desc-text">
                      {cat.description ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </span>
                  </td>
                  <td>
                    <span className="cl-id-text">#{cat.categoryId}</span>
                  </td>
                  <td>
                    <div className="cl-actions">
                      <button type="button" className="cl-btn-edit" title="Edit" onClick={() => openEdit(cat)}>
                        <Edit size={14} />
                      </button>
                      <button type="button" className="cl-btn-delete" title="Delete" onClick={() => handleDelete(cat)}>
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
        <div className="cl-pagination">
          <button type="button" disabled={page === 0}
            onClick={() => setPage((p) => p - 1)} className="cl-page-btn">
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="cl-page-info">{page + 1} / {totalPages}</span>
          <button type="button" disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)} className="cl-page-btn">
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="cl-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="cl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h2 className="cl-modal-title">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button type="button" className="cl-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="cl-modal-body">
              <div style={{ marginBottom: 16 }}>
                <label className="cl-m-label">Category Name <span>*</span></label>
                <input
                  type="text" className="cl-m-input" autoFocus
                  value={form.categoryName}
                  onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                  placeholder="e.g. Smartphones"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div>
                <label className="cl-m-label">Description</label>
                <textarea
                  className="cl-m-textarea" rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this category…"
                />
              </div>

              {formError && <div className="cl-m-error">⚠ {formError}</div>}

              <div className="cl-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cl-btn-cancel">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} disabled={isSaving} className="cl-btn-save">
                  {isSaving && <span className="cl-save-spinner" />}
                  {editingCategory ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}