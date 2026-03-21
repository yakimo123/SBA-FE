import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { supplierService } from '../../services/supplierService';
import { Supplier } from '../../types/product';

const PAGE_SIZE = 10;

const css = `
  

  .sl-root {
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
    --violet: #ee4d2d;
    --violet-soft: #fff1f0;
    --teal: #1a7a6e;
    --teal-soft: #e8f5f3;
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

  .sl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .sl-header-left { display: flex; align-items: center; gap: 16px; }
  .sl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #d73211 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(238,77,45,0.35); flex-shrink: 0;
  }
  .sl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .sl-title {
    font-family: 'Outfit', sans-serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .sl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'Outfit', sans-serif; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .sl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .sl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .sl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #d73211 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(238,77,45,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .sl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(238,77,45,0.38); }

  .sl-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f8aba6;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  .sl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .sl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .sl-search-wrap { position: relative; display: flex; align-items: center; }
  .sl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .sl-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .sl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .sl-table { width: 100%; border-collapse: collapse; }
  .sl-table thead tr { border-bottom: 1px solid var(--border); }
  .sl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'Outfit', sans-serif; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .sl-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .sl-table tbody tr:last-child td { border-bottom: none; }
  .sl-table tbody tr:hover td { background: var(--accent-soft); }

  .sl-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .sl-contact-text { font-size: 0.82rem; color: var(--ink-2); line-height: 1.4; }
  .sl-country-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-soft); color: var(--teal);
    font-size: 0.75rem; font-weight: 500;
    padding: 3px 9px; border-radius: 20px; white-space: nowrap;
  }
  .sl-id-text {
    font-family: 'Outfit', sans-serif; font-size: 0.75rem;
    color: var(--ink-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 2px 7px; display: inline-block;
  }

  .sl-actions { display: flex; gap: 6px; align-items: center; }
  .sl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .sl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .sl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .sl-btn-delete:hover { background: var(--danger-soft); border-color: #f8aba6; }

  .sl-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .sl-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: sl-spin 0.7s linear infinite;
  }
  .sl-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes sl-spin { to { transform: rotate(360deg); } }

  .sl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .sl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .sl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  .sl-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 20px 0 0;
  }
  .sl-page-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); font-family: 'Inter', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-2);
    cursor: pointer; transition: all 0.15s;
  }
  .sl-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .sl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .sl-page-info {
    font-family: 'Outfit', sans-serif; font-size: 0.78rem; color: var(--ink-3); padding: 0 8px;
  }

  .sl-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: sl-fade 0.15s ease;
  }
  @keyframes sl-fade { from { opacity: 0; } to { opacity: 1; } }
  .sl-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 460px;
    margin: 20px; animation: sl-slide 0.2s ease; overflow: hidden;
  }
  @keyframes sl-slide {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .sl-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid var(--border);
  }
  .sl-modal-title {
    font-family: 'Outfit', sans-serif; font-size: 1.3rem;
    font-weight: 400; color: var(--ink); margin: 0;
  }
  .sl-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink-3); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .sl-modal-close:hover { background: var(--surface-2); color: var(--ink); }
  .sl-modal-body { padding: 22px 24px 26px; }
  .sl-field { margin-bottom: 16px; }
  .sl-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .sl-label span { color: var(--accent); margin-left: 2px; }
  .sl-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'Inter', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .sl-input::placeholder { color: var(--ink-3); }
  .sl-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .sl-form-error {
    display: flex; align-items: center; gap: 8px;
    background: var(--danger-soft); border: 1px solid #f8aba6;
    border-radius: 8px; padding: 10px 14px;
    font-size: 0.83rem; color: var(--danger); margin-top: 12px;
  }
  .sl-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .sl-btn-cancel {
    padding: 9px 18px; border: 1px solid var(--border-strong);
    border-radius: 9px; background: var(--surface);
    font-family: 'Inter', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .sl-btn-cancel:hover { background: var(--surface-2); border-color: var(--ink-3); }
  .sl-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #d73211 100%);
    color: white; font-family: 'Inter', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(238,77,45,0.3); transition: all 0.15s;
  }
  .sl-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(238,77,45,0.38); }
  .sl-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .sl-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: sl-spin 0.6s linear infinite;
  }
`;

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    supplierName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supplierService.getSuppliers(page, PAGE_SIZE);
      setSuppliers(data.content ?? (data as unknown as Supplier[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load suppliers';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const openCreate = () => {
    setForm({ supplierName: '', contactPerson: '', email: '', phoneNumber: '', address: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.supplierName.trim()) {
      setFormError('Supplier name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await supplierService.createSupplier(form);
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save supplier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Delete supplier "${supplier.supplierName}"?`)) return;
    try {
      await supplierService.deleteSupplier(supplier.supplierId);
      fetchSuppliers();
    } catch {
      alert('Failed to delete supplier');
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sl-root">
      <style>{css}</style>

      <div className="sl-header">
        <div className="sl-header-left">
          <div className="sl-icon-badge">
            <Truck />
          </div>
          <div>
            <h1 className="sl-title">
              Suppliers
              {totalElements > 0 && (
                <span className="sl-count-pill">{totalElements}</span>
              )}
            </h1>
            <div className="sl-divider" />
            <p className="sl-subtitle" style={{ marginTop: 6 }}>
              Manage detailed supplier information
            </p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="sl-add-btn">
          <Plus size={17} /> Add Supplier
        </button>
      </div>

      {error && <div className="sl-error">⚠ {error}</div>}

      <div className="sl-table-card">
        <div className="sl-table-toolbar">
          <div className="sl-search-wrap">
            <Search />
            <input
              className="sl-search"
              placeholder="Search suppliers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="sl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="sl-loading">
            <div className="sl-spinner" />
            <p className="sl-loading-text">Loading suppliers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sl-empty">
            <div className="sl-empty-icon">
              <Truck size={22} />
            </div>
            <p className="sl-empty-text">No suppliers found</p>
          </div>
        ) : (
          <table className="sl-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.supplierId}>
                  <td>
                    <div>
                      <span className="sl-name-text">{s.supplierName}</span>
                      {s.contactPerson && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--ink-3)',
                            marginTop: 2,
                          }}
                        >
                          {s.contactPerson}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="sl-contact-text">
                      {s.phoneNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Phone size={12} style={{ color: 'var(--ink-3)' }} />
                          {s.phoneNumber}
                        </div>
                      )}
                      {s.email && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <Mail size={12} style={{ color: 'var(--ink-3)' }} />
                          {s.email}
                        </div>
                      )}
                      {!s.phoneNumber && !s.email && (
                        <span style={{ color: 'var(--ink-3)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.83rem',
                        color: 'var(--ink-2)',
                        maxWidth: 200,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.address ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </span>
                  </td>
                  <td>
                    <span className="sl-id-text">#{s.supplierId}</span>
                  </td>
                  <td>
                    <div className="sl-actions">
                      <button
                        type="button"
                        className="sl-btn-delete"
                        title="Delete"
                        onClick={() => handleDelete(s)}
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

      {totalPages > 1 && (
        <div className="sl-pagination">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="sl-page-btn"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="sl-page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="sl-page-btn"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="sl-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="sl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sl-modal-header">
              <h2 className="sl-modal-title">Add Supplier</h2>
              <button
                type="button"
                className="sl-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="sl-modal-body">
              <div className="sl-field">
                <label className="sl-label">
                  Supplier Name <span>*</span>
                </label>
                <input
                  type="text"
                  className="sl-input"
                  value={form.supplierName}
                  onChange={(e) =>
                    setForm({ ...form, supplierName: e.target.value })
                  }
                  placeholder="e.g. FPT Retail"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Contact Person</label>
                <input
                  type="text"
                  className="sl-input"
                  value={form.contactPerson}
                  onChange={(e) =>
                    setForm({ ...form, contactPerson: e.target.value })
                  }
                  placeholder="Nguyen Van A"
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Phone</label>
                <input
                  type="text"
                  className="sl-input"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  placeholder="0901234567"
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Email</label>
                <input
                  type="email"
                  className="sl-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@supplier.com"
                />
              </div>
              <div className="sl-field">
                <label className="sl-label">Address</label>
                <input
                  type="text"
                  className="sl-input"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="123 Street, City"
                />
              </div>
              {formError && (
                <div className="sl-form-error">⚠ {formError}</div>
              )}
              <div className="sl-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="sl-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="sl-btn-save"
                >
                  {isSaving && <span className="sl-save-spinner" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
