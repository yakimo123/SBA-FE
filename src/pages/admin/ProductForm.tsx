import {
  BookOpen, ChevronLeft, ChevronRight, Image, Plus,
  Save, Tag, Trash2, X, DollarSign, Package
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { attributeService, productAttributeService } from '../../services/attributeService';
import { brandService } from '../../services/brandService';
import { categoryService } from '../../services/categoryService';
import { mediaService } from '../../services/mediaService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import {
  Attribute, Brand, Category, Media, MediaType,
  ProductAttribute, ProductStatus, Supplier,
} from '../../types/product';

interface ProductFormState {
  productName: string; description: string; price: string;
  categoryId: string; brandId: string; supplierId: string;
  quantity: string; status: ProductStatus;
}

const EMPTY_FORM: ProductFormState = {
  productName: '', description: '', price: '',
  categoryId: '', brandId: '', supplierId: '', quantity: '', status: 'AVAILABLE',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .pf-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --surface-3: #f2efe9;
    --border: #e8e3da;
    --border-strong: #c9bfad;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --accent-mid: #f4c4a8;
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --warning: #905a10;
    --warning-soft: #fef6eb;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-md: 0 4px 16px rgba(26,22,18,0.08), 0 2px 6px rgba(26,22,18,0.05);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  /* ── Header ── */
  .pf-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .pf-header-left { display: flex; align-items: center; gap: 16px; }
  .pf-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .pf-icon-badge svg { color: white; width: 24px; height: 24px; }
  .pf-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .pf-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .pf-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .pf-header-actions { display: flex; gap: 10px; align-items: center; }
  .pf-btn-cancel {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border: 1px solid var(--border-strong);
    border-radius: var(--radius); background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s;
  }
  .pf-btn-cancel:hover { background: var(--surface-2); border-color: var(--ink-3); }
  .pf-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: var(--radius);
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 14px rgba(201,82,26,0.3); transition: all 0.2s;
  }
  .pf-btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }
  .pf-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .pf-save-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: pf-spin 0.6s linear infinite;
  }
  @keyframes pf-spin { to { transform: rotate(360deg); } }

  /* ── Alerts ── */
  .pf-alert-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }
  .pf-alert-success {
    display: flex; align-items: center; gap: 10px;
    background: var(--success-soft); border: 1px solid #b7e0cc;
    border-left: 3px solid var(--success); color: var(--success);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }
  .pf-alert-warning {
    display: flex; align-items: flex-start; gap: 10px;
    background: var(--warning-soft); border: 1px solid #f5d9a8;
    border-left: 3px solid var(--warning); color: var(--warning);
    border-radius: var(--radius); padding: 12px 16px; font-size: 0.875rem;
  }

  /* ── Card ── */
  .pf-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }

  /* ── Tabs ── */
  .pf-tabs {
    display: flex; border-bottom: 1px solid var(--border);
    background: var(--surface-2); padding: 0 8px; gap: 2px;
    overflow-x: auto;
  }
  .pf-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 14px 18px; border: none; background: transparent;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    font-weight: 500; color: var(--ink-3); cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all 0.15s; white-space: nowrap;
  }
  .pf-tab:hover { color: var(--ink-2); }
  .pf-tab.active {
    color: var(--accent); border-bottom-color: var(--accent);
    font-weight: 600;
  }
  .pf-tab svg { width: 14px; height: 14px; }

  /* ── Tab body ── */
  .pf-tab-body { padding: 28px 28px 32px; }

  /* ── Section header ── */
  .pf-section-title {
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    text-transform: uppercase; letter-spacing: 0.09em;
    color: var(--ink-3); margin: 0 0 16px; display: flex;
    align-items: center; gap: 8px;
  }
  .pf-section-title::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* ── Form elements ── */
  .pf-field { margin-bottom: 20px; }
  .pf-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px; letter-spacing: 0.01em;
  }
  .pf-label span { color: var(--accent); margin-left: 2px; }
  .pf-input {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .pf-input::placeholder { color: var(--ink-3); }
  .pf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .pf-textarea {
    width: 100%; padding: 10px 14px; border: 1px solid var(--border-strong);
    border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none; resize: vertical;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
    min-height: 100px; line-height: 1.6;
  }
  .pf-textarea::placeholder { color: var(--ink-3); }
  .pf-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .pf-select {
    width: 100%; padding: 10px 36px 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none; cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c9085' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .pf-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }

  .pf-grid-3 { display: grid; gap: 20px; grid-template-columns: 1fr 1fr 1fr; }
  .pf-grid-4 { display: grid; gap: 16px; grid-template-columns: 2fr 1fr 1fr; }
  @media (max-width: 768px) { .pf-grid-3, .pf-grid-4 { grid-template-columns: 1fr; } }

  /* ── Pricing inputs with prefix ── */
  .pf-input-wrap { position: relative; }
  .pf-input-prefix {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 38px; display: flex; align-items: center; justify-content: center;
    background: var(--surface-3); border-right: 1px solid var(--border);
    border-radius: 9px 0 0 9px; color: var(--ink-3); font-size: 0.85rem;
    pointer-events: none;
  }
  .pf-input-with-prefix { padding-left: 48px !important; }

  /* ── Attributes ── */
  .pf-attr-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .pf-attr-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 16px; background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 10px;
    transition: background 0.12s;
  }
  .pf-attr-row:hover { background: var(--accent-soft); }
  .pf-attr-name {
    font-weight: 600; color: var(--violet);
    font-size: 0.85rem;
  }
  .pf-attr-sep { color: var(--ink-3); margin: 0 8px; font-size: 0.8rem; }
  .pf-attr-value { color: var(--ink); font-size: 0.88rem; }
  .pf-attr-delete {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border);
    background: var(--surface); color: var(--danger); cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .pf-attr-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .pf-add-row {
    display: grid; gap: 12px; grid-template-columns: 1fr 1fr auto;
    padding: 16px; background: var(--surface-2); border: 1px solid var(--border);
    border-radius: 12px; align-items: end;
  }
  @media (max-width: 640px) { .pf-add-row { grid-template-columns: 1fr; } }

  .pf-btn-add-attr {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 18px; border: none; border-radius: 9px;
    background: var(--violet); color: white;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    font-weight: 600; cursor: pointer; transition: all 0.15s;
    white-space: nowrap;
  }
  .pf-btn-add-attr:hover { background: #3b3279; }

  /* ── Media ── */
  .pf-media-grid {
    display: grid; gap: 14px; grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;
  }
  @media (max-width: 768px) { .pf-media-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px) { .pf-media-grid { grid-template-columns: 1fr; } }

  .pf-media-card {
    background: var(--surface-2); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; transition: box-shadow 0.15s;
  }
  .pf-media-card:hover { box-shadow: var(--shadow-md); }
  .pf-media-img { width: 100%; height: 120px; object-fit: cover; display: block; }
  .pf-media-video-placeholder {
    width: 100%; height: 120px; display: flex; align-items: center;
    justify-content: center; background: var(--surface-3);
    color: var(--ink-3); font-size: 0.85rem; gap: 6px;
  }
  .pf-media-info {
    padding: 10px 12px; display: flex; align-items: center;
    justify-content: space-between; gap: 8px;
  }
  .pf-media-url {
    font-size: 0.72rem; color: var(--ink-3);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
  }
  .pf-media-meta {
    font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--ink-3);
    background: var(--surface-3); border: 1px solid var(--border);
    border-radius: 4px; padding: 1px 6px; white-space: nowrap;
  }
  .pf-media-delete {
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border);
    background: var(--surface); color: var(--danger); cursor: pointer;
    transition: all 0.15s; flex-shrink: 0;
  }
  .pf-media-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .pf-add-media-box {
    padding: 20px; background: var(--surface-2); border: 1px solid var(--border);
    border-radius: 12px;
  }
  .pf-add-media-grid { display: grid; gap: 14px; grid-template-columns: 2fr 1fr 1fr; margin-bottom: 14px; }
  @media (max-width: 640px) { .pf-add-media-grid { grid-template-columns: 1fr; } }
  .pf-btn-add-media {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border: none; border-radius: 9px;
    background: var(--accent); color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.25); transition: all 0.15s;
  }
  .pf-btn-add-media:hover:not(:disabled) { background: #b04518; }
  .pf-btn-add-media:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Loading ── */
  .pf-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 96px 0; gap: 16px;
  }
  .pf-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: pf-spin 0.7s linear infinite;
  }
  .pf-loading-text { font-size: 0.875rem; color: var(--ink-3); }

  /* ── Status select colors ── */
  .pf-status-badge {
    display: inline-block; padding: 2px 10px; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.02em;
  }

  /* ── Empty state ── */
  .pf-empty-attrs {
    text-align: center; padding: 32px 16px; color: var(--ink-3);
    font-size: 0.875rem; border: 1px dashed var(--border);
    border-radius: 12px; background: var(--surface-2); margin-bottom: 16px;
  }
`;

const TABS = [
  { id: 'basic',      label: 'Basic Info',           icon: BookOpen     },
  { id: 'pricing',    label: 'Pricing & Inventory',   icon: DollarSign   },
  { id: 'attributes', label: 'Attributes',            icon: Tag          },
  { id: 'media',      label: 'Media',                 icon: Image        },
];

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

  const [categories, setCategories]         = useState<Category[]>([]);
  const [brands, setBrands]                 = useState<Brand[]>([]);
  const [suppliers, setSuppliers]           = useState<Supplier[]>([]);
  const [mediaList, setMediaList]           = useState<Media[]>([]);
  const [newMediaUrl, setNewMediaUrl]       = useState('');
  const [newMediaType, setNewMediaType]     = useState<MediaType>('IMAGE');
  const [newMediaSortOrder, setNewMediaSortOrder] = useState('1');
  const [mediaLoading, setMediaLoading]     = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>([]);
  const [productAttrs, setProductAttrs]     = useState<ProductAttribute[]>([]);
  const [newAttrId, setNewAttrId]           = useState('');
  const [newAttrValue, setNewAttrValue]     = useState('');

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
    } catch { /* non-critical */ }
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
      const [medias, attrs] = await Promise.all([
        mediaService.getProductMedia(Number(id)),
        productAttributeService.getProductAttributes(Number(id)),
      ]);
      setMediaList(medias ?? []);
      setProductAttrs(attrs ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally { setIsLoading(false); }
  }, [id]);

  useEffect(() => { loadDropdowns(); loadProduct(); }, [loadDropdowns, loadProduct]);

  const handleSave = async () => {
    setError(null); setSuccess(null);
    if (!form.productName.trim()) { setError('Product name is required'); setActiveTab('basic'); return; }
    if (!form.price || Number(form.price) <= 0) { setError('Price must be greater than 0'); setActiveTab('pricing'); return; }
    setIsSaving(true);
    try {
      const payload = {
        productName: form.productName, description: form.description || undefined,
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
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally { setIsSaving(false); }
  };

  const handleAddMedia = async () => {
    if (!id) { setError('Save the product first before adding media'); return; }
    if (!newMediaUrl.trim()) return;
    setMediaLoading(true);
    try {
      await mediaService.uploadMedia({
        productId: Number(id), type: newMediaType,
        url: newMediaUrl, sortOrder: Number(newMediaSortOrder) || 1,
      });
      setNewMediaUrl('');
      const medias = await mediaService.getProductMedia(Number(id));
      setMediaList(medias ?? []);
    } catch { setError('Failed to add media'); }
    finally { setMediaLoading(false); }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    try {
      await mediaService.deleteMedia(mediaId);
      setMediaList((prev) => prev.filter((m) => m.mediaId !== mediaId));
    } catch { setError('Failed to delete media'); }
  };

  const handleAddAttr = async () => {
    if (!id) { setError('Save the product first before adding attributes'); return; }
    if (!newAttrId || !newAttrValue.trim()) return;
    try {
      await productAttributeService.createProductAttribute({
        productId: Number(id), attributeId: Number(newAttrId), value: newAttrValue,
      });
      setNewAttrId(''); setNewAttrValue('');
      const attrs = await productAttributeService.getProductAttributes(Number(id));
      setProductAttrs(attrs ?? []);
    } catch { setError('Failed to add attribute'); }
  };

  const handleDeleteAttr = async (attrId: number) => {
    try {
      await productAttributeService.deleteProductAttribute(attrId);
      setProductAttrs((prev) => prev.filter((a) => a.productAttributeId !== attrId));
    } catch { setError('Failed to delete attribute'); }
  };

  if (isLoading) {
    return (
      <div className="pf-root">
        <style>{css}</style>
        <div className="pf-loading">
          <div className="pf-spinner" />
          <p className="pf-loading-text">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="pf-header">
        <div className="pf-header-left">
          <div className="pf-icon-badge"><Package /></div>
          <div>
            <h1 className="pf-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            <div className="pf-divider" />
            <p className="pf-subtitle" style={{ marginTop: 6 }}>
              {isEdit ? 'Update product details and media' : 'Fill in the product details below'}
            </p>
          </div>
        </div>
        <div className="pf-header-actions">
          <button type="button" onClick={() => navigate('/admin/products')} className="pf-btn-cancel">
            <X size={15} /> Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} className="pf-btn-save">
            {isSaving ? <span className="pf-save-spinner" /> : <Save size={15} />}
            {isEdit ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="pf-alert-error">⚠ {error}</div>}
      {success && <div className="pf-alert-success">✓ {success}</div>}

      {/* ── Main card ── */}
      <div className="pf-card">
        {/* Tabs */}
        <div className="pf-tabs">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              type="button"
              onClick={() => setActiveTab(tid)}
              className={`pf-tab${activeTab === tid ? ' active' : ''}`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        <div className="pf-tab-body">

          {/* ── Basic Info ── */}
          {activeTab === 'basic' && (
            <div>
              <p className="pf-section-title">Product Identity</p>

              <div className="pf-field">
                <label className="pf-label">Product Name <span>*</span></label>
                <input
                  type="text" className="pf-input"
                  value={form.productName}
                  onChange={(e) => setForm({ ...form, productName: e.target.value })}
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                />
              </div>

              <div className="pf-field">
                <label className="pf-label">Description</label>
                <textarea
                  className="pf-textarea" rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description, features, specifications…"
                />
              </div>

              <p className="pf-section-title" style={{ marginTop: 8 }}>Classification</p>
              <div className="pf-grid-3">
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Category <span>*</span></label>
                  <select className="pf-select" value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Brand</label>
                  <select className="pf-select" value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                    ))}
                  </select>
                </div>
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Supplier</label>
                  <select className="pf-select" value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">Select supplier…</option>
                    {suppliers.map((s) => (
                      <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Pricing & Inventory ── */}
          {activeTab === 'pricing' && (
            <div>
              <p className="pf-section-title">Pricing & Stock</p>
              <div className="pf-grid-3">
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Price (₫) <span>*</span></label>
                  <div className="pf-input-wrap">
                    <span className="pf-input-prefix">₫</span>
                    <input type="number" min={0} className="pf-input pf-input-with-prefix"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="29990000"
                    />
                  </div>
                </div>
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Stock Quantity <span>*</span></label>
                  <input type="number" min={0} className="pf-input"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="pf-field" style={{ marginBottom: 0 }}>
                  <label className="pf-label">Status</label>
                  <select className="pf-select" value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Inactive</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Price preview */}
              {form.price && Number(form.price) > 0 && (
                <div style={{
                  marginTop: 24, padding: '14px 18px',
                  background: 'var(--accent-soft)', border: '1px solid var(--accent-mid)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <DollarSign size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
                    Listed price:{' '}
                    <strong style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace" }}>
                      ₫{Number(form.price).toLocaleString('vi-VN')}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Attributes ── */}
          {activeTab === 'attributes' && (
            <div>
              <p className="pf-section-title">Product Specifications</p>

              {!isEdit && (
                <div className="pf-alert-warning" style={{ marginBottom: 20 }}>
                  <Tag size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  Save the product first to add attributes.
                </div>
              )}

              {productAttrs.length > 0 ? (
                <div className="pf-attr-list">
                  {productAttrs.map((pa) => (
                    <div key={pa.productAttributeId} className="pf-attr-row">
                      <span>
                        <span className="pf-attr-name">{pa.attributeName ?? `Attr #${pa.attributeId}`}</span>
                        <span className="pf-attr-sep">·</span>
                        <span className="pf-attr-value">{pa.value}</span>
                      </span>
                      <button type="button" className="pf-attr-delete"
                        onClick={() => handleDeleteAttr(pa.productAttributeId)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : isEdit ? (
                <div className="pf-empty-attrs">No attributes added yet</div>
              ) : null}

              {isEdit && (
                <div className="pf-add-row">
                  <div>
                    <label className="pf-label">Attribute</label>
                    <select className="pf-select" value={newAttrId}
                      onChange={(e) => setNewAttrId(e.target.value)}>
                      <option value="">Select attribute…</option>
                      {availableAttributes.map((a) => (
                        <option key={a.attributeId} value={a.attributeId}>{a.attributeName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="pf-label">Value</label>
                    <input type="text" className="pf-input" value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      placeholder="e.g. 12GB"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAttr()}
                    />
                  </div>
                  <div>
                    <label className="pf-label" style={{ opacity: 0 }}>_</label>
                    <button type="button" onClick={handleAddAttr} className="pf-btn-add-attr"
                      style={{ width: '100%' }}>
                      <Plus size={15} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Media ── */}
          {activeTab === 'media' && (
            <div>
              <p className="pf-section-title">Product Images & Videos</p>

              {!isEdit && (
                <div className="pf-alert-warning" style={{ marginBottom: 20 }}>
                  <Image size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  Save the product first to add media.
                </div>
              )}

              {mediaList.length > 0 && (
                <div className="pf-media-grid">
                  {mediaList.map((m) => (
                    <div key={m.mediaId} className="pf-media-card">
                      {m.type === 'IMAGE' ? (
                        <img
                          src={m.url} alt="media" className="pf-media-img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="200" height="120" fill="%23f2efe9"/><text x="100" y="65" font-size="12" text-anchor="middle" fill="%239c9085" font-family="sans-serif">No Image</text></svg>';
                          }}
                        />
                      ) : (
                        <div className="pf-media-video-placeholder">
                          🎬 <span>Video</span>
                        </div>
                      )}
                      <div className="pf-media-info">
                        <span className="pf-media-url">{m.url}</span>
                        <span className="pf-media-meta">#{m.sortOrder}</span>
                        <button type="button" className="pf-media-delete"
                          onClick={() => handleDeleteMedia(m.mediaId)}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEdit && (
                <div className="pf-add-media-box">
                  <p className="pf-section-title" style={{ marginBottom: 14 }}>Add Media URL</p>
                  <div className="pf-add-media-grid">
                    <div>
                      <label className="pf-label">URL</label>
                      <input type="text" className="pf-input" value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="pf-label">Type</label>
                      <select className="pf-select" value={newMediaType}
                        onChange={(e) => setNewMediaType(e.target.value as MediaType)}>
                        <option value="IMAGE">IMAGE</option>
                        <option value="VIDEO">VIDEO</option>
                      </select>
                    </div>
                    <div>
                      <label className="pf-label">Sort Order</label>
                      <input type="number" min={1} className="pf-input"
                        value={newMediaSortOrder}
                        onChange={(e) => setNewMediaSortOrder(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddMedia}
                    disabled={mediaLoading} className="pf-btn-add-media">
                    {mediaLoading
                      ? <span className="pf-save-spinner" />
                      : <Plus size={15} />}
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