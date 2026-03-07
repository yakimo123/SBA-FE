import {
  Grid,
  Image as ImageIcon,
  List as ListIcon,
  Plus,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Modal } from '../../components/admin/Modal';
import { mediaService } from '../../services/mediaService';
import { productService } from '../../services/productService';
import { Media, MediaType, Product } from '../../types/product';

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [search, setSearch] = useState('');

  // Modal for adding media
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    type: 'IMAGE' as MediaType,
    url: '',
    sortOrder: '1',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getProducts({ page: 0, size: 100 });
      setProducts(data.content ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchMedia = useCallback(async () => {
    if (!selectedProductId) {
      setMediaList([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await mediaService.getProductMedia(Number(selectedProductId));
      setMediaList(data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load media';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleDelete = async (mediaId: number) => {
    if (!window.confirm('Delete this media?')) return;
    try {
      await mediaService.deleteMedia(mediaId);
      setMediaList((prev) => prev.filter((m) => m.mediaId !== mediaId));
    } catch {
      setError('Failed to delete media');
    }
  };

  const handleAddMedia = async () => {
    if (!form.productId) {
      setFormError('Select a product');
      return;
    }
    if (!form.url.trim()) {
      setFormError('URL is required');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await mediaService.uploadMedia({
        productId: Number(form.productId),
        type: form.type,
        url: form.url,
        sortOrder: Number(form.sortOrder) || 1,
      });
      setIsModalOpen(false);
      setForm({ productId: '', type: 'IMAGE', url: '', sortOrder: '1' });
      // If product is already filtered, reload
      if (selectedProductId === form.productId) {
        fetchMedia();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add media';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filterType && m.type !== filterType) return false;
    if (search && !m.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Media Library</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage your images and files</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ productId: '', type: 'IMAGE', url: '', sortOrder: '1' });
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" /> Upload Media
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-4 shadow-sm border border-gray-200">
        {/* Product selector */}
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="rounded-lg border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-purple-600 min-w-[180px]"
        >
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL..."
            className="w-56 rounded-lg border border-gray-300 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>

        {/* Filter type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 py-1.5 px-3 text-sm outline-none focus:border-purple-600"
        >
          <option value="">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded p-1.5 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      )}

      {/* Prompt */}
      {!selectedProductId && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-20 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mb-3" />
          <p className="font-['Fira_Sans'] text-gray-500">Select a product to view its media</p>
        </div>
      )}

      {/* Media Grid */}
      {selectedProductId && !isLoading && (
        <>
          {filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-16 text-center">
              <p className="font-['Fira_Sans'] text-gray-500">No media found for this product.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredMedia.map((m) => (
                <div
                  key={m.mediaId}
                  className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-2 transition-all hover:border-purple-300 hover:shadow-md"
                >
                  <div className="aspect-square w-full rounded-md bg-gray-100 overflow-hidden relative">
                    {m.type === 'IMAGE' ? (
                      <img
                        src={m.url}
                        alt="media"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Video className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(m.mediaId)}
                        className="rounded-full bg-white p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 px-1">
                    <p className="truncate text-xs font-medium text-gray-700">
                      {m.type} #{m.mediaId}
                    </p>
                    <p className="text-xs text-gray-500">Sort: {m.sortOrder}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">URL</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sort</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMedia.map((m) => (
                    <tr key={m.mediaId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-['Fira_Code'] text-xs text-gray-500">
                        #{m.mediaId}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${m.type === 'IMAGE'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                            }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-purple-600 hover:underline block"
                        >
                          {m.url}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.sortOrder}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(m.mediaId)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add Media Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Media"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MediaType })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
              >
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                min={1}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
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
              onClick={handleAddMedia}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Upload
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
