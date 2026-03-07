import { Edit, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Modal } from '../../components/admin/Modal';
import { Column, DataTable } from '../../components/admin/DataTable';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types/product';

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ categoryName: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories(page, PAGE_SIZE);
      setCategories(data.content ?? (data as unknown as Category[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    if (!form.categoryName.trim()) {
      setFormError('Category name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.categoryId, form);
      } else {
        await categoryService.createCategory(form);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.categoryName}"?`)) return;
    try {
      await categoryService.deleteCategory(cat.categoryId);
      fetchCategories();
    } catch {
      alert('Failed to delete category');
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Name',
      accessor: 'categoryName',
      render: (cat) => <span className="font-medium text-purple-900">{cat.categoryName}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (cat) => <span className="text-gray-600 text-sm">{cat.description ?? '—'}</span>,
    },
    {
      header: 'Actions',
      accessor: 'categoryId',
      sortable: false,
      render: (cat) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(cat)}
            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(cat)}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Categories</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage product categories
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
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={categories} keyField="categoryId" pageSize={PAGE_SIZE} />
      )}

      {/* Server-side Pagination */}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.categoryName}
              onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
              placeholder="e.g. Smartphones"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Category description..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
