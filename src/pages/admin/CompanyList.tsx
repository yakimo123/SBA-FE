import { Building2, Edit, Mail, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { companyService } from '../../services/companyService';
import { CompanyRequest, CompanyResponse } from '../../types';

const PAGE_SIZE = 20;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .col-root {
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

  .col-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .col-header-left { display: flex; align-items: center; gap: 16px; }
  .col-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .col-icon-badge svg { color: white; width: 24px; height: 24px; }
  .col-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .col-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .col-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .col-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .col-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .col-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .col-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  .col-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .col-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .col-search-wrap { position: relative; display: flex; align-items: center; }
  .col-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .col-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .col-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .col-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .col-table { width: 100%; border-collapse: collapse; }
  .col-table thead tr { border-bottom: 1px solid var(--border); }
  .col-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .col-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .col-table tbody tr:last-child td { border-bottom: none; }
  .col-table tbody tr:hover td { background: var(--accent-soft); }

  .col-company-cell { display: flex; align-items: center; gap: 10px; }
  .col-building-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--teal-soft); display: flex;
    align-items: center; justify-content: center;
    color: var(--teal); flex-shrink: 0;
  }
  .col-building-icon svg { width: 15px; height: 15px; }
  .col-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .col-tax-badge {
    display: inline-flex; align-items: center;
    background: var(--teal-soft); color: var(--teal);
    font-size: 0.75rem; font-weight: 500;
    padding: 2px 8px; border-radius: 5px; margin-top: 4px;
  }
  .col-desc-text { font-size: 0.83rem; color: var(--ink-3); max-width: 280px; }

  .col-actions { display: flex; gap: 6px; align-items: center; }
  .col-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .col-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .col-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .col-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .col-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .col-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: col-spin 0.7s linear infinite;
  }
  .col-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes col-spin { to { transform: rotate(360deg); } }

  .col-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .col-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .col-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  .col-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: col-fade 0.15s ease;
  }
  @keyframes col-fade { from { opacity: 0; } to { opacity: 1; } }
  .col-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 500px;
    margin: 20px; animation: col-slide 0.2s ease; overflow: hidden;
  }
  @keyframes col-slide {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .col-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid var(--border);
  }
  .col-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.3rem;
    font-weight: 400; color: var(--ink); margin: 0;
  }
  .col-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink-3); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .col-modal-close:hover { background: var(--surface-2); color: var(--ink); }
  .col-modal-body { padding: 22px 24px 26px; }
  .col-field { margin-bottom: 16px; }
  .col-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .col-label span { color: var(--accent); margin-left: 2px; }
  .col-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .col-input::placeholder { color: var(--ink-3); }
  .col-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .col-textarea {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    resize: vertical; min-height: 72px; line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .col-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .col-field-error { font-size: 0.78rem; color: var(--danger); margin-top: 4px; }
  .col-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .col-btn-cancel {
    padding: 9px 18px; border: 1px solid var(--border-strong);
    border-radius: 9px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .col-btn-cancel:hover { background: var(--surface-2); border-color: var(--ink-3); }
  .col-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.3); transition: all 0.15s;
  }
  .col-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(201,82,26,0.38); }
  .col-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .col-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: col-spin 0.6s linear infinite;
  }
`;

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);
  const [formData, setFormData] = useState<CompanyRequest>({
    companyName: '',
    taxCode: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = async (searchKeyword = '', p = 0) => {
    try {
      setLoading(true);
      const response = await companyService.search(searchKeyword || undefined, p, PAGE_SIZE);
      setCompanies(response.content ?? []);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(keyword, page);
  }, [page]);

  const handleSearch = () => {
    setPage(0);
    fetchCompanies(keyword, 0);
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      taxCode: '',
      email: '',
      phone: '',
      address: '',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    } else if (formData.companyName.length < 2 || formData.companyName.length > 100) {
      errors.companyName = 'Company name must be between 2 and 100 characters';
    }
    if (!formData.taxCode.trim()) {
      errors.taxCode = 'Tax code is required';
    } else if (formData.taxCode.length > 50) {
      errors.taxCode = 'Tax code must not exceed 50 characters';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email must be valid';
    }
    if (formData.phone && formData.phone.length > 50) {
      errors.phone = 'Phone must not exceed 50 characters';
    }
    if (formData.address && formData.address.length > 500) {
      errors.address = 'Address must not exceed 500 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    resetForm();
    setIsEdit(false);
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: CompanyResponse) => {
    setSelectedCompany(company);
    setFormData({
      companyName: company.companyName,
      taxCode: company.taxCode,
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    });
    setFormErrors({});
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (company: CompanyResponse) => {
    if (!window.confirm(`Are you sure you want to delete "${company.companyName}"?`)) return;
    try {
      await companyService.delete(company.companyId);
      fetchCompanies(keyword, page);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleSubmitCreate = async () => {
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      await companyService.create(formData);
      setIsModalOpen(false);
      resetForm();
      fetchCompanies(keyword, page);
    } catch {
      alert('Failed to create company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!validateForm() || !selectedCompany) return;
    try {
      setSubmitting(true);
      await companyService.update(selectedCompany.companyId, formData);
      setIsModalOpen(false);
      resetForm();
      fetchCompanies(keyword, page);
    } catch {
      alert('Failed to update company. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayList = companies;

  return (
    <div className="col-root">
      <style>{css}</style>

      <div className="col-header">
        <div className="col-header-left">
          <div className="col-icon-badge">
            <Building2 />
          </div>
          <div>
            <h1 className="col-title">
              Companies
              {companies.length > 0 && (
                <span className="col-count-pill">{companies.length}</span>
              )}
            </h1>
            <div className="col-divider" />
            <p className="col-subtitle" style={{ marginTop: 6 }}>
              B2B Customer Management
            </p>
          </div>
        </div>
        <button type="button" onClick={handleCreate} className="col-add-btn">
          <Plus size={17} /> Add Company
        </button>
      </div>

      <div className="col-table-card">
        <div className="col-table-toolbar">
          <div className="col-search-wrap">
            <Search />
            <input
              className="col-search"
              placeholder="Search companies by name…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <span className="col-table-meta">
            {displayList.length} result{displayList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="col-loading">
            <div className="col-spinner" />
            <p className="col-loading-text">Loading companies…</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="col-empty">
            <div className="col-empty-icon">
              <Building2 size={22} />
            </div>
            <p className="col-empty-text">No companies found</p>
          </div>
        ) : (
          <table className="col-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((c) => (
                <tr key={c.companyId}>
                  <td>
                    <div className="col-company-cell">
                      <div className="col-building-icon">
                        <Building2 />
                      </div>
                      <div>
                        <span className="col-name-text">{c.companyName}</span>
                        <div className="col-tax-badge">Tax: {c.taxCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} style={{ color: 'var(--ink-3)' }} />
                        {c.email}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ink-3)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {c.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} style={{ color: 'var(--ink-3)' }} />
                        {c.phone}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--ink-3)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className="col-desc-text" title={c.address ?? ''}>
                      {c.address ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                    </span>
                  </td>
                  <td>
                    <div className="col-actions">
                      <button
                        type="button"
                        className="col-btn-edit"
                        title="Edit"
                        onClick={() => handleEdit(c)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="col-btn-delete"
                        title="Delete"
                        onClick={() => handleDelete(c)}
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

      {isModalOpen && (
        <div
          className="col-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="col-modal" onClick={(e) => e.stopPropagation()}>
            <div className="col-modal-header">
              <h2 className="col-modal-title">
                {isEdit ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button
                type="button"
                className="col-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="col-modal-body">
              <div className="col-field">
                <label className="col-label">Company Name <span>*</span></label>
                <input
                  type="text"
                  className="col-input"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Enter company name"
                />
                {formErrors.companyName && (
                  <p className="col-field-error">{formErrors.companyName}</p>
                )}
              </div>
              <div className="col-field">
                <label className="col-label">Tax Code <span>*</span></label>
                <input
                  type="text"
                  className="col-input"
                  value={formData.taxCode}
                  onChange={(e) =>
                    setFormData({ ...formData, taxCode: e.target.value })
                  }
                  placeholder="Enter tax code"
                />
                {formErrors.taxCode && (
                  <p className="col-field-error">{formErrors.taxCode}</p>
                )}
              </div>
              <div className="col-field">
                <label className="col-label">Email</label>
                <input
                  type="email"
                  className="col-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
                {formErrors.email && (
                  <p className="col-field-error">{formErrors.email}</p>
                )}
              </div>
              <div className="col-field">
                <label className="col-label">Phone</label>
                <input
                  type="text"
                  className="col-input"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
                {formErrors.phone && (
                  <p className="col-field-error">{formErrors.phone}</p>
                )}
              </div>
              <div className="col-field">
                <label className="col-label">Address</label>
                <textarea
                  className="col-textarea"
                  rows={3}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
                {formErrors.address && (
                  <p className="col-field-error">{formErrors.address}</p>
                )}
              </div>
              <div className="col-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="col-btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isEdit ? handleSubmitEdit : handleSubmitCreate}
                  disabled={submitting}
                  className="col-btn-save"
                >
                  {submitting && <span className="col-save-spinner" />}
                  {isEdit ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
