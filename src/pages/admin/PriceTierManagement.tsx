import {
  ArrowLeft,
  Edit2,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import priceTierService from '../../services/priceTierService';
import productService from '../../services/productService';
import { BulkPriceTier } from '../../types';
import { Product } from '../../types/product';

const css = `
  .ptm-root { padding: 32px; background: #f3f4f6; min-height: 100vh; }
  .ptm-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; }
  .ptm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .ptm-title-block { display: flex; align-items: center; gap: 16px; }
  
  .ptm-search-box { position: relative; margin-bottom: 24px; }
  .ptm-search-input { width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e5e7eb; border-radius: 12px; outline: none; color: #1a1a1a; font-size: 0.95rem; }
  .ptm-search-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.1); }
  .ptm-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
  
  .ptm-product-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .ptm-p-card { padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s; background: white; }
  .ptm-p-card:hover { border-color: #7c3aed; transform: translateY(-2px); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .ptm-p-card.active { border-color: #7c3aed; background: #f5f3ff; }
  .ptm-p-name { font-weight: 600; font-size: 0.9rem; margin-bottom: 4px; display: block; color: #1a1a1a; }
  .ptm-p-sku { font-family: 'Outfit', sans-serif; font-size: 0.75rem; color: #9ca3af; }

  .ptm-table { width: 100%; border-collapse: collapse; }
  .ptm-table th { padding: 14px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
  .ptm-table td { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; color: #374151; }
  
  .ptm-input { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; width: 100%; font-family: 'Outfit', sans-serif; color: #1a1a1a; }
  .ptm-input:focus { border-color: #7c3aed; outline: none; box-shadow: 0 0 0 2px rgba(124,58,237,0.1); }

  .ptm-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 50; backdrop-filter: blur(4px); }
  .ptm-modal { background: white; border-radius: 20px; width: 440px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
  .ptm-modal-title { font-family: 'Outfit', sans-serif; font-size: 1.8rem; margin-bottom: 24px; color: #1a1a1a; }

  .bod-back-btn { 
    padding: 0;
    display: flex; align-items: center; justify-content: center;
    width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e5e7eb;
    background: white; cursor: pointer; transition: all 0.2s; color: #374151;
  }
  .bod-back-btn:hover { background: #f9fafb; border-color: #7c3aed; color: #7c3aed; }

  .bod-btn-primary { 
    width: 100%; padding: 12px; border-radius: 8px; background: #7c3aed; color: white;
    font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; transition: all 0.2s;
  }
  .bod-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

  .bod-filter-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; display: block; }
`;

export function PriceTierManagement() {
  const { productId: urlProductId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<BulkPriceTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<BulkPriceTier | null>(null);
  const [formData, setFormData] = useState<{
    minQty: number;
    maxQty: number | null;
    unitPrice: number;
  }>({ minQty: 0, maxQty: null, unitPrice: 0 });

  const fetchTiers = useCallback(async (pid: number) => {
    setLoading(true);
    try {
      const data = await priceTierService.getTiersByProductId(pid);
      setTiers(data.sort((a, b) => a.minQty - b.minQty));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query) {
      setProducts([]);
      return;
    }
    try {
      const res = await productService.searchProducts(query);
      setProducts(res.content);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(search), 300);
    return () => clearTimeout(timer);
  }, [search, searchProducts]);

  useEffect(() => {
    if (urlProductId) {
      const fetchInitialProduct = async () => {
        try {
          const p = await productService.getProductById(parseInt(urlProductId));
          setSelectedProduct(p);
          fetchTiers(p.productId);
        } catch (err) {
          console.error(err);
        }
      };
      fetchInitialProduct();
    }
  }, [urlProductId, fetchTiers]);

  const handleCreateOrUpdate = async () => {
    if (!selectedProduct) return;
    try {
      if (editingTier) {
        await priceTierService.updateTier(editingTier.bulkPriceTierId, formData);
      } else {
        await priceTierService.createTier({
          ...formData,
          productId: selectedProduct.productId,
        });
      }
      setShowModal(false);
      setEditingTier(null);
      fetchTiers(selectedProduct.productId);
    } catch (err) {
      console.error(err);
      alert('Failed to save tier');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    try {
      await priceTierService.deleteTier(id);
      if (selectedProduct) fetchTiers(selectedProduct.productId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ptm-root">
      <style>{css}</style>

      <div className="ptm-header">
        <div className="ptm-title-block">
          <button className="bod-back-btn" onClick={() => navigate('/admin')}>
            <ArrowLeft size={20} />
          </button>
          <h1
            style={{
              fontSize: '2.5rem',
              fontFamily: 'Outfit',
              margin: 0,
              color: '#1a1a1a',
            }}
          >
            Price Tier Manager
          </h1>
        </div>
        {selectedProduct && (
          <button
            className="bod-btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => {
              setEditingTier(null);
              setFormData({ minQty: 0, maxQty: null, unitPrice: 0 });
              setShowModal(true);
            }}
          >
            <Plus size={20} /> Add New Tier
          </button>
        )}
      </div>

      {!selectedProduct && (
        <div className="max-w-2xl mx-auto">
          <div className="ptm-search-box">
            <Search className="ptm-search-icon" size={20} />
            <input
              className="ptm-search-input"
              placeholder="Search product to manage tiers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="ptm-product-list">
            {products.map((p) => (
              <div
                key={p.productId}
                className="ptm-p-card"
                onClick={() => {
                  setSelectedProduct(p);
                  fetchTiers(p.productId);
                  navigate(`/admin/products/price-tiers/${p.productId}`);
                }}
              >
                <span className="ptm-p-name">{p.productName}</span>
                <span className="ptm-p-sku">Stock: {p.quantity}</span>
              </div>
            ))}
          </div>

          {search && products.length === 0 && (
            <div className="text-center py-12" style={{ color: '#6b7280' }}>
              No products found matching "{search}"
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <div className="space-y-6">
          <div
            className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <div
              style={{
                background: '#fff1f0',
                padding: 12,
                borderRadius: 8,
                color: '#ee4d2d',
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  fontWeight: 600,
                }}
              >
                MANAGING TIERS FOR
              </div>
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                {selectedProduct.productName}
              </div>
            </div>
            <button
              className="ml-auto text-sm hover:underline"
              style={{ color: '#7c3aed' }}
              onClick={() => {
                setSelectedProduct(null);
                navigate('/admin/products/price-tiers');
              }}
            >
              Change Product
            </button>
          </div>

          <div className="ptm-card">
            <table className="ptm-table">
              <thead>
                <tr>
                  <th>Qty Range</th>
                  <th>Unit Price (VNĐ)</th>
                  <th>Discount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12"
                      style={{ color: '#9ca3af' }}
                    >
                      Loading tiers...
                    </td>
                  </tr>
                ) : tiers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12"
                      style={{ color: '#6b7280' }}
                    >
                      No wholesale tiers defined for this product.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier) => (
                    <tr key={tier.bulkPriceTierId}>
                      <td style={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {tier.minQty}
                        {tier.maxQty ? ` - ${tier.maxQty}` : '+'} units
                      </td>
                      <td
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 600,
                          color: '#7c3aed',
                        }}
                      >
                        {new Intl.NumberFormat('vi-VN').format(tier.unitPrice)}đ
                      </td>
                      <td>
                        <span className="bg-[#fff1f0] text-[#ee4d2d] px-2 py-1 rounded-[10px] text-xs font-bold">
                          -{tier.discountPercent}%
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-4">
                          <button
                            style={{
                              color: '#9ca3af',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = '#7c3aed')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = '#9ca3af')
                            }
                            onClick={() => {
                              setEditingTier(tier);
                              setFormData({
                                minQty: tier.minQty,
                                maxQty: tier.maxQty,
                                unitPrice: tier.unitPrice,
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            style={{
                              color: '#9ca3af',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = '#dc2626')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = '#9ca3af')
                            }
                            onClick={() => handleDelete(tier.bulkPriceTierId)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="ptm-modal-overlay">
          <div className="ptm-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="ptm-modal-title">
                {editingTier ? 'Edit Tier' : 'Add Price Tier'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="bod-filter-label">Min Qty</label>
                  <input
                    type="number"
                    className="ptm-input"
                    value={formData.minQty}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minQty: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="bod-filter-label">Max Qty (Optional)</label>
                  <input
                    type="number"
                    className="ptm-input"
                    value={formData.maxQty || ''}
                    placeholder="None"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxQty: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="bod-filter-label">Unit Price (VNĐ)</label>
                <input
                  type="number"
                  className="ptm-input"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unitPrice: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <button
                className="bod-btn-primary"
                style={{ marginTop: 12 }}
                onClick={handleCreateOrUpdate}
              >
                <Save size={18} />{' '}
                {editingTier ? 'Update Tier' : 'Save New Tier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
