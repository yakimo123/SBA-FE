import {
  Award,
  ChevronLeft,
  ChevronRight,
  Edit,
  Globe,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { FILE_TYPES } from '../../constants/FILE_TYPES';
import { brandService } from '../../services/brandService';
import { mediaService } from '../../services/mediaService';
import { Brand } from '../../types/product';

const PAGE_SIZE = 10;

// Generate initials avatar letter(s) from brand name
const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function TrademarkList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState({
    brandName: '',
    country: '',
    description: '',
    logoUrl: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await brandService.getBrands(page, PAGE_SIZE);
      setBrands(data.content ?? (data as unknown as Brand[]));
      setTotalPages((data as { totalPages?: number }).totalPages ?? 1);
      setTotalElements((data as { totalElements?: number }).totalElements ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ brandName: '', country: '', description: '', logoUrl: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      brandName: brand.brandName,
      country: brand.country ?? '',
      description: brand.description ?? '',
      logoUrl: brand.logoUrl ?? '',
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
      const publicUrl = await mediaService.uploadFile(file, FILE_TYPES.BRAND);
      setForm((prev) => ({ ...prev, logoUrl: publicUrl }));
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to upload logo'
      );
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.brandName.trim()) {
      setFormError('Brand name is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        brandName: form.brandName,
        country: form.country || undefined,
        description: form.description || undefined,
        logoUrl: form.logoUrl || undefined,
      };

      if (editingBrand) {
        await brandService.updateBrand(editingBrand.brandId, payload);
      } else {
        await brandService.createBrand(payload);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save brand');
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

  const filtered = brands.filter(
    (b) =>
      b.brandName.toLowerCase().includes(search.toLowerCase()) ||
      (b.country ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-8 font-sans text-[#1a1612]">
      {/* ── Header ── */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#c9521a] to-[#e07040] text-white shadow-lg shadow-[#c9521a]/35">
            <Award size={24} />
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-[#1a1612]">
              Trademarks
              {totalElements > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#eeecf8] px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide text-[#4a3f8f]">
                  {totalElements}
                </span>
              )}
            </h1>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-linear-to-r from-[#c9521a] to-transparent ml-px" />
            <p className="mt-1.5 text-sm text-[#9c9085]">
              Manage brands and trademarks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-linear-to-br from-[#c9521a] to-[#e07040] px-5 py-2.5 text-[0.9rem] font-semibold text-white shadow-md shadow-[#c9521a]/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-[#c9521a]/38 active:translate-y-0"
        >
          <Plus size={17} /> Add Trademark
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
              placeholder="Search brands or countries…"
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
            <p className="text-sm text-[#9c9085]">Loading trademarks…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e8e3da] bg-[#faf9f7] text-[#9c9085]">
              <Award size={22} />
            </div>
            <p className="text-[0.9rem] text-[#9c9085]">No brands found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e8e3da]">
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Brand
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Country
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
              {filtered.map((b) => (
                <tr
                  key={b.brandId}
                  className="group border-b border-[#e8e3da] last:border-b-0 hover:bg-[#fdf1eb]/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f4c4a8] bg-linear-to-br from-[#fdf1eb] to-[#f4c4a8] font-serif text-[0.95rem] font-normal tracking-tight text-[#c9521a]">
                        {b.logoUrl ? (
                          <img
                            src={b.logoUrl}
                            alt=""
                            className="h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          getInitials(b.brandName)
                        )}
                      </div>
                      <span className="text-[0.88rem] font-semibold text-[#1a1612]">
                        {b.brandName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {b.country ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f3] px-2.5 py-1 text-[0.75rem] font-medium text-[#1a7a6e]">
                        <Globe size={11} />
                        {b.country}
                      </span>
                    ) : (
                      <span className="text-[#9c9085]/60">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="line-clamp-2 max-w-[300px] text-[0.83rem] leading-relaxed text-[#9c9085]">
                      {b.description ?? (
                        <span className="text-[#9c9085]/60">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block rounded-md border border-[#e8e3da] bg-[#faf9f7] px-2 py-0.5 font-mono text-[0.75rem] text-[#9c9085]">
                      #{b.brandId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5 align-center">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#4a3f8f] transition-all hover:border-[#4a3f8f] hover:bg-[#eeecf8]"
                        title="Edit"
                        onClick={() => openEdit(b)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#b03030] transition-all hover:border-[#f5c2c2] hover:bg-[#fdf2f2]"
                        title="Delete"
                        onClick={() => handleDelete(b)}
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
                {editingBrand ? 'Edit Trademark' : 'New Trademark'}
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
              {/* Logo Upload Area */}
              <div className="mb-5">
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Brand Logo
                </label>
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8e3da] bg-[#faf9f7]">
                    {form.logoUrl ? (
                      <>
                        <img
                          src={form.logoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, logoUrl: '' }))
                          }
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1612]/60 text-white backdrop-blur-xs transition-colors hover:bg-[#b03030]"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-[#fdf1eb] to-[#f4c4a8] text-[#c9521a]">
                        <span className="font-serif text-2xl">
                          {form.brandName ? (
                            getInitials(form.brandName)
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </span>
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
                          Choose Logo
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
                  Brand Name <span className="text-[#c9521a]">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2.5 text-[0.9rem] text-[#1a1612] outline-hidden transition-all placeholder:text-[#9c9085] focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                  autoFocus
                  value={form.brandName}
                  onChange={(e) =>
                    setForm({ ...form, brandName: e.target.value })
                  }
                  placeholder="e.g. Samsung"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Country of Origin
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9c9085]" />
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white py-2.5 pl-9 pr-3.5 text-[0.9rem] text-[#1a1612] outline-hidden transition-all placeholder:text-[#9c9085] focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    placeholder="e.g. South Korea"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-[#1a1612] outline-hidden transition-all placeholder:text-[#9c9085] focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Short brand description…"
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
                  {editingBrand ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
