import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FILE_TYPES } from '../../constants/FILE_TYPES';
import bannerService, {
  type BannerAdminItem,
  type CreateBannerRequest,
} from '../../services/bannerService';
import { mediaService } from '../../services/mediaService';
import { sanitizeFileName } from '../../utils/fileUtils';

const POSITIONS = [
  { value: '', label: 'Tất cả vị trí' },
  { value: 'MAIN', label: 'Banner chính' },
  { value: 'RIGHT_TOP', label: 'Góc phải trên' },
  { value: 'RIGHT_BOTTOM', label: 'Góc phải dưới' },
] as const;

const ACTIVE_FILTER = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đang bật' },
  { value: 'false', label: 'Đang tắt' },
] as const;

const PAGE_SIZE = 10;

const defaultForm: CreateBannerRequest & { imageKey: string } = {
  title: '',
  subtitle: '',
  description: '',
  imageUrl: '',
  imageKey: '',
  buttonText: '',
  buttonLink: '',
  position: 'MAIN',
  sortOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
};

function formatDate(s: string) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

export function BannerList() {
  const [list, setList] = useState<BannerAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerAdminItem | null>(null);
  const [form, setForm] = useState<CreateBannerRequest & { imageKey: string }>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof bannerService.getAdminBanners>[0] = {
        page,
        size: PAGE_SIZE,
        keyword: keyword.trim() || undefined,
        position: positionFilter || undefined,
        isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
      };
      const res = await bannerService.getAdminBanners(params);
      const data = res.data;
      setList(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load banners');
      toast.error('Không tải được danh sách banner');
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword, positionFilter, isActiveFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm({ ...defaultForm, startDate: '', endDate: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (b: BannerAdminItem) => {
    setEditingBanner(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? '',
      description: b.description ?? '',
      imageUrl: b.imageUrl,
      imageKey: b.imageKey ?? '',
      buttonText: b.buttonText ?? '',
      buttonLink: b.buttonLink ?? '',
      position: (b.position as 'MAIN' | 'RIGHT_TOP' | 'RIGHT_BOTTOM') || 'MAIN',
      sortOrder: b.sortOrder ?? 0,
      isActive: b.isActive ?? true,
      startDate: b.startDate?.slice(0, 16) ?? '',
      endDate: b.endDate?.slice(0, 16) ?? '',
      backgroundColor: b.backgroundColor ?? '#FFFFFF',
      textColor: b.textColor ?? '#000000',
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
      const publicUrl = await mediaService.uploadFile(file, FILE_TYPES.OTHER);
      const key = `banners/${sanitizeFileName(file.name)}`;
      setForm((prev) => ({ ...prev, imageUrl: publicUrl, imageKey: key }));
      toast.success('Tải ảnh lên thành công');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl?.trim()) {
      setFormError('Ảnh banner là bắt buộc');
      return;
    }
    if (!form.imageUrl?.trim()) {
      setFormError('Ảnh banner là bắt buộc');
      return;
    }
    if (!form.position) {
      setFormError('Vị trí là bắt buộc');
      return;
    }
    const start = form.startDate ? new Date(form.startDate).getTime() : 0;
    const end = form.endDate ? new Date(form.endDate).getTime() : 0;
    if (form.startDate && form.endDate && start >= end) {
      setFormError('Ngày bắt đầu phải trước ngày kết thúc');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const payload: CreateBannerRequest = {
        title: form.title?.trim() || undefined,
        subtitle: form.subtitle?.trim() || undefined,
        description: form.description?.trim() || undefined,
        imageUrl: form.imageUrl.trim(),
        imageKey: form.imageKey?.trim() || `banners/${Date.now()}`,
        buttonText: form.buttonText?.trim() || undefined,
        buttonLink: form.buttonLink?.trim() || undefined,
        position: form.position,
        sortOrder: form.sortOrder ?? 0,
        isActive: form.isActive ?? true,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        backgroundColor: form.backgroundColor?.trim() || undefined,
        textColor: form.textColor?.trim() || undefined,
      };

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, payload);
        toast.success('Cập nhật banner thành công');
      } else {
        await bannerService.createBanner(payload);
        toast.success('Tạo banner thành công');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu thất bại';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (b: BannerAdminItem) => {
    if (!window.confirm(`Xóa banner "${b.title || 'không tiêu đề'}"?`)) return;
    try {
      await bannerService.deleteBanner(b.id);
      toast.success('Đã xóa banner');
      fetchBanners();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleToggleStatus = async (b: BannerAdminItem) => {
    try {
      await bannerService.toggleBannerStatus(b.id, !b.isActive);
      toast.success(b.isActive ? 'Đã tắt banner' : 'Đã bật banner');
      fetchBanners();
    } catch {
      toast.error('Đổi trạng thái thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-8 font-sans text-[#1a1612]">
      {/* Header */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#c9521a] to-[#e07040] text-white shadow-lg shadow-[#c9521a]/35">
            <ImageIcon size={24} />
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-[#1a1612]">
              Banners
              {totalElements > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-[#eeecf8] px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide text-[#4a3f8f]">
                  {totalElements}
                </span>
              )}
            </h1>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-linear-to-r from-[#c9521a] to-transparent ml-[1px]" />
            <p className="mt-1.5 text-sm text-[#9c9085]">
              Quản lý banner trang chủ (MAIN, RIGHT_TOP, RIGHT_BOTTOM)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-linear-to-br from-[#c9521a] to-[#e07040] px-5 py-2.5 text-[0.9rem] font-semibold text-white shadow-md shadow-[#c9521a]/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-[#c9521a]/38 active:translate-y-0"
        >
          <Plus size={17} /> Thêm banner
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-[#f5c2c2] border-l-[3px] border-l-[#b03030] bg-[#fdf2f2] px-4 py-3 text-sm text-[#b03030]">
          ⚠ {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="overflow-hidden rounded-2xl border border-[#e8e3da] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e3da] bg-[#faf9f7] px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#9c9085]" />
              <input
                className="w-[200px] rounded-lg border border-[#e8e3da] bg-white py-1.5 pl-8 pr-3 text-[0.85rem] text-[#1a1612] outline-none transition-all focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                placeholder="Tìm theo tiêu đề..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(0)}
              />
            </div>
            <select
              className="rounded-lg border border-[#e8e3da] bg-white px-3 py-1.5 text-[0.85rem] text-[#1a1612] outline-none focus:border-[#c9521a]"
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setPage(0);
              }}
            >
              {POSITIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[#e8e3da] bg-white px-3 py-1.5 text-[0.85rem] text-[#1a1612] outline-none focus:border-[#c9521a]"
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(0);
              }}
            >
              {ACTIVE_FILTER.map((o) => (
                <option key={o.value || 'all'} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <span className="text-[0.8rem] text-[#9c9085]">
            {totalElements} banner{totalElements !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Loader2 className="h-9 w-9 animate-spin text-[#c9521a]" />
            <p className="text-sm text-[#9c9085]">Đang tải...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e8e3da] bg-[#faf9f7] text-[#9c9085]">
              <ImageIcon size={22} />
            </div>
            <p className="text-[0.9rem] text-[#9c9085]">Chưa có banner nào</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-2 rounded-lg border border-[#c9521a] bg-[#fdf1eb] px-4 py-2 text-[0.85rem] font-medium text-[#c9521a] hover:bg-[#c9521a] hover:text-white"
            >
              Thêm banner đầu tiên
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e8e3da]">
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Ảnh
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Tiêu đề
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Vị trí
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Thứ tự
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Trạng thái
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Hiển thị
                </th>
                <th className="bg-[#faf9f7] px-5 py-3 text-left font-mono text-[0.69rem] font-medium tracking-widest uppercase text-[#9c9085]">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-[#e8e3da] last:border-b-0 hover:bg-[#fdf1eb]/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="h-12 w-20 overflow-hidden rounded-lg bg-[#faf9f7] border border-[#e8e3da]">
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9c9085]">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-[#1a1612] line-clamp-1 max-w-[200px]">
                      {b.title}
                    </span>
                    {b.subtitle && (
                      <span className="mt-0.5 block text-[0.75rem] text-[#9c9085] line-clamp-1 max-w-[200px]">
                        {b.subtitle}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block rounded-md border border-[#e8e3da] bg-[#faf9f7] px-2 py-0.5 font-mono text-[0.75rem] text-[#5c5347]">
                      {b.position}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[0.8rem] text-[#5c5347]">
                    {b.sortOrder}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.73rem] font-semibold ${
                        b.isActive
                          ? 'bg-[#edf7f2] text-[#2d7a4f]'
                          : 'bg-[#fdf2f2] text-[#b03030]'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${b.isActive ? 'bg-[#2d7a4f]' : 'bg-[#b03030]'}`} />
                      {b.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[0.78rem] text-[#9c9085]">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#4a3f8f] transition-all hover:border-[#4a3f8f] hover:bg-[#eeecf8]"
                        title="Sửa"
                        onClick={() => openEdit(b)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#5c5347] transition-all hover:border-[#c9521a] hover:bg-[#fdf1eb]"
                        title={b.isActive ? 'Tắt' : 'Bật'}
                        onClick={() => handleToggleStatus(b)}
                      >
                        {b.isActive ? 'Tắt' : 'Bật'}
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] bg-white text-[#b03030] transition-all hover:border-[#f5c2c2] hover:bg-[#fdf2f2]"
                        title="Xóa"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg border border-[#e8e3da] bg-white px-3.5 py-1.5 text-[0.85rem] font-medium text-[#5c5347] transition-all hover:not-disabled:border-[#c9521a] hover:not-disabled:bg-[#fdf1eb] hover:not-disabled:text-[#c9521a] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Trước
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
            Sau <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1a1612]/45 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="m-5 max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e3da] bg-white px-6 py-4">
              <h2 className="font-serif text-xl text-[#1a1612]">
                {editingBanner ? 'Chỉnh sửa banner' : 'Thêm banner'}
              </h2>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8e3da] text-[1.1rem] text-[#9c9085] transition-all hover:bg-[#faf9f7] hover:text-[#1a1612]"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              {/* Image */}
              <div>
                <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">
                  Ảnh banner <span className="text-[#c9521a]">*</span>
                </label>
                <div className="flex gap-4">
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-[#e8e3da] bg-[#faf9f7]">
                    {form.imageUrl ? (
                      <>
                        <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: '', imageKey: '' }))}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1612]/60 text-white hover:bg-[#b03030]"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-[#9c9085]">
                        <ImageIcon size={22} />
                        <span className="mt-1 text-[0.65rem]">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#c9bfad] bg-[#faf9f7] px-4 py-3 text-[0.8rem] font-medium text-[#c9521a] hover:border-[#c9521a]/50 hover:bg-[#fdf1eb]">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        <>Chọn ảnh</>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Tiêu đề</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Tiêu đề banner"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Tiêu đề phụ</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.subtitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Subtitle"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Vị trí *</label>
                  <select
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a]"
                    value={form.position}
                    onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value as 'MAIN' | 'RIGHT_TOP' | 'RIGHT_BOTTOM' }))}
                  >
                    <option value="MAIN">MAIN (Banner chính)</option>
                    <option value="RIGHT_TOP">RIGHT_TOP</option>
                    <option value="RIGHT_BOTTOM">RIGHT_BOTTOM</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Thứ tự</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.sortOrder}
                    onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold text-[#5c5347]">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-[#c9bfad]"
                    />
                    Đang bật
                  </label>
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Nút (chữ)</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.buttonText}
                    onChange={(e) => setForm((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="Xem ngay"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Link nút</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.buttonLink}
                    onChange={(e) => setForm((prev) => ({ ...prev, buttonLink: e.target.value }))}
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Từ ngày</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.startDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Đến ngày</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.endDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Màu nền</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.backgroundColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#FFFFFF"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Màu chữ</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    value={form.textColor}
                    onChange={(e) => setForm((prev) => ({ ...prev, textColor: e.target.value }))}
                    placeholder="#000000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-[0.8rem] font-semibold text-[#5c5347]">Mô tả</label>
                  <textarea
                    className="w-full rounded-lg border border-[#c9bfad] bg-white px-3.5 py-2 text-[0.9rem] outline-none focus:border-[#c9521a] focus:ring-3 focus:ring-[#c9521a]/12"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả ngắn"
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-[#f5c2c2] bg-[#fdf2f2] px-3.5 py-2.5 text-[0.83rem] text-[#b03030]">
                  ⚠ {formError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#c9bfad] bg-white px-4.5 py-2.5 text-[0.88rem] font-medium text-[#5c5347] hover:bg-[#faf9f7]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isUploading}
                  className="flex items-center gap-2 rounded-lg bg-linear-to-br from-[#c9521a] to-[#e07040] px-5 py-2.5 text-[0.88rem] font-semibold text-white shadow-md shadow-[#c9521a]/30 hover:not-disabled:-translate-y-px hover:not-disabled:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingBanner ? 'Cập nhật' : 'Tạo banner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
