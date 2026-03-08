import { Edit, Plus, Trash2, Tag, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { attributeService } from '../../services/attributeService';
import { Attribute } from '../../types/product';

/* ─── Inline styles (no Tailwind required) ──────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .attr-root {
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
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-md: 0 4px 16px rgba(26,22,18,0.08), 0 2px 6px rgba(26,22,18,0.05);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
  }

  /* ── Header ── */
  .attr-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }

  .attr-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .attr-icon-badge {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35);
    flex-shrink: 0;
  }

  .attr-icon-badge svg {
    color: white;
    width: 24px;
    height: 24px;
  }

  .attr-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    font-weight: 400;
    color: var(--ink);
    line-height: 1;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
  }

  .attr-subtitle {
    font-size: 0.875rem;
    color: var(--ink-3);
    margin: 0;
    font-weight: 400;
  }

  .attr-count-pill {
    display: inline-flex;
    align-items: center;
    background: var(--violet-soft);
    color: var(--violet);
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 20px;
    margin-left: 8px;
    letter-spacing: 0.02em;
  }

  .attr-add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .attr-add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201,82,26,0.38);
  }

  .attr-add-btn:active {
    transform: translateY(0);
  }

  /* ── Error banner ── */
  .attr-error {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--danger-soft);
    border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger);
    color: var(--danger);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-size: 0.875rem;
    margin-bottom: 20px;
  }

  /* ── Loading ── */
  .attr-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
  }

  .attr-spinner {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    animation: attr-spin 0.7s linear infinite;
  }

  .attr-loading-text {
    font-size: 0.875rem;
    color: var(--ink-3);
  }

  @keyframes attr-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Table card ── */
  .attr-table-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .attr-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }

  .attr-search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .attr-search-wrap svg {
    position: absolute;
    left: 10px;
    color: var(--ink-3);
    width: 15px;
    height: 15px;
    pointer-events: none;
  }

  .attr-search {
    padding: 7px 12px 7px 32px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 220px;
  }

  .attr-search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(201,82,26,0.12);
  }

  .attr-table-meta {
    font-size: 0.8rem;
    color: var(--ink-3);
  }

  /* ── Table ── */
  .attr-table {
    width: 100%;
    border-collapse: collapse;
  }

  .attr-table thead tr {
    border-bottom: 1px solid var(--border);
  }

  .attr-table th {
    padding: 12px 20px;
    text-align: left;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-3);
    background: var(--surface-2);
  }

  .attr-table td {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
    transition: background 0.12s;
  }

  .attr-table tbody tr:last-child td {
    border-bottom: none;
  }

  .attr-table tbody tr:hover td {
    background: var(--accent-soft);
  }

  .attr-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .attr-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent-mid);
    flex-shrink: 0;
  }

  .attr-name-text {
    font-weight: 500;
    color: var(--ink);
    font-size: 0.9rem;
  }

  .attr-id-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: var(--ink-3);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 2px 7px;
    display: inline-block;
  }

  .attr-actions {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .attr-btn-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--violet);
    cursor: pointer;
    transition: all 0.15s;
  }

  .attr-btn-edit:hover {
    background: var(--violet-soft);
    border-color: var(--violet);
    box-shadow: var(--shadow-sm);
  }

  .attr-btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--danger);
    cursor: pointer;
    transition: all 0.15s;
  }

  .attr-btn-delete:hover {
    background: var(--danger-soft);
    border-color: #f5c2c2;
    box-shadow: var(--shadow-sm);
  }

  /* ── Empty state ── */
  .attr-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 20px;
    gap: 12px;
  }

  .attr-empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink-3);
  }

  .attr-empty-text {
    font-size: 0.9rem;
    color: var(--ink-3);
    margin: 0;
  }

  /* ── Pagination ── */
  .attr-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 0 0;
  }

  .attr-page-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 14px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--ink-2);
    cursor: pointer;
    transition: all 0.15s;
  }

  .attr-page-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  .attr-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .attr-page-info {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    color: var(--ink-3);
    padding: 0 8px;
  }

  /* ── Modal overlay ── */
  .attr-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: attr-fade-in 0.15s ease;
  }

  @keyframes attr-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .attr-modal {
    background: var(--surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 100%;
    max-width: 420px;
    margin: 20px;
    animation: attr-slide-up 0.2s ease;
    overflow: hidden;
  }

  @keyframes attr-slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .attr-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
  }

  .attr-modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem;
    font-weight: 400;
    color: var(--ink);
    margin: 0;
  }

  .attr-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--ink-3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.15s;
    line-height: 1;
  }

  .attr-modal-close:hover {
    background: var(--surface-2);
    color: var(--ink);
  }

  .attr-modal-body {
    padding: 20px 24px 24px;
  }

  .attr-field-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--ink-2);
    margin-bottom: 8px;
    letter-spacing: 0.01em;
  }

  .attr-field-label span {
    color: var(--accent);
    margin-left: 2px;
  }

  .attr-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-strong);
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: var(--ink);
    background: var(--surface);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .attr-input::placeholder {
    color: var(--ink-3);
  }

  .attr-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(201,82,26,0.12);
  }

  .attr-form-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--danger-soft);
    border: 1px solid #f5c2c2;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.83rem;
    color: var(--danger);
    margin-top: 12px;
  }

  .attr-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .attr-btn-cancel {
    padding: 9px 18px;
    border: 1px solid var(--border-strong);
    border-radius: 9px;
    background: var(--surface);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink-2);
    cursor: pointer;
    transition: all 0.15s;
  }

  .attr-btn-cancel:hover {
    background: var(--surface-2);
    border-color: var(--ink-3);
  }

  .attr-btn-save {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 20px;
    border: none;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.3);
    transition: all 0.15s;
  }

  .attr-btn-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(201,82,26,0.38);
  }

  .attr-btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .attr-save-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    animation: attr-spin 0.6s linear infinite;
  }

  /* ── Divider line ── */
  .attr-divider {
    width: 32px;
    height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px;
    margin: 4px 0 0 68px;
  }
`;

export function AttributeList() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attributeService.getAttributes(page, PAGE_SIZE);
      setAttributes(data.content ?? (data as unknown as Attribute[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attributes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchAttributes(); }, [fetchAttributes]);

  const openCreate = () => {
    setEditingAttribute(null);
    setAttributeName('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (attr: Attribute) => {
    setEditingAttribute(attr);
    setAttributeName(attr.attributeName);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!attributeName.trim()) { setFormError('Attribute name is required'); return; }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingAttribute) {
        await attributeService.updateAttribute(editingAttribute.attributeId, attributeName);
      } else {
        await attributeService.createAttribute(attributeName);
      }
      setIsModalOpen(false);
      fetchAttributes();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save attribute');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (attr: Attribute) => {
    if (!window.confirm(`Delete attribute "${attr.attributeName}"?`)) return;
    try {
      await attributeService.deleteAttribute(attr.attributeId);
      fetchAttributes();
    } catch {
      alert('Failed to delete attribute');
    }
  };

  const filtered = attributes.filter((a) =>
    a.attributeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="attr-root" style={{ padding: '32px' }}>
      {/* Inject styles */}
      <style>{css}</style>

      {/* Header */}
      <div className="attr-header">
        <div className="attr-header-left">
          <div className="attr-icon-badge">
            <Tag />
          </div>
          <div>
            <h1 className="attr-title">
              Product Attributes
              {totalElements > 0 && (
                <span className="attr-count-pill">{totalElements}</span>
              )}
            </h1>
            <div className="attr-divider" />
            <p className="attr-subtitle" style={{ marginTop: 6 }}>
              Manage global product attributes
            </p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="attr-add-btn">
          <Plus size={17} /> Add Attribute
        </button>
      </div>

      {/* Error */}
      {error && <div className="attr-error">⚠ {error}</div>}

      {/* Table card */}
      <div className="attr-table-card">
        {/* Toolbar */}
        <div className="attr-table-toolbar">
          <div className="attr-search-wrap">
            <Search />
            <input
              className="attr-search"
              placeholder="Search attributes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="attr-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="attr-loading">
            <div className="attr-spinner" />
            <p className="attr-loading-text">Loading attributes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="attr-empty">
            <div className="attr-empty-icon"><Tag size={22} /></div>
            <p className="attr-empty-text">No attributes found</p>
          </div>
        ) : (
          <table className="attr-table">
            <thead>
              <tr>
                <th>Attribute Name</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((attr) => (
                <tr key={attr.attributeId}>
                  <td>
                    <div className="attr-name-cell">
                      <div className="attr-dot" />
                      <span className="attr-name-text">{attr.attributeName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="attr-id-text">#{attr.attributeId}</span>
                  </td>
                  <td>
                    <div className="attr-actions">
                      <button
                        type="button"
                        onClick={() => openEdit(attr)}
                        className="attr-btn-edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(attr)}
                        className="attr-btn-delete"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="attr-pagination">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="attr-page-btn"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="attr-page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="attr-page-btn"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="attr-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="attr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="attr-modal-header">
              <h2 className="attr-modal-title">
                {editingAttribute ? 'Edit Attribute' : 'New Attribute'}
              </h2>
              <button
                type="button"
                className="attr-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="attr-modal-body">
              <label className="attr-field-label">
                Attribute Name <span>*</span>
              </label>
              <input
                type="text"
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
                placeholder="e.g. RAM, Color, Storage"
                className="attr-input"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              {formError && (
                <div className="attr-form-error">⚠ {formError}</div>
              )}
              <div className="attr-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="attr-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="attr-btn-save"
                >
                  {isSaving && <span className="attr-save-spinner" />}
                  {editingAttribute ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}