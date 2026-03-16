import { Edit, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { productService } from '../../services/productService';
import { WarrantyDTO,warrantyService } from '../../services/warrantyService';
import { Product } from '../../types/product';

export function GuaranteeList() {
  // ── Product search state ──
  const [productKeyword, setProductKeyword] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Warranty list state ──
  const [warranties, setWarranties] = useState<WarrantyDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<WarrantyDTO | null>(null);
  const [form, setForm] = useState({
    warrantyPeriodMonths: '',
    warrantyTerms: '',
    startDate: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ── Product search (debounced) ──
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!productKeyword.trim()) {
      setProductResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await productService.getProducts({ keyword: productKeyword, size: 10 });
        setProductResults(data.content ?? []);
        setShowDropdown(true);
      } catch {
        setProductResults([]);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [productKeyword]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductKeyword(product.productName);
    setShowDropdown(false);
    setPage(0);
  };

  // ── Fetch warranties for selected product ──
  const fetchWarranties = useCallback(async () => {
    if (!selectedProduct) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await warrantyService.getProductWarranties(selectedProduct.productId, {
        page,
        size: PAGE_SIZE,
      });
      setWarranties(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load warranties';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProduct, page]);

  useEffect(() => {
    if (selectedProduct) {
      fetchWarranties();
    }
  }, [fetchWarranties, selectedProduct]);

  // ── Modal handlers ──
  const openCreate = () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }
    setEditingWarranty(null);
    setForm({ warrantyPeriodMonths: '', warrantyTerms: '', startDate: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (warranty: WarrantyDTO) => {
    setEditingWarranty(warranty);
    setForm({
      warrantyPeriodMonths: String(warranty.warrantyPeriodMonths),
      warrantyTerms: warranty.warrantyTerms,
      startDate: warranty.startDate ? warranty.startDate.substring(0, 10) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.warrantyPeriodMonths || Number(form.warrantyPeriodMonths) <= 0) {
      setFormError('Warranty period (months) is required');
      return;
    }
    if (!form.startDate) {
      setFormError('Start date is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const productId = editingWarranty ? editingWarranty.productId : selectedProduct!.productId;
      const payload = {
        productId,
        warrantyPeriodMonths: Number(form.warrantyPeriodMonths),
        warrantyTerms: form.warrantyTerms,
        startDate: new Date(form.startDate).toISOString(),
      };
      if (editingWarranty) {
        await warrantyService.updateWarranty(editingWarranty.warrantyId, payload);
      } else {
        await warrantyService.createWarranty(payload);
      }
      setIsModalOpen(false);
      fetchWarranties();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save warranty';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (warranty: WarrantyDTO) => {
    if (!window.confirm(`Delete warranty for "${warranty.productName}"?`)) return;
    try {
      await warrantyService.deleteWarranty(warranty.warrantyId);
      fetchWarranties();
    } catch {
      alert('Failed to delete warranty');
    }
  };

  // ── Helpers ──
  const isActive = (endDate: string) => new Date(endDate) > new Date();

  const columns: Column<WarrantyDTO>[] = [
    { header: 'Policy Name', accessor: 'productName', render: (g) => <div className="font-medium text-purple-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-purple-500"/> {g.productName}</div> },
    { header: 'Duration', accessor: 'warrantyPeriodMonths', render: (g) => <span>{g.warrantyPeriodMonths} Months</span> },
    { header: 'Start Date', accessor: 'startDate', render: (g) => <span className="text-sm">{g.startDate ? new Date(g.startDate).toLocaleDateString() : '—'}</span> },
    { header: 'End Date', accessor: 'endDate', render: (g) => <span className="text-sm">{g.endDate ? new Date(g.endDate).toLocaleDateString() : '—'}</span> },
    { header: 'Coverage', accessor: 'warrantyTerms', render: (g) => <span className="text-gray-600 text-sm max-w-xs truncate block">{g.warrantyTerms}</span> },
    {
      header: 'Status',
      accessor: 'endDate' as keyof WarrantyDTO,
      render: (g) => {
        const active = isActive(g.endDate);
        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {active ? 'Active' : 'Expired'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'warrantyId',
      sortable: false,
      render: (g) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(g)} className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50" title="Edit"><Edit className="h-4 w-4" /></button>
          <button type="button" onClick={() => handleDelete(g)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Guarantee Policies</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage warranty and guarantee terms
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
          <Plus className="h-5 w-5" /> Add Policy
        </button>
      </div>

      {/* Product selector */}
      <div className="relative">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Select Product</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={productKeyword}
            onChange={(e) => {
              setProductKeyword(e.target.value);
              if (selectedProduct && e.target.value !== selectedProduct.productName) {
                setSelectedProduct(null);
                setWarranties([]);
                setTotalElements(0);
                setTotalPages(0);
              }
            }}
            placeholder="Search products by name..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
        {showDropdown && productResults.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {productResults.map((p) => (
              <li
                key={p.productId}
                onClick={() => selectProduct(p)}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-purple-50"
              >
                <span className="font-medium text-purple-900">{p.productName}</span>
                {p.categoryName && <span className="ml-2 text-xs text-gray-500">({p.categoryName})</span>}
              </li>
            ))}
          </ul>
        )}
        {showDropdown && productResults.length === 0 && productKeyword.trim() && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
            No products found
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!selectedProduct ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-16 text-gray-500">
          <ShieldCheck className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-['Fira_Sans'] text-sm">Select a product above to view its warranty policies</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={warranties} keyField="warrantyId" pageSize={PAGE_SIZE} />
      )}

      {selectedProduct && totalPages > 1 && (
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWarranty ? 'Edit Warranty' : 'Add Warranty'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Product</label>
            <input
              type="text"
              value={editingWarranty ? editingWarranty.productName : (selectedProduct?.productName ?? '')}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Period (Months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.warrantyPeriodMonths}
                onChange={(e) => setForm({ ...form, warrantyPeriodMonths: e.target.value })}
                placeholder="e.g. 24"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Warranty Terms / Coverage</label>
            <textarea
              value={form.warrantyTerms}
              onChange={(e) => setForm({ ...form, warrantyTerms: e.target.value })}
              placeholder="Covers manufacturing defects..."
              rows={3}
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
              {editingWarranty ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
