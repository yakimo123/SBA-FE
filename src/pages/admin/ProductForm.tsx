import { Plus, Save, Trash2,X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { attributeService, productAttributeService } from '../../services/attributeService';
import { brandService } from '../../services/brandService';
import { categoryService } from '../../services/categoryService';
import { mediaService } from '../../services/mediaService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import {
  Attribute,
  Brand,
  Category,
  Media,
  MediaType,
  ProductAttribute,
  ProductStatus,
  Supplier,
} from '../../types/product';

interface ProductFormState {
  productName: string;
  description: string;
  price: string;
  categoryId: string;
  brandId: string;
  supplierId: string;
  quantity: string;
  status: ProductStatus;
}

const EMPTY_FORM: ProductFormState = {
  productName: '',
  description: '',
  price: '',
  categoryId: '',
  brandId: '',
  supplierId: '',
  quantity: '',
  status: 'AVAILABLE',
};

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lookup data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Media
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<MediaType>('IMAGE');
  const [newMediaSortOrder, setNewMediaSortOrder] = useState('1');
  const [mediaLoading, setMediaLoading] = useState(false);

  // Attributes
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [productAttrs, setProductAttrs] = useState<ProductAttribute[]>([]);
  const [newAttrId, setNewAttrId] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing & Inventory' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'media', label: 'Media' },
  ];

  const loadDropdowns = useCallback(async () => {
    try {
      const [catData, brandData, supplierData, attrData] = await Promise.all([
        categoryService.getCategories(0, 100),
        brandService.getBrands(0, 100),
        supplierService.getSuppliers(0, 100),
        attributeService.getAttributes(0, 100),
      ]);
      setCategories(catData.content ?? []);
      setBrands(brandData.content ?? []);
      setSuppliers(supplierData.content ?? []);
      setAvailableAttributes(attrData.content ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const product = await productService.getProductById(Number(id));
      setForm({
        productName: product.productName,
        description: product.description ?? '',
        price: String(product.price),
        categoryId: product.categoryId ? String(product.categoryId) : '',
        brandId: product.brandId ? String(product.brandId) : '',
        supplierId: product.supplierId ? String(product.supplierId) : '',
        quantity: String(product.quantity),
        status: product.status,
      });
      // Load media
      const medias = await mediaService.getProductMedia(Number(id));
      setMediaList(medias ?? []);
      // Load product attributes
      const attrs = await productAttributeService.getProductAttributes(Number(id));
      setProductAttrs(attrs ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load product';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDropdowns();
    loadProduct();
  }, [loadDropdowns, loadProduct]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!form.productName.trim()) {
      setError('Product name is required');
      setActiveTab('basic');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Price must be greater than 0');
      setActiveTab('pricing');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        productName: form.productName,
        description: form.description || undefined,
        price: Number(form.price),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        brandId: form.brandId ? Number(form.brandId) : undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        quantity: form.quantity ? Number(form.quantity) : 0,
        status: form.status,
      };

      if (isEdit) {
        await productService.updateProduct(Number(id), payload);
        setSuccess('Product updated successfully!');
      } else {
        const created = await productService.createProduct(payload);
        setSuccess('Product created successfully!');
        setTimeout(() => navigate(`/admin/products/${created.productId}/edit`), 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Media handlers
  const handleAddMedia = async () => {
    if (!id) {
      setError('Save the product first before adding media');
      return;
    }
    if (!newMediaUrl.trim()) return;
    setMediaLoading(true);
    try {
      await mediaService.uploadMedia({
        productId: Number(id),
        type: newMediaType,
        url: newMediaUrl,
        sortOrder: Number(newMediaSortOrder) || 1,
      });
      setNewMediaUrl('');
      const medias = await mediaService.getProductMedia(Number(id));
      setMediaList(medias ?? []);
    } catch {
      setError('Failed to add media');
    } finally {
      setMediaLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await mediaService.deleteMedia(mediaId);
      setMediaList((prev) => prev.filter((m) => m.mediaId !== mediaId));
    } catch {
      setError('Failed to delete media');
    }
  };

  // Attribute handlers
  const handleAddAttr = async () => {
    if (!id) {
      setError('Save the product first before adding attributes');
      return;
    }
    if (!newAttrId || !newAttrValue.trim()) return;
    try {
      await productAttributeService.createProductAttribute({
        productId: Number(id),
        attributeId: Number(newAttrId),
        value: newAttrValue,
      });
      setNewAttrId('');
      setNewAttrValue('');
      const attrs = await productAttributeService.getProductAttributes(Number(id));
      setProductAttrs(attrs ?? []);
    } catch {
      setError('Failed to add attribute');
    }
  };

  const handleDeleteAttr = async (attrId: number) => {
    try {
      await productAttributeService.deleteProductAttribute(attrId);
      setProductAttrs((prev) => prev.filter((a) => a.productAttributeId !== attrId));
    } catch {
      setError('Failed to delete attribute');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Fill in the product details below</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Fira_Sans'] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEdit ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-1 py-4 font-['Fira_Sans'] text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ─── Basic Info ─────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <select
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  >
                    <option value="">Select brand...</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.supplierId} value={s.supplierId}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── Pricing & Inventory ─────────────────────────── */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Price (₫) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="29990000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Inactive</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ─── Attributes ───────────────────────────────────── */}
          {activeTab === 'attributes' && (
            <div className="space-y-4">
              {!isEdit && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  Save the product first to add attributes.
                </p>
              )}

              {/* Existing attrs */}
              {productAttrs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-['Fira_Code'] text-sm font-semibold text-gray-700">
                    Current Attributes
                  </h3>
                  {productAttrs.map((pa) => (
                    <div
                      key={pa.productAttributeId}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
                    >
                      <span className="text-sm">
                        <span className="font-medium text-purple-900">
                          {pa.attributeName ?? `Attr #${pa.attributeId}`}
                        </span>
                        {' = '}
                        <span className="text-gray-700">{pa.value}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttr(pa.productAttributeId)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new */}
              {isEdit && (
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Attribute
                    </label>
                    <select
                      value={newAttrId}
                      onChange={(e) => setNewAttrId(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
                    >
                      <option value="">Select attribute...</option>
                      {availableAttributes.map((a) => (
                        <option key={a.attributeId} value={a.attributeId}>
                          {a.attributeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Value</label>
                    <input
                      type="text"
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      placeholder="e.g. 12GB"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddAttr}
                      className="flex w-full items-center justify-center gap-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Media ────────────────────────────────────────── */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {!isEdit && (
                <p className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  Save the product first to add media.
                </p>
              )}

              {/* Existing media */}
              {mediaList.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaList.map((m) => (
                    <div
                      key={m.mediaId}
                      className="group relative rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      {m.type === 'IMAGE' ? (
                        <img
                          src={m.url}
                          alt="media"
                          className="mb-2 h-28 w-full rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50" y="55" font-size="12" text-anchor="middle" fill="%236b7280">No Image</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="mb-2 flex h-28 items-center justify-center rounded bg-gray-200 text-gray-500 text-sm">
                          🎬 Video
                        </div>
                      )}
                      <p className="truncate text-xs text-gray-600">{m.url}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {m.type} · Sort: {m.sortOrder}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(m.mediaId)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new media */}
              {isEdit && (
                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="font-['Fira_Code'] text-sm font-semibold text-gray-700">
                    Add Media URL
                  </h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">URL</label>
                      <input
                        type="text"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={newMediaType}
                        onChange={(e) => setNewMediaType(e.target.value as MediaType)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
                      >
                        <option value="IMAGE">IMAGE</option>
                        <option value="VIDEO">VIDEO</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newMediaSortOrder}
                        onChange={(e) => setNewMediaSortOrder(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedia}
                    disabled={mediaLoading}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {mediaLoading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Media
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
