import { Edit, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { brandService } from '../../services/brandService';
import { Brand } from '../../types/product';

export function TrademarkList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({ brandName: '', country: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await brandService.getBrands(page, PAGE_SIZE);
      setBrands(data.content ?? (data as unknown as Brand[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load brands';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ brandName: '', country: '', description: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      brandName: brand.brandName,
      country: brand.country ?? '',
      description: brand.description ?? '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.brandName.trim()) {
      setFormError('Brand name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.brandId, form);
      } else {
        await brandService.createBrand(form);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save brand';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Delete brand "${brand.brandName}"?`)) return;
    try {
      await brandService.deleteBrand(brand.brandId);
      fetchBrands();
    } catch {
      alert('Failed to delete brand');
    }
  };

  const columns: Column<Brand>[] = [
    {
      header: 'Trademark',
      accessor: 'brandName',
      render: (b) => <span className="font-medium text-purple-900">{b.brandName}</span>,
    },
    { header: 'Country', accessor: 'country', render: (b) => <span>{b.country ?? '—'}</span> },
    {
      header: 'Description',
      accessor: 'description',
      render: (b) => <span className="text-sm text-gray-600">{b.description ?? '—'}</span>,
    },
    {
      header: 'Actions',
      accessor: 'brandId',
      sortable: false,
      render: (b) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(b)}
            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(b)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Trademarks</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage brands and trademarks
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
          <Plus className="h-5 w-5" /> Add Trademark
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
        <DataTable columns={columns} data={brands} keyField="brandId" pageSize={PAGE_SIZE} />
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Edit Trademark' : 'Add Trademark'}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              placeholder="e.g. Samsung"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. South Korea"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brand description..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
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
              {editingBrand ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
