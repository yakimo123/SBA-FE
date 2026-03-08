import { Edit, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { BranchResponse, branchService } from '../../services/branchService';

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
