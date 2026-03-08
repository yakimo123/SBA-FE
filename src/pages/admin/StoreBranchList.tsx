import { Edit, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { BranchResponse, branchService } from '../../services/branchService';

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
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchResponse | null>(null);
  const [form, setForm] = useState({
    branchName: '',
    location: '',
    managerName: '',
    contactNumber: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await branchService.getBranches({ page, size: PAGE_SIZE });
      setBranches(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load branches';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const openCreate = () => {
    setEditingBranch(null);
    setForm({ branchName: '', location: '', managerName: '', contactNumber: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (branch: BranchResponse) => {
    setEditingBranch(branch);
    setForm({
      branchName: branch.branchName,
      location: branch.location,
      managerName: branch.managerName,
      contactNumber: branch.contactNumber,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.branchName.trim()) {
      setFormError('Branch name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.branchId, form);
      } else {
        await branchService.createBranch(form);
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save branch';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (branch: BranchResponse) => {
    if (!window.confirm(`Delete branch "${branch.branchName}"?`)) return;
    try {
      await branchService.deleteBranch(branch.branchId);
      fetchBranches();
    } catch {
      alert('Failed to delete branch');
    }
  };

  const columns: Column<BranchResponse>[] = [
    { header: 'Branch Name', accessor: 'branchName', render: (s) => <span className="font-medium text-purple-900">{s.branchName}</span> },
    { header: 'Address', accessor: 'location', render: (s) => <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-gray-400"/> {s.location}</div> },
    { header: 'Phone', accessor: 'contactNumber', render: (s) => <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-gray-400"/> {s.contactNumber}</div> },
    { header: 'Manager', accessor: 'managerName' },
    {
      header: 'Actions',
      accessor: 'branchId',
      sortable: false,
      render: (s) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50" title="Edit"><Edit className="h-4 w-4" /></button>
          <button type="button" onClick={() => handleDelete(s)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Store Branches</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage physical store locations
            {totalElements > 0 && (
              <span className="ml-2 text-sm text-gray-400">({totalElements} total)</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" /> Add New Branch
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={branches} keyField="branchId" pageSize={PAGE_SIZE} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-['Fira_Sans'] text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBranch ? 'Edit Branch' : 'Add Branch'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              placeholder="e.g. Hanoi Branch"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="123 Ba Dinh, Hanoi"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Manager Name</label>
              <input
                type="text"
                value={form.managerName}
                onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                placeholder="Tran Van B"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="0912345678"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
          </div>
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {editingBranch ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
