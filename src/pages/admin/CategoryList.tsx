import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { FILE_TYPES } from '../../constants/FILE_TYPES';
import { categoryService } from '../../services/categoryService';
import { mediaService } from '../../services/mediaService';
import { Category } from '../../types/product';

const PAGE_SIZE = 10;

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    categoryName: '',
    description: '',
    imageUrl: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getCategories(page, PAGE_SIZE);
      setCategories(data.content ?? (data as unknown as Category[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ categoryName: '', description: '', imageUrl: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      categoryName: cat.categoryName,
      description: cat.description ?? '',
      imageUrl: cat.imageUrl ?? '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormError(null);
    try {
      const publicUrl = await mediaService.uploadFile(
        file,
        FILE_TYPES.CATEGORY
      );
      setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to upload image'
      );
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.categoryName.trim()) {
      setFormError('Category name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        categoryName: form.categoryName,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
      };

      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory.categoryId,
          payload
        );
      } else {
        await categoryService.createCategory(payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save category'
      );
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

  const filtered = categories.filter(
    (c) =>
      c.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-8 font-sans text-[#1a1612]">
      {/* ── Header ── */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#c9521a] to-[#e07040] text-white shadow-lg shadow-[#c9521a]/35">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-[#1a1612]">
              Categories
              {totalElements > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#eeecf8] px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide text-[#4a3f8f]">
                  {totalElements}
                </span>
              )}
            </h1>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-linear-to-r from-[#c9521a] to-transparent ml-[1px]" />
            <p className="mt-1.5 text-sm text-[#9c9085]">
              Manage product categories
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-linear-to-br from-[#c9521a] to-[#e07040] px-5 py-2.5 text-[0.9rem] font-semibold text-white shadow-md shadow-[#c9521a]/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-[#c9521a]/38 active:translate-y-0"
        >
          <Plus size={17} /> Add Category
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-[#f5c2c2] border-l-3 border-l-[#b03030] bg-[#fdf2f2] px-4 py-3 text-sm text-[#b03030]">
          ⚠ {error}
        </div>
      )}

      {/* ── Table card ── */}
      <div className="overflow-hidden rounded-2xl border border-[#e8e3da] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e8e3da] bg-[#faf9f7] px-5 py-4">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#9c9085]" />
            <input
              className="w-[220px] rounded-lg border border-[#e8e3da] bg-white py-1.5 pl-8 pr-3 text-[0.85rem] text-[#1a1612] outline-hidden transition-all focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-[0.8rem] text-[#9c9085]">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-9 w-9 animate-spin text-[#c9521a]" />
            <p className="text-sm text-[#9c9085]">Loading categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e8e3da] bg-[#faf9f7] text-[#9c9085]">
              <FolderOpen size={22} />
            </div>
            <p className="text-[0.9rem] text-[#9c9085]">No categories found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e8e3da]">
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Category
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Description
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  ID
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr
                  key={cat.categoryId}
                  className="group border-bottom border-[#e8e3da] last:border-bottom-0 hover:bg-[#fdf1eb]/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#eeecf8] text-[#4a3f8f] overflow-hidden">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderOpen size={18} />
                        )}
                      </div>
                      <span className="text-[0.88rem] font-semibold text-[#1a1612]">
                        {cat.categoryName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="line-clamp-2 max-w-[340px] text-[0.83rem] leading-relaxed text-[#9c9085]">
                      {cat.description ?? (
                        <span className="text-[#9c9085]/60">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block rounded-md border border-[#e8e3da] bg-[#faf9f7] px-2 py-0.5 font-mono text-[0.75rem] text-[#9c9085]">
                      #{cat.categoryId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 align-center">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#4a3f8f] transition-all hover:border-[#4a3f8f] hover:bg-[#eeecf8]"
                        title="Edit"
                        onClick={() => openEdit(cat)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#b03030] transition-all hover:border-[#f5c2c2] hover:bg-[#fdf2f2]"
                        title="Delete"
                        onClick={() => handleDelete(cat)}
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg border border-[#e8e3da] bg-white px-3.5 py-1.5 text-[0.85rem] font-medium text-[#5c5347] transition-all hover:not-disabled:border-[#c9521a] hover:not-disabled:bg-[#fdf1eb] hover:not-disabled:text-[#c9521a] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="px-2 font-mono text-[0.78rem] text-[#9c9085]">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border border-[#e8e3da] bg-white px-3.5 py-1.5 text-[0.85rem] font-medium text-[#5c5347] transition-all hover:not-disabled:border-[#c9521a] hover:not-disabled:bg-[#fdf1eb] hover:not-disabled:text-[#c9521a] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-[#1a1612]/45 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="m-5 w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e8e3da] px-6 py-4.5">
              <h2 className="font-serif text-xl text-[#1a1612]">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] text-[1.1rem] text-[#9c9085] transition-all hover:bg-[#faf9f7] hover:text-[#1a1612]"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5.5">
              {/* Image Upload Area */}
              <div className="mb-5">
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Category Image
                </label>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8e3da] bg-[#faf9f7]">
                    {form.imageUrl ? (
                      <>
                        <img
                          src={form.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, imageUrl: '' }))
                          }
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1612]/60 text-white backdrop-blur-xs transition-colors hover:bg-[#b03030]"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-[#9c9085]">
                        <ImageIcon size={20} />
                        <span className="mt-1 text-[0.65rem]">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-center">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#c9bfad] bg-[#faf9f7] px-4 py-3 text-[0.8rem] font-medium text-[#c9521a] transition-all hover:border-[#c9521a]/50 hover:bg-[#fdf1eb]">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Choose Image
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="mt-1.5 text-[0.7rem] leading-relaxed text-[#9c9085]">
                      Support JPG, PNG, WEBP. Max size 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Category Name <span className="text-[#c9521a]">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2.5 text-[0.9rem] text-[#1a1612] outline-hidden transition-all placeholder:text-[#9c9085] focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                  autoFocus
                  value={form.categoryName}
                  onChange={(e) =>
                    setForm({ ...form, categoryName: e.target.value })
                  }
                  placeholder="e.g. Smartphones"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-[#1a1612] outline-hidden transition-all placeholder:text-[#9c9085] focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short description of this category…"
                />
              </div>

              {formError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#f5c2c2] bg-[#fdf2f2] px-3.5 py-2.5 text-[0.83rem] text-[#b03030]">
                  ⚠ {formError}
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#c9bfad] bg-white px-4.5 py-2.5 text-[0.88rem] font-medium text-[#5c5347] transition-all hover:border-[#9c9085] hover:bg-[#faf9f7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-br from-[#c9521a] to-[#e07040] px-5 py-2.5 text-[0.88rem] font-semibold text-white shadow-md shadow-[#c9521a]/30 transition-all hover:not-disabled:-translate-y-px hover:not-disabled:shadow-lg hover:not-disabled:shadow-[#c9521a]/38 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
