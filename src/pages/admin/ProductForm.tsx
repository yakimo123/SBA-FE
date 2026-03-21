import {
  AlignLeft,
  BookOpen,
  Image as ImageIcon,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import RichEditor from '../../components/admin/RichEditor';
import { FILE_TYPES } from '../../constants/FILE_TYPES';
import {
  attributeService,
  productAttributeService,
} from '../../services/attributeService';
import { brandService } from '../../services/brandService';
import { categoryService } from '../../services/categoryService';
import { mediaService } from '../../services/mediaService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import {
  Attribute,
  Brand,
  Category,
  CreateProductRequest,
  ProductAttribute,
  ProductStatus,
  Supplier,
  UpdateProductRequest,
} from '../../types/product';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ProductFormState {
  productName: string;
  description: string;
  price: string;
  originalPrice: string;
  discountPercent: string;
  categoryId: string;
  brandId: string;
  supplierId: string;
  status: ProductStatus;
}

const EMPTY_FORM: ProductFormState = {
  productName: '',
  description: '',
  price: '',
  originalPrice: '',
  discountPercent: '',
  categoryId: '',
  brandId: '',
  supplierId: '',
  status: 'AVAILABLE',
};

const TABS = [
  { id: 'basic', label: 'Basic & Media', icon: BookOpen },
  { id: 'description', label: 'Description', icon: AlignLeft },
  { id: 'attributes', label: 'Attributes', icon: Tag },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const SELECT_CLS =
  "w-full p-[10px_36px_10px_14px] border border-[#c9bfad] rounded-[9px] text-[0.9rem] text-[#1a1612] bg-white outline-none cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239c9085%22 stroke-width=%222.5%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] focus:border-[#ee4d2d] focus:ring-3 focus:ring-[#ee4d2d]/12";
const INPUT_CLS =
  'w-full p-[10px_14px] border border-[#c9bfad] rounded-[9px] text-[0.9rem] text-[#1a1612] bg-white outline-none transition-all placeholder:text-[#9c9085] focus:border-[#ee4d2d] focus:ring-3 focus:ring-[#ee4d2d]/12';
const LABEL_CLS =
  'block text-[0.8rem] font-semibold text-[#5c5347] mb-[7px] tracking-[0.01em]';

function encodeSrc(url: string) {
  try {
    const u = new URL(url);
    u.pathname = u.pathname
      .split('/')
      .map((s) => encodeURIComponent(decodeURIComponent(s)))
      .join('/');
    return u.toString();
  } catch {
    return url;
  }
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [descriptionDetails, setDescriptionDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(
    []
  );
  const [productAttrs, setProductAttrs] = useState<ProductAttribute[]>([]);
  const [newAttrId, setNewAttrId] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [mediaList, setMediaList] = useState<
    { mediaId?: number; url: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  /* Derived: finalPrice */
  const finalPrice = useMemo(() => {
    const orig = Number(form.originalPrice);
    const disc = Number(form.discountPercent);
    if (orig > 0 && disc > 0 && disc <= 100) {
      return orig * (1 - disc / 100);
    }
    if (orig > 0) return orig;
    return Number(form.price) || 0;
  }, [form.originalPrice, form.discountPercent, form.price]);

  /* ── Load dropdowns ── */
  const loadDropdowns = useCallback(async () => {
    try {
      const [cats, brds, sups, attrs] = await Promise.all([
        categoryService.getCategories(0, 200),
        brandService.getBrands(0, 200),
        supplierService.getSuppliers(0, 200),
        attributeService.getAttributes(0, 200),
      ]);
      setCategories(cats?.content ?? []);
      setBrands(brds?.content ?? []);
      setSuppliers(sups?.content ?? []);
      setAvailableAttributes(attrs?.content ?? []);
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
    }
  }, []);

  /* ── Load product ── */
  const loadProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const product = await productService.getProductById(Number(id));
      setForm({
        productName: product.productName,
        price: String(product.price),
        originalPrice: String(product.originalPrice ?? ''),
        discountPercent: String(product.discountPercent ?? ''),
        categoryId: product.categoryId ? String(product.categoryId) : '',
        brandId: product.brandId ? String(product.brandId) : '',
        supplierId: product.supplierId ? String(product.supplierId) : '',
        status: product.status,
        description: product.description ?? '',
      });
      setDescriptionDetails(product.descriptionDetails ?? '');
      const [medias, attrs] = await Promise.all([
        mediaService.getProductMedia(Number(id)),
        productAttributeService.getProductAttributes(Number(id)),
      ]);
      setMediaList(
        medias?.map((m) => ({ mediaId: m.mediaId, url: m.url })) ?? []
      );
      setProductAttrs(attrs ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDropdowns();
    loadProduct();
  }, [loadDropdowns, loadProduct]);

  /* ── Save ── */
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!form.productName.trim()) {
      setError('Product name is required');
      setActiveTab('basic');
      return;
    }
    if (!form.originalPrice || Number(form.originalPrice) <= 0) {
      setError('Original Price must be greater than 0');
      setActiveTab('basic');
      return;
    }
    setIsSaving(true);
    try {
      const payload: CreateProductRequest = {
        productName: form.productName,
        description: form.description || undefined,
        descriptionDetails: descriptionDetails || undefined,
        price: finalPrice,
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : undefined,
        discountPercent: form.discountPercent
          ? Number(form.discountPercent)
          : undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        brandId: form.brandId ? Number(form.brandId) : undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        status: form.status,
        imageUrls: mediaList.map((m) => m.url),
      };
      if (isEdit) {
        await productService.updateProduct(
          Number(id),
          payload as UpdateProductRequest
        );
        setSuccess('Product updated successfully!');
      } else {
        const created = await productService.createProduct(payload);
        if (mediaList.length > 0) {
          await Promise.all(
            mediaList.map((m, idx) =>
              mediaService.uploadMedia({
                productId: created.productId,
                type: 'IMAGE',
                url: m.url,
                sortOrder: idx,
              })
            )
          );
        }
        setSuccess('Product created successfully!');
        setTimeout(
          () => navigate(`/admin/products/${created.productId}/edit`),
          1000
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Media upload ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) =>
          mediaService.uploadFile(f, FILE_TYPES.PRODUCT)
        )
      );
      if (isEdit && id) {
        const newMedias = await Promise.all(
          uploaded.map((url, idx) =>
            mediaService.uploadMedia({
              productId: Number(id),
              type: 'IMAGE',
              url,
              sortOrder: mediaList.length + idx,
            })
          )
        );
        setMediaList((prev) => [
          ...prev,
          ...newMedias.map((m) => ({ mediaId: m.mediaId, url: m.url })),
        ]);
      } else {
        setMediaList((prev) => [...prev, ...uploaded.map((url) => ({ url }))]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeMedia = async (index: number) => {
    const item = mediaList[index];
    if (item.mediaId) {
      try {
        await mediaService.deleteMedia(item.mediaId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete image');
        return;
      }
    }
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Attributes ── */
  const handleAddAttr = async () => {
    if (!id || !newAttrId || !newAttrValue.trim()) return;
    try {
      await productAttributeService.createProductAttribute({
        productId: Number(id),
        attributeId: Number(newAttrId),
        value: newAttrValue,
      });
      setNewAttrId('');
      setNewAttrValue('');
      const attrs = await productAttributeService.getProductAttributes(
        Number(id)
      );
      setProductAttrs(attrs ?? []);
    } catch {
      setError('Failed to add attribute');
    }
  };

  const handleDeleteAttr = async (attrId: number) => {
    try {
      await productAttributeService.deleteProductAttribute(attrId);
      setProductAttrs((prev) =>
        prev.filter((a) => a.productAttributeId !== attrId)
      );
    } catch {
      setError('Failed to delete attribute');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] p-8 font-sans text-[#1a1612]">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#e8e3da] border-t-[#ee4d2d] animate-spin" />
          <p className="text-sm text-[#9c9085]">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef] p-6 font-sans text-[#1a1612]">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#e8e3da] bg-white text-[#5c5347] transition-all hover:bg-[#f2efe9]"
          >
            <X size={17} />
          </button>
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[#9c9085]">
              {isEdit ? 'Edit Product' : 'New Product'}
            </p>
            <h1 className="text-xl font-bold text-[#1a1612] leading-tight mt-0.5">
              {form.productName || 'Untitled Product'}
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#ee4d2d] text-white text-[0.85rem] font-semibold shadow-[0_3px_10px_rgba(238,77,45,0.3)] transition-all hover:bg-[#b04518] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {isSaving ? 'Saving…' : 'Save Product'}
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <X size={15} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-3 rounded-[10px] border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="mb-0 flex gap-0 border-b border-[#e8e3da]">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            type="button"
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-2 px-5 py-3 text-[0.82rem] font-semibold transition-all -mb-px border-b-2 ${
              activeTab === tid
                ? 'border-[#ee4d2d] text-[#ee4d2d]'
                : 'border-transparent text-[#9c9085] hover:text-[#5c5347]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content card ── */}
      <div className="rounded-b-xl rounded-tr-xl bg-white p-6 shadow-[0_2px_12px_rgba(26,22,18,0.07)]">
        {/* ━━━━━━━━ BASIC & MEDIA ━━━━━━━━ */}
        {activeTab === 'basic' && (
          <div className="flex flex-col gap-8">
            {/* Top section: product info */}
            <div className="flex flex-col gap-5">
              {/* Product name */}
              <div>
                <label className={LABEL_CLS}>
                  Product Name <span className="text-[#ee4d2d] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  className={INPUT_CLS}
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  value={form.productName}
                  onChange={(e) =>
                    setForm({ ...form, productName: e.target.value })
                  }
                />
              </div>

              {/* Short description */}
              <div>
                <label className={LABEL_CLS}>Short Description</label>
                <textarea
                  className={INPUT_CLS + ' min-h-[80px] resize-none'}
                  placeholder="Small summary or highlights of the product..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Classification row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={LABEL_CLS}>Category</label>
                  <select
                    className={SELECT_CLS}
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Brand</label>
                  <select
                    className={SELECT_CLS}
                    value={form.brandId}
                    onChange={(e) =>
                      setForm({ ...form, brandId: e.target.value })
                    }
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Supplier</label>
                  <select
                    className={SELECT_CLS}
                    value={form.supplierId}
                    onChange={(e) =>
                      setForm({ ...form, supplierId: e.target.value })
                    }
                  >
                    <option value="">Select supplier…</option>
                    {suppliers.map((s) => (
                      <option key={s.supplierId} value={s.supplierId}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Original Price */}
                <div>
                  <label className={LABEL_CLS}>
                    Original Price (₫){' '}
                    <span className="text-[#ee4d2d] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center bg-[#f2efe9] border-r border-[#e8e3da] rounded-l-[9px] text-[#9c9085] text-[0.85rem] pointer-events-none">
                      ₫
                    </span>
                    <input
                      type="number"
                      min={0}
                      className={INPUT_CLS + ' pl-12'}
                      placeholder="32990000"
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm({ ...form, originalPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
                {/* Discount % */}
                <div>
                  <label className={LABEL_CLS}>Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={INPUT_CLS + ' pr-10'}
                      placeholder="10"
                      value={form.discountPercent}
                      onChange={(e) =>
                        setForm({ ...form, discountPercent: e.target.value })
                      }
                    />
                    <span className="absolute right-0 top-0 bottom-0 w-9 flex items-center justify-center bg-[#f2efe9] border-l border-[#e8e3da] rounded-r-[9px] text-[#9c9085] text-[0.85rem] pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
                {/* Final Price (computed) */}
                <div>
                  <label className={LABEL_CLS}>Final Price (auto)</label>
                  <div className="relative">
                    <span className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center text-[#9c9085] text-[0.85rem] pointer-events-none">
                      ₫
                    </span>
                    <div className="pl-10 pr-3 py-[10px] border border-[#e8e3da] rounded-[9px] bg-[#faf9f7] text-[0.9rem] font-mono font-semibold text-[#ee4d2d]">
                      {finalPrice > 0
                        ? finalPrice.toLocaleString('vi-VN')
                        : '—'}
                    </div>
                  </div>
                  {Number(form.discountPercent) > 0 &&
                    Number(form.originalPrice) > 0 && (
                      <p className="mt-1 text-[0.7rem] text-[#9c9085]">
                        {form.discountPercent}% off{' '}
                        {Number(form.originalPrice).toLocaleString('vi-VN')}₫
                      </p>
                    )}
                </div>
              </div>

              {/* Status */}
              <div className="w-full sm:w-1/3">
                <label className={LABEL_CLS}>Status</label>
                <select
                  className={SELECT_CLS}
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as ProductStatus,
                    })
                  }
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Bottom section: media */}
            <div className="pt-5 border-t border-[#e8e3da]">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[0.75rem] uppercase tracking-[0.09em] font-semibold text-[#1a1612]">
                  Product Images
                </p>
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#f2efe9] text-[#5c5347] text-[0.82rem] font-semibold cursor-pointer transition-all hover:bg-[#e8e3da] hover:text-[#1a1612] ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {isUploading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-[#9c9085]/40 border-t-[#ee4d2d] animate-spin" />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                  {isUploading ? 'Uploading…' : 'Add Images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>

              {mediaList.length === 0 ? (
                <div className="w-full rounded-[12px] border-2 border-dashed border-[#e8e3da] bg-[#faf9f7] p-10 text-center text-[#9c9085]">
                  <ImageIcon size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[0.85rem] font-medium text-[#5c5347] mb-1">
                    No images uploaded
                  </p>
                  <p className="text-[0.75rem]">
                    JPG, PNG, WEBP accepted. The first image will be used as the
                    main thumbnail.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {mediaList.map((m, idx) => (
                    <div
                      key={m.mediaId ?? idx}
                      className="relative group rounded-[10px] overflow-hidden border border-[#e8e3da] aspect-square bg-[#faf9f7] shadow-[0_2px_8px_rgba(26,22,18,0.04)]"
                    >
                      <img
                        src={encodeSrc(m.url)}
                        alt={`product-image-${idx}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f2efe9"/><text x="100" y="105" font-size="12" text-anchor="middle" fill="%239c9085" font-family="sans-serif">No Image</text></svg>';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1612]/70 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#b03030] hover:scale-110"
                      >
                        <X size={14} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 rounded-[10px] bg-[#ee4d2d]/90 px-2 py-0.5 text-[0.65rem] text-white font-bold tracking-wide uppercase shadow-sm">
                          Main Image
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━━━━━━ DESCRIPTION ━━━━━━━━ */}
        {activeTab === 'description' && (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.09em] text-[#9c9085] mb-4 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e8e3da]">
              Product Description
            </p>
            <RichEditor
              content={descriptionDetails}
              onChange={setDescriptionDetails}
              placeholder="Write a detailed product description, specifications, and highlights…"
            />
          </div>
        )}

        {/* ━━━━━━━━ ATTRIBUTES ━━━━━━━━ */}
        {activeTab === 'attributes' && (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.09em] text-[#9c9085] mb-4 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#e8e3da]">
              Product Specifications
            </p>

            {!isEdit && (
              <div className="flex items-start gap-2.5 bg-[#fef6eb] border border-[#f5d9a8] border-l-[3px] border-l-[#905a10] text-[#905a10] rounded-[10px] p-[12px_16px] text-sm mb-5">
                <Tag size={15} className="shrink-0 mt-0.5" />
                Save the product first to add attributes.
              </div>
            )}

            {productAttrs.length > 0 ? (
              <div className="flex flex-col gap-2 mb-5">
                {productAttrs.map((pa) => (
                  <div
                    key={pa.productAttributeId}
                    className="flex items-center justify-between p-[11px_16px] bg-[#faf9f7] border border-[#e8e3da] rounded-[10px] hover:bg-[#fff1f0] transition-all"
                  >
                    <span>
                      <span className="font-semibold text-[#ee4d2d] text-[0.85rem]">
                        {pa.attributeName ?? `Attr #${pa.attributeId}`}
                      </span>
                      <span className="text-[#9c9085] mx-2 text-[0.8rem]">
                        ·
                      </span>
                      <span className="text-[#1a1612] text-[0.88rem]">
                        {pa.value}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#e8e3da] bg-white text-[#b03030] transition-all hover:bg-[#fdf2f2] hover:border-[#f8aba6]"
                      onClick={() => handleDeleteAttr(pa.productAttributeId)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : isEdit ? (
              <div className="text-center p-8 text-[#9c9085] text-sm border border-dashed border-[#e8e3da] rounded-[12px] bg-[#faf9f7] mb-4">
                No attributes yet
              </div>
            ) : null}

            {isEdit && (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-[1fr_1fr_auto] p-4 bg-[#faf9f7] border border-[#e8e3da] rounded-[12px] items-end">
                <div>
                  <label className={LABEL_CLS}>Attribute</label>
                  <select
                    className={SELECT_CLS}
                    value={newAttrId}
                    onChange={(e) => setNewAttrId(e.target.value)}
                  >
                    <option value="">Select attribute…</option>
                    {availableAttributes.map((a) => (
                      <option key={a.attributeId} value={a.attributeId}>
                        {a.attributeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Value</label>
                  <input
                    type="text"
                    className={INPUT_CLS}
                    value={newAttrValue}
                    onChange={(e) => setNewAttrValue(e.target.value)}
                    placeholder="e.g. 12GB"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAttr()}
                  />
                </div>
                <div>
                  <label className={`${LABEL_CLS} opacity-0`}>_</label>
                  <button
                    type="button"
                    onClick={handleAddAttr}
                    className="flex items-center justify-center gap-2 w-full px-4 py-[10px] rounded-[9px] bg-[#ee4d2d] text-white text-[0.85rem] font-semibold transition-all hover:bg-[#dc2626]"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
