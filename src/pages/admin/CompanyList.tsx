import {
  Building2,
  Edit,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { companyService } from '../../services/companyService';
import { CompanyRequest, CompanyResponse, CompanyStatus } from '../../types';

const PAGE_SIZE = 20;

const css = `
  

  .col-root {
    font-family: 'Inter', sans-serif;
    background: #f3f4f6;
    min-height: 100vh;
    color: #1a1612;
    padding: 32px;
  }

  .col-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .col-header-left { display: flex; align-items: center; gap: 16px; }
  .col-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #ee4d2d 0%, #d73211 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(238,77,45,0.35); flex-shrink: 0;
  }
  .col-icon-badge svg { color: white; width: 24px; height: 24px; }
  .col-title {
    font-family: 'Outfit', sans-serif; font-size: 2rem;
    font-weight: 400; color: #1a1612; line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .col-count-pill {
    display: inline-flex; align-items: center;
    background: #fff1f0; color: #ee4d2d;
    font-family: 'Outfit', sans-serif; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .col-subtitle { font-size: 0.875rem; color: #9c9085; margin: 0; }
  .col-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, #ee4d2d 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .col-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #ee4d2d 0%, #d73211 100%);
    color: white; border: none; border-radius: 10px;
    font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(238,77,45,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .col-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(238,77,45,0.38); }

  .col-error {
    display: flex; align-items: center; gap: 10px;
    background: #fdf2f2; border: 1px solid #f8aba6;
    border-left: 3px solid #b03030; color: #b03030;
    border-radius: 10px; padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  .col-table-card {
    background: #ffffff; border: 1px solid #e8e3da;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    overflow: hidden;
  }
  .col-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #e8e3da;
    background: #faf9f7;
  }
  .col-search-wrap { position: relative; display: flex; align-items: center; }
  .col-search-wrap svg {
    position: absolute; left: 10px; color: #9c9085;
    width: 14px; height: 14px; pointer-events: none;
  }
  .col-search {
    padding: 7px 12px 7px 32px; border: 1px solid #e8e3da;
    border-radius: 8px; background: #ffffff;
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    color: #1a1612; outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .col-search:focus { border-color: #ee4d2d; box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .col-table-meta { font-size: 0.8rem; color: #9c9085; }

  .col-table { width: 100%; border-collapse: collapse; }
  .col-table thead tr { border-bottom: 1px solid #e8e3da; }
  .col-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'Outfit', sans-serif; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: #9c9085; background: #faf9f7;
  }
  .col-table td {
    padding: 14px 20px; border-bottom: 1px solid #e8e3da;
    vertical-align: middle; transition: background 0.12s;
  }
  .col-table tbody tr:last-child td { border-bottom: none; }
  .col-table tbody tr:hover td { background: #fff1f0; }

  .col-company-cell { display: flex; align-items: center; gap: 10px; }
  .col-building-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: #e8f5f3; display: flex;
    align-items: center; justify-content: center;
    color: #1a7a6e; flex-shrink: 0;
  }
  .col-building-icon svg { width: 15px; height: 15px; }
  .col-name-text { font-weight: 600; color: #1a1612; font-size: 0.88rem; }
  .col-tax-badge {
    display: inline-flex; align-items: center;
    background: #e8f5f3; color: #1a7a6e;
    font-size: 0.75rem; font-weight: 500;
    padding: 2px 8px; border-radius: 5px; margin-top: 4px;
  }

  .col-actions { display: flex; gap: 6px; align-items: center; }
  .col-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid #e8e3da; background: #ffffff;
    color: #ee4d2d; cursor: pointer; transition: all 0.15s;
  }
  .col-btn-edit:hover { background: #fff1f0; border-color: #ee4d2d; }
  .col-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid #e8e3da; background: #ffffff;
    color: #b03030; cursor: pointer; transition: all 0.15s;
  }
  .col-btn-delete:hover { background: #fdf2f2; border-color: #f8aba6; }

  .col-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .col-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid #e8e3da; border-top-color: #ee4d2d;
    animation: col-spin 0.7s linear infinite;
  }
  .col-loading-text { font-size: 0.875rem; color: #9c9085; }
  @keyframes col-spin { to { transform: rotate(360deg); } }

  .col-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .col-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: #faf9f7; border: 1px solid #e8e3da;
    display: flex; align-items: center; justify-content: center; color: #9c9085;
  }
  .col-empty-text { font-size: 0.9rem; color: #9c9085; margin: 0; }

  .col-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: col-fade 0.15s ease;
  }
  @keyframes col-fade { from { opacity: 0; } to { opacity: 1; } }
  .col-modal {
    background: #ffffff; border-radius: 16px;
    box-shadow: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    width: 100%; max-width: 500px;
    margin: 20px; animation: col-slide 0.2s ease; overflow: hidden;
  }
  @keyframes col-slide {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .col-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid #e8e3da;
  }
  .col-modal-title {
    font-family: 'Outfit', sans-serif; font-size: 1.3rem;
    font-weight: 400; color: #1a1612; margin: 0;
  }
  .col-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #e8e3da; background: transparent;
    color: #9c9085; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .col-modal-close:hover { background: #faf9f7; color: #1a1612; }
  .col-modal-body { padding: 22px 24px 26px; }
  .col-field { margin-bottom: 16px; }
  .col-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: #5c5347; margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .col-label span { color: #ee4d2d; margin-left: 2px; }
  .col-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid #c9bfad; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-size: 0.9rem;
    color: #1a1612; background: #ffffff; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .col-input::placeholder { color: #9c9085; }
  .col-input:focus { border-color: #ee4d2d; box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .col-textarea {
    width: 100%; padding: 10px 14px;
    border: 1px solid #c9bfad; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-size: 0.9rem;
    color: #1a1612; background: #ffffff; outline: none;
    resize: vertical; min-height: 72px; line-height: 1.6;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .col-textarea:focus { border-color: #ee4d2d; box-shadow: 0 0 0 3px rgba(238,77,45,0.12); }
  .col-field-error { font-size: 0.78rem; color: #b03030; margin-top: 4px; }
  .col-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .col-btn-cancel {
    padding: 9px 18px; border: 1px solid #c9bfad;
    border-radius: 9px; background: #ffffff;
    font-family: 'Inter', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: #5c5347; cursor: pointer; transition: all 0.15s;
  }
  .col-btn-cancel:hover { background: #faf9f7; border-color: #9c9085; }
  .col-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, #ee4d2d 0%, #d73211 100%);
    color: white; font-family: 'Inter', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(238,77,45,0.3); transition: all 0.15s;
  }
  .col-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(238,77,45,0.38); }
  .col-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .col-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: col-spin 0.6s linear infinite;
  }

  .col-section-card {
    padding: 16px; background: #ffffff; border-radius: 12px;
    border: 1px solid #f3f4f6; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .col-section-title {
    font-size: 0.875rem; font-weight: 700; color: #1f2937;
    margin-bottom: 16px; border-bottom: 1px solid #f3f4f6;
    padding-bottom: 8px; display: flex; align-items: center; gap: 8px;
  }
`;

// Status Badge Component
const StatusBadge = ({ status }: { status: CompanyStatus }) => {
  const map: Record<
    CompanyStatus,
    { bg: string; color: string; border: string }
  > = {
    PENDING: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
    APPROVED: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
    REJECTED: { bg: '#ffe4e6', color: '#9f1239', border: '#fecdd3' },
    NEED_DOCUMENTS: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  };
  const s = map[status];
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: '0.65rem',
        fontWeight: 700,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {status}
    </span>
  );
};

export function CompanyList() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponse | null>(null);

  const [formData, setFormData] = useState<CompanyRequest>({
    companyName: '',
    taxCode: '',
    email: '',
    phone: '',
    address: '',
    representativeName: '',
    representativePosition: '',
    foundingDate: '',
    businessType: '',
    employeeCount: 0,
    industry: '',
    logoUrl: '',
    status: 'PENDING',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = async (searchKeyword = '', p = 0) => {
    try {
      setLoading(true);
      const data = await companyService.search(
        searchKeyword || undefined,
        p,
        PAGE_SIZE
      );
      setCompanies(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Fetch companies error:', err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(keyword, page);
  }, [keyword, page]);

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
      representativeName: '',
      representativePosition: '',
      foundingDate: '',
      businessType: '',
      employeeCount: 0,
      industry: '',
      logoUrl: '',
      status: 'PENDING',
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    } else if (
      formData.companyName.length < 2 ||
      formData.companyName.length > 100
    ) {
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
      representativeName: company.representativeName || '',
      representativePosition: company.representativePosition || '',
      foundingDate: company.foundingDate || '',
      businessType: company.businessType || '',
      employeeCount: company.employeeCount || 0,
      industry: company.industry || '',
      logoUrl: company.logoUrl || '',
      status: company.status || 'PENDING',
    });
    setFormErrors({});
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (company: CompanyResponse) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${company.companyName}"?`
      )
    )
      return;
    try {
      await companyService.delete(company.companyId);
      fetchCompanies(keyword, page);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleUpdateStatus = async (id: number, status: CompanyStatus) => {
    try {
      await companyService.updateStatus(id, status);
      fetchCompanies(keyword, page);
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update company status');
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
            {companies.length} result{companies.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="col-loading">
            <div className="col-spinner" />
            <p className="col-loading-text">Loading companies…</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="col-empty">
            <div className="col-empty-icon">
              <Building2 size={22} />
            </div>
            <p className="col-empty-text">No companies found</p>
          </div>
        ) : (
          <>
            <table className="col-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Representative</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.companyId}>
                    <td>
                      <div className="col-company-cell">
                        <div className="col-building-icon">
                          {c.logoUrl ? (
                            <img
                              src={c.logoUrl}
                              alt="Logo"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 4,
                              }}
                            />
                          ) : (
                            <Building2 />
                          )}
                        </div>
                        <div>
                          <span className="col-name-text">{c.companyName}</span>
                          <div className="col-tax-badge">Tax: {c.taxCode}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#1a1612',
                        }}
                      >
                        {c.representativeName || '—'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontStyle: 'italic',
                        }}
                      >
                        {c.representativePosition || 'No Position'}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <StatusBadge status={c.status} />
                        <select
                          value={c.status}
                          onChange={(e) =>
                            handleUpdateStatus(
                              c.companyId,
                              e.target.value as CompanyStatus
                            )
                          }
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e8e3da',
                            background: '#faf9f7',
                            color: '#1a1612',
                            cursor: 'pointer',
                            outline: 'none',
                            width: 'fit-content',
                          }}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="NEED_DOCUMENTS">NEED DOCUMENTS</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        {c.email && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '0.8rem',
                              color: '#4b5563',
                            }}
                          >
                            <Mail size={12} style={{ color: '#9ca3af' }} />
                            {c.email}
                          </div>
                        )}
                        {c.phone && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '0.8rem',
                              color: '#4b5563',
                            }}
                          >
                            <Phone size={12} style={{ color: '#9ca3af' }} />
                            {c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#5c5347' }}>
                        {c.industry || '—'}
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

            {totalPages > 1 && (
              <div
                style={{
                  padding: '16px 20px',
                  background: '#f9fafb',
                  borderTop: '1px solid #e8e3da',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#9c9085' }}>
                  Page {page + 1} of {totalPages} ({totalElements} items)
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #e8e3da',
                      borderRadius: 6,
                      background: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      opacity: page === 0 ? 0.5 : 1,
                    }}
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <button
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #e8e3da',
                      borderRadius: 6,
                      background: '#fff',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      opacity: page >= totalPages - 1 ? 0.5 : 1,
                    }}
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div
          className="col-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="col-modal"
            style={{ maxWidth: 850 }}
            onClick={(e) => e.stopPropagation()}
          >
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
            <div
              className="col-modal-body"
              style={{ background: 'rgba(250,249,247,0.5)' }}
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="col-section-card">
                    <h3 className="col-section-title">
                      <Building2 size={16} /> Basic Information
                    </h3>
                    <div className="col-field">
                      <label className="col-label">
                        Company Name <span>*</span>
                      </label>
                      <input
                        type="text"
                        className="col-input"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        placeholder="Enter legal company name"
                      />
                      {formErrors.companyName && (
                        <p className="col-field-error">
                          {formErrors.companyName}
                        </p>
                      )}
                    </div>
                    <div className="col-field">
                      <label className="col-label">
                        Tax Code <span>*</span>
                      </label>
                      <input
                        type="text"
                        className="col-input"
                        value={formData.taxCode}
                        onChange={(e) =>
                          setFormData({ ...formData, taxCode: e.target.value })
                        }
                        placeholder="Tax Identification Number"
                      />
                      {formErrors.taxCode && (
                        <p className="col-field-error">{formErrors.taxCode}</p>
                      )}
                    </div>
                    <div className="col-field">
                      <label className="col-label">Industry</label>
                      <input
                        type="text"
                        className="col-input"
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                        placeholder="e.g. IT, Manufacturing"
                      />
                    </div>
                  </div>

                  <div className="col-section-card">
                    <h3 className="col-section-title">
                      <Search size={16} /> Business Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-field">
                        <label className="col-label">Status</label>
                        <select
                          className="col-input"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as CompanyStatus,
                            })
                          }
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="NEED_DOCUMENTS">NEED DOCUMENTS</option>
                        </select>
                      </div>
                      <div className="col-field">
                        <label className="col-label">Founding Date</label>
                        <input
                          type="date"
                          className="col-input"
                          value={formData.foundingDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              foundingDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-field">
                        <label className="col-label">Employee Count</label>
                        <input
                          type="number"
                          className="col-input"
                          value={formData.employeeCount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeCount: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="col-field">
                        <label className="col-label">Business Type</label>
                        <select
                          className="col-input"
                          value={formData.businessType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              businessType: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Type</option>
                          <option value="Trách nhiệm hữu hạn">TNHH</option>
                          <option value="Cổ phần">Cổ phần</option>
                          <option value="Tư nhân">DNTN</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="col-section-card">
                    <h3 className="col-section-title">
                      <Phone size={16} /> Contact & Representative
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-field">
                        <label className="col-label">
                          Email <span>*</span>
                        </label>
                        <input
                          type="email"
                          className="col-input"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Contact email"
                        />
                        {formErrors.email && (
                          <p className="col-field-error">{formErrors.email}</p>
                        )}
                      </div>
                      <div className="col-field">
                        <label className="col-label">
                          Phone <span>*</span>
                        </label>
                        <input
                          type="text"
                          className="col-input"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="Phone number"
                        />
                        {formErrors.phone && (
                          <p className="col-field-error">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-field">
                        <label className="col-label">Rep. Name</label>
                        <input
                          type="text"
                          className="col-input"
                          value={formData.representativeName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              representativeName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-field">
                        <label className="col-label">Rep. Position</label>
                        <input
                          type="text"
                          className="col-input"
                          value={formData.representativePosition}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              representativePosition: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-field">
                      <label className="col-label">Address</label>
                      <textarea
                        className="col-textarea"
                        rows={2}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Headquarters address"
                      />
                    </div>
                  </div>

                  <div className="col-section-card">
                    <h3 className="col-section-title">
                      <Plus size={16} /> Assets
                    </h3>
                    <div className="col-field">
                      <label className="col-label">Logo URL</label>
                      <input
                        type="text"
                        className="col-input"
                        value={formData.logoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, logoUrl: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
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
