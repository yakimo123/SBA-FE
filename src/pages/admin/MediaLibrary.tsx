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

import { mediaService } from '../../services/mediaService';
import { productService } from '../../services/productService';
import { Media, MediaType, Product } from '../../types/product';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .ml-root {
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
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .ml-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .ml-header-left { display: flex; align-items: center; gap: 16px; }
  .ml-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .ml-icon-badge svg { color: white; width: 24px; height: 24px; }
  .ml-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .ml-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .ml-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .ml-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .ml-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .ml-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .ml-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  .ml-toolbar {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 16px 20px; margin-bottom: 20px;
    display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
  }
  .ml-search-wrap { position: relative; display: flex; align-items: center; }
  .ml-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .ml-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface-2);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ml-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .ml-select {
    padding: 7px 32px 7px 12px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface-2);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c9085' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
  }
  .ml-select:focus { border-color: var(--accent); }
  .ml-view-toggle {
    display: flex; align-items: center; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface-2); padding: 2px;
  }
  .ml-view-btn {
    padding: 6px 10px; border: none; background: transparent;
    color: var(--ink-3); cursor: pointer; border-radius: 6px;
    transition: all 0.15s;
  }
  .ml-view-btn:hover { color: var(--ink-2); }
  .ml-view-btn.active { background: var(--surface); color: var(--accent); box-shadow: var(--shadow-sm); }

  .ml-prompt {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 20px;
    border: 2px dashed var(--border); border-radius: var(--radius-lg);
    background: var(--surface-2); gap: 12px;
  }
  .ml-prompt-icon { color: var(--ink-3); }
  .ml-prompt-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  .ml-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .ml-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: ml-spin 0.7s linear infinite;
  }
  .ml-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes ml-spin { to { transform: rotate(360deg); } }

  .ml-grid {
    display: grid; gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  .ml-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .ml-card:hover { box-shadow: var(--shadow-sm); border-color: var(--border-strong); }
  .ml-card-img {
    width: 100%; aspect-ratio: 1; object-fit: cover; display: block;
  }
  .ml-card-video {
    width: 100%; aspect-ratio: 1; display: flex;
    align-items: center; justify-content: center;
    background: var(--surface-3); color: var(--ink-3);
  }
  .ml-card-info {
    padding: 10px 12px; display: flex; align-items: center;
    justify-content: space-between; gap: 8px;
  }
  .ml-card-url {
    font-size: 0.72rem; color: var(--ink-3);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
  }
  .ml-card-meta {
    font-family: 'DM Mono', monospace; font-size: 0.68rem;
    color: var(--ink-3); background: var(--surface-3);
    border: 1px solid var(--border); border-radius: 4px;
    padding: 2px 6px; white-space: nowrap;
  }
  .ml-card-delete {
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--danger); cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;
  }
  .ml-card-delete:hover { background: var(--danger-soft); border-color: #f5c2c2; }

  .ml-table { width: 100%; border-collapse: collapse; }
  .ml-table thead tr { border-bottom: 1px solid var(--border); }
  .ml-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .ml-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .ml-table tbody tr:hover td { background: var(--accent-soft); }
  .ml-type-badge {
    display: inline-flex; padding: 2px 8px; border-radius: 5px;
    font-size: 0.73rem; font-weight: 600;
  }
  .ml-type-image { background: var(--violet-soft); color: var(--violet); }
  .ml-type-video { background: var(--accent-soft); color: var(--accent); }

  .ml-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000; animation: ml-fade 0.15s ease;
  }
  @keyframes ml-fade { from { opacity: 0; } to { opacity: 1; } }
  .ml-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 440px;
    margin: 20px; animation: ml-slide 0.2s ease; overflow: hidden;
  }
  @keyframes ml-slide {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ml-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px; border-bottom: 1px solid var(--border);
  }
  .ml-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.3rem;
    font-weight: 400; color: var(--ink); margin: 0;
  }
  .ml-modal-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink-3); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 1.1rem; transition: all 0.15s; line-height: 1;
  }
  .ml-modal-close:hover { background: var(--surface-2); color: var(--ink); }
  .ml-modal-body { padding: 22px 24px 26px; }
  .ml-field { margin-bottom: 16px; }
  .ml-label {
    display: block; font-size: 0.8rem; font-weight: 600;
    color: var(--ink-2); margin-bottom: 7px;
  }
  .ml-label span { color: var(--danger); margin-left: 2px; }
  .ml-input, .ml-select-full {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border-strong); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    color: var(--ink); background: var(--surface); outline: none;
    transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
  }
  .ml-select-full { cursor: pointer; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c9085' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
    padding-right: 36px;
  }
  .ml-input:focus, .ml-select-full:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12);
  }
  .ml-form-error {
    display: flex; align-items: center; gap: 8px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-radius: 8px; padding: 10px 14px;
    font-size: 0.83rem; color: var(--danger); margin-top: 12px;
  }
  .ml-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .ml-btn-cancel {
    padding: 9px 18px; border: 1px solid var(--border-strong);
    border-radius: 9px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer;
  }
  .ml-btn-cancel:hover { background: var(--surface-2); }
  .ml-btn-save {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 20px; border: none; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 3px 10px rgba(201,82,26,0.3);
  }
  .ml-btn-save:hover:not(:disabled) { transform: translateY(-1px); }
  .ml-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .ml-save-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: ml-spin 0.6s linear infinite;
  }
`;

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [search, setSearch] = useState('');

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
      if (selectedProductId === form.productId) {
        fetchMedia();
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add media');
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
    <div className="ml-root">
      <style>{css}</style>

      <div className="ml-header">
        <div className="ml-header-left">
          <div className="ml-icon-badge">
            <ImageIcon />
          </div>
          <div>
            <h1 className="ml-title">
              Media Library
              {mediaList.length > 0 && (
                <span className="ml-count-pill">{mediaList.length}</span>
              )}
            </h1>
            <div className="ml-divider" />
            <p className="ml-subtitle" style={{ marginTop: 6 }}>
              Manage your images and files
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ productId: '', type: 'IMAGE', url: '', sortOrder: '1' });
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="ml-add-btn"
        >
          <Plus size={17} /> Upload Media
        </button>
      </div>

      {error && <div className="ml-error">⚠ {error}</div>}

      <div className="ml-toolbar">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="ml-select"
          style={{ minWidth: 180 }}
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.productName}
            </option>
          ))}
        </select>
        <div className="ml-search-wrap">
          <Search />
          <input
            type="text"
            className="ml-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL…"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="ml-select"
        >
          <option value="">All Types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Videos</option>
        </select>
        <div className="ml-view-toggle" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`ml-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid size={16} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`ml-view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>

      {!selectedProductId && !isLoading && (
        <div className="ml-prompt">
          <ImageIcon size={48} className="ml-prompt-icon" />
          <p className="ml-prompt-text">Select a product to view its media</p>
        </div>
      )}

      {selectedProductId && isLoading && (
        <div className="ml-loading">
          <div className="ml-spinner" />
          <p className="ml-loading-text">Loading media…</p>
        </div>
      )}

      {selectedProductId && !isLoading && (
        <>
          {filteredMedia.length === 0 ? (
            <div className="ml-prompt">
              <ImageIcon size={48} className="ml-prompt-icon" />
              <p className="ml-prompt-text">No media found for this product.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="ml-grid">
              {filteredMedia.map((m) => (
                <div key={m.mediaId} className="ml-card">
                  {m.type === 'IMAGE' ? (
                    <img
                      src={m.url}
                      alt="media"
                      className="ml-card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="ml-card-video">
                      <Video size={32} />
                    </div>
                  )}
                  <div className="ml-card-info">
                    <span className="ml-card-url">{m.url}</span>
                    <span className="ml-card-meta">#{m.sortOrder}</span>
                    <button
                      type="button"
                      className="ml-card-delete"
                      onClick={() => handleDelete(m.mediaId)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <table className="ml-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>URL</th>
                    <th>Sort</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((m) => (
                    <tr key={m.mediaId}>
                      <td
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '0.78rem',
                          color: 'var(--ink-3)',
                        }}
                      >
                        #{m.mediaId}
                      </td>
                      <td>
                        <span
                          className={`ml-type-badge ${
                            m.type === 'IMAGE' ? 'ml-type-image' : 'ml-type-video'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.85rem',
                            color: 'var(--violet)',
                            textDecoration: 'none',
                          }}
                        >
                          {m.url}
                        </a>
                      </td>
                      <td>{m.sortOrder}</td>
                      <td>
                        <button
                          type="button"
                          className="ml-card-delete"
                          onClick={() => handleDelete(m.mediaId)}
                        >
                          <Trash2 size={12} />
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

      {isModalOpen && (
        <div
          className="ml-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ml-modal-header">
              <h2 className="ml-modal-title">Add Media</h2>
              <button
                type="button"
                className="ml-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="ml-modal-body">
              <div className="ml-field">
                <label className="ml-label">Product <span>*</span></label>
                <select
                  className="ml-select-full"
                  value={form.productId}
                  onChange={(e) =>
                    setForm({ ...form, productId: e.target.value })
                  }
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ml-field">
                <label className="ml-label">Type</label>
                <select
                  className="ml-select-full"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as MediaType })
                  }
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
              </div>
              <div className="ml-field">
                <label className="ml-label">Sort Order</label>
                <input
                  type="number"
                  min={1}
                  className="ml-input"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                />
              </div>
              <div className="ml-field">
                <label className="ml-label">URL <span>*</span></label>
                <input
                  type="text"
                  className="ml-input"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formError && (
                <div className="ml-form-error">⚠ {formError}</div>
              )}
              <div className="ml-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ml-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMedia}
                  disabled={isSaving}
                  className="ml-btn-save"
                >
                  {isSaving && <span className="ml-save-spinner" />}
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
