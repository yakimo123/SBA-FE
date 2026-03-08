import { Edit, Eye, Package, Plus, Search, SlidersHorizontal, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { brandService } from '../../services/brandService';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Brand, Category, Product, ProductStatus } from '../../types/product';

const PAGE_SIZE = 10;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .pl-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
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
    --warning: #b06010;
    --warning-soft: #fef6eb;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-md: 0 4px 16px rgba(26,22,18,0.08), 0 2px 6px rgba(26,22,18,0.05);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  /* ── Header ── */
  .pl-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }
  .pl-header-left { display: flex; align-items: center; gap: 16px; }
  .pl-icon-badge {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35);
    flex-shrink: 0;
  }
  .pl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .pl-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem; font-weight: 400;
    color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .pl-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .pl-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .pl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .pl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s ease; white-space: nowrap;
  }
  .pl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }
  .pl-add-btn:active { transform: translateY(0); }

  /* ── Filter card ── */
  .pl-filters {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .pl-filters-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 16px;
  }
  .pl-filters-header svg { color: var(--ink-3); width: 15px; height: 15px; }
  .pl-filters-label {
    font-family: 'DM Mono', monospace; font-size: 0.72rem;
    text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-3);
  }
  .pl-filters-grid {
    display: grid; gap: 14px;
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
  @media (max-width: 900px) { .pl-filters-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .pl-filters-grid { grid-template-columns: 1fr; } }

  .pl-field-label {
    display: block; font-size: 0.78rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 6px; letter-spacing: 0.01em;
  }
  .pl-search-wrap { position: relative; display: flex; align-items: center; }
  .pl-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .pl-search {
    padding: 8px 12px 8px 32px; border: 1px solid var(--border-strong);
    border-radius: 9px; background: var(--surface-2);
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
    color: var(--ink); outline: none; width: 100%; box-sizing: border-box;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .pl-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); background: var(--surface); }
  .pl-select {
    width: 100%; padding: 8px 12px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    background: var(--surface-2); font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem; color: var(--ink); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c9085' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    padding-right: 30px;
  }
  .pl-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); background-color: var(--surface); }

  /* ── Error ── */
  .pl-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  /* ── Loading ── */
  .pl-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .pl-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: pl-spin 0.7s linear infinite;
  }
  .pl-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes pl-spin { to { transform: rotate(360deg); } }

  /* ── Table card ── */
  .pl-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .pl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .pl-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .pl-table { width: 100%; border-collapse: collapse; }
  .pl-table thead tr { border-bottom: 1px solid var(--border); }
  .pl-table th {
    padding: 11px 16px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2); white-space: nowrap;
  }
  .pl-table td {
    padding: 13px 16px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
    font-size: 0.875rem;
  }
  .pl-table tbody tr:last-child td { border-bottom: none; }
  .pl-table tbody tr:hover td { background: var(--accent-soft); }

  /* ── Product name cell ── */
  .pl-name-cell { display: flex; align-items: center; gap: 10px; }
  .pl-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent-mid); flex-shrink: 0; }
  .pl-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; line-height: 1.3; }

  /* ── Badges ── */
  .pl-cat-badge {
    display: inline-flex; align-items: center;
    background: var(--surface-2); border: 1px solid var(--border);
    color: var(--ink-2); font-size: 0.75rem; font-weight: 500;
    padding: 2px 8px; border-radius: 5px;
  }
  .pl-brand-badge {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-size: 0.75rem; font-weight: 500; padding: 2px 8px; border-radius: 5px;
  }
  .pl-price {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 500; color: var(--ink); white-space: nowrap;
  }

  .pl-stock-ok { font-family: 'DM Mono', monospace; font-size: 0.82rem; font-weight: 600; color: var(--success); }
  .pl-stock-low { font-family: 'DM Mono', monospace; font-size: 0.82rem; font-weight: 600; color: var(--warning); }
  .pl-stock-out { font-family: 'DM Mono', monospace; font-size: 0.82rem; font-weight: 600; color: var(--danger); }

  .pl-status-available {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .pl-status-unavailable {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--surface-2); color: var(--ink-3);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; border: 1px solid var(--border); letter-spacing: 0.02em;
  }
  .pl-status-outofstock {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .pl-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  /* ── Action buttons ── */
  .pl-actions { display: flex; gap: 5px; align-items: center; }
  .pl-btn-view {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-3); cursor: pointer; transition: all 0.15s;
  }
  .pl-btn-view:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .pl-btn-edit {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--violet); cursor: pointer; transition: all 0.15s;
  }
  .pl-btn-edit:hover { background: var(--violet-soft); border-color: var(--violet); }
  .pl-btn-delete {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
  }
  .pl-btn-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  /* ── Empty state ── */
  .pl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 72px 20px; gap: 12px;
  }
  .pl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .pl-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  /* ── Pagination ── */
  .pl-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 20px 0 0;
  }
  .pl-page-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-2);
    cursor: pointer; transition: all 0.15s;
  }
  .pl-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .pl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .pl-page-info {
    font-family: 'DM Mono', monospace; font-size: 0.78rem;
    color: var(--ink-3); padding: 0 8px;
  }
`;

const statusConfig = (status: ProductStatus) => {
  const map: Record<ProductStatus, { label: string; className: string }> = {
    AVAILABLE:    { label: 'Available',    className: 'pl-status-available'   },
    UNAVAILABLE:  { label: 'Inactive',     className: 'pl-status-unavailable' },
    OUT_OF_STOCK: { label: 'Out of Stock', className: 'pl-status-outofstock'  },
  };
  return map[status] ?? { label: status, className: 'pl-status-unavailable' };
};

export function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [brands, setBrands]           = useState<Brand[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    search: '', categoryId: '', brandId: '', status: '',
  });

  const loadFilters = useCallback(async () => {
    try {
      const [catData, brandData] = await Promise.all([
        categoryService.getCategories(0, 100),
        brandService.getBrands(0, 100),
      ]);
      setCategories(catData.content ?? []);
      setBrands(brandData.content ?? []);
    } catch { /* non-critical */ }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const data = await productService.getProducts({
        page, size: PAGE_SIZE,
        keyword: filters.search || undefined,
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        brandId: filters.brandId ? Number(filters.brandId) : undefined,
      });
      setProducts(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally { setIsLoading(false); }
  }, [page, filters.search, filters.categoryId, filters.brandId]);

  useEffect(() => { loadFilters(); }, [loadFilters]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete product "${product.productName}"?`)) return;
    try {
      await productService.deleteProduct(product.productId);
      fetchProducts();
    } catch { alert('Failed to delete product'); }
  };

  const stockClass = (qty: number) =>
    qty === 0 ? 'pl-stock-out' : qty < 20 ? 'pl-stock-low' : 'pl-stock-ok';

  return (
    <div className="pl-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="pl-header">
        <div className="pl-header-left">
          <div className="pl-icon-badge"><Package /></div>
          <div>
            <h1 className="pl-title">
              Products
              {totalElements > 0 && (
                <span className="pl-count-pill">{totalElements}</span>
              )}
            </h1>
            <div className="pl-divider" />
            <p className="pl-subtitle" style={{ marginTop: 6 }}>Manage your product inventory</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/admin/products/new')} className="pl-add-btn">
          <Plus size={17} /> Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="pl-filters">
        <div className="pl-filters-header">
          <SlidersHorizontal />
          <span className="pl-filters-label">Filters</span>
        </div>
        <div className="pl-filters-grid">
          <div>
            <label className="pl-field-label">Search</label>
            <div className="pl-search-wrap">
              <Search />
              <input
                type="text"
                className="pl-search"
                placeholder="Search by product name…"
                value={filters.search}
                onChange={(e) => { setPage(0); setFilters({ ...filters, search: e.target.value }); }}
              />
            </div>
          </div>
          <div>
            <label className="pl-field-label">Category</label>
            <select
              className="pl-select"
              value={filters.categoryId}
              onChange={(e) => { setPage(0); setFilters({ ...filters, categoryId: e.target.value }); }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="pl-field-label">Brand</label>
            <select
              className="pl-select"
              value={filters.brandId}
              onChange={(e) => { setPage(0); setFilters({ ...filters, brandId: e.target.value }); }}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="pl-field-label">Status</label>
            <select
              className="pl-select"
              value={filters.status}
              onChange={(e) => { setPage(0); setFilters({ ...filters, status: e.target.value }); }}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div className="pl-error">⚠ {error}</div>}

      {/* ── Table ── */}
      {isLoading ? (
        <div className="pl-loading">
          <div className="pl-spinner" />
          <p className="pl-loading-text">Loading products…</p>
        </div>
      ) : (
        <div className="pl-table-card">
          <div className="pl-table-toolbar">
            <span className="pl-filters-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={13} style={{ color: 'var(--ink-3)' }} />
              Product Inventory
            </span>
            <span className="pl-table-meta">{products.length} result{products.length !== 1 ? 's' : ''}</span>
          </div>

          {products.length === 0 ? (
            <div className="pl-empty">
              <div className="pl-empty-icon"><Package size={22} /></div>
              <p className="pl-empty-text">No products found</p>
            </div>
          ) : (
            <table className="pl-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const s = statusConfig(product.status);
                  return (
                    <tr key={product.productId}>
                      <td>
                        <div className="pl-name-cell">
                          <div className="pl-dot" />
                          <span className="pl-name-text">{product.productName}</span>
                        </div>
                      </td>
                      <td>
                        {product.categoryName
                          ? <span className="pl-cat-badge">{product.categoryName}</span>
                          : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                      </td>
                      <td>
                        {product.brandName
                          ? <span className="pl-brand-badge">{product.brandName}</span>
                          : <span style={{ color: 'var(--ink-3)' }}>—</span>}
                      </td>
                      <td>
                        <span className="pl-price">₫{product.price.toLocaleString('vi-VN')}</span>
                      </td>
                      <td>
                        <span className={stockClass(product.quantity)}>{product.quantity}</span>
                      </td>
                      <td>
                        <span className={s.className}>
                          <span className="pl-status-dot" />
                          {s.label}
                        </span>
                      </td>
                      <td>
                        <div className="pl-actions">
                          <button
                            type="button"
                            className="pl-btn-view"
                            title="View"
                            onClick={() => navigate(`/admin/products/${product.productId}/edit`)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="pl-btn-edit"
                            title="Edit"
                            onClick={() => navigate(`/admin/products/${product.productId}/edit`)}
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            className="pl-btn-delete"
                            title="Delete"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pl-pagination">
          <button
            type="button" disabled={page === 0}
            onClick={() => setPage((p) => p - 1)} className="pl-page-btn"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="pl-page-info">{page + 1} / {totalPages}</span>
          <button
            type="button" disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)} className="pl-page-btn"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}