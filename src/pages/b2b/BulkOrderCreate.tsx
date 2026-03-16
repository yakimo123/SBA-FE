import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Package,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { BulkOrderItem, TierPrice } from '../../types';


// Mock data
const allProducts = [
  { id: '1', name: 'Sản phẩm A', brand: 'Brand X', category: 'Điện tử', price: 100000, image: '' },
  { id: '2', name: 'Sản phẩm B', brand: 'Brand Y', category: 'Thời trang', price: 200000, image: '' },
  { id: '3', name: 'Sản phẩm C', brand: 'Brand Z', category: 'Gia dụng', price: 150000, image: '' },
];

const mockTierPrices: Record<string, TierPrice[]> = {
  '1': [
    { minQty: 1, maxQty: 9, unitPrice: 100000, discountPercent: 0 },
    { minQty: 10, maxQty: 49, unitPrice: 95000, discountPercent: 5 },
    { minQty: 50, maxQty: null, unitPrice: 90000, discountPercent: 10 },
  ],
  '2': [
    { minQty: 1, maxQty: 9, unitPrice: 200000, discountPercent: 0 },
    { minQty: 10, maxQty: 49, unitPrice: 190000, discountPercent: 5 },
    { minQty: 50, maxQty: null, unitPrice: 180000, discountPercent: 10 },
  ],
  '3': [
    { minQty: 1, maxQty: 9, unitPrice: 150000, discountPercent: 0 },
    { minQty: 10, maxQty: 49, unitPrice: 145000, discountPercent: 3 },
    { minQty: 50, maxQty: null, unitPrice: 140000, discountPercent: 7 },
  ],
};

// Helper functions
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const getActiveTier = (productId: string, qty: number) => {
  const tiers = mockTierPrices[productId] || [];
  return [...tiers]
    .reverse()
    .find((t) => qty >= t.minQty);
};

export function BulkOrderCreate() {
  const navigate = useNavigate();
  const { addOrder } = useBulkOrders();
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<BulkOrderItem[]>([]);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addProduct = (productId: string) => {
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;
    const existing = cartItems.find((i) => i.productId === productId);
    if (existing) {
      updateQty(productId, existing.quantity + 1);
      return;
    }
    const tier = getActiveTier(productId, 1);
    const unitPrice = tier?.unitPrice ?? product.price;
    setCartItems((prev) => [
      ...prev,
      {
        productId,
        productName: product.name,
        quantity: 1,
        unitPrice,
        tierPrice: tier,
        subtotal: unitPrice,
      },
    ]);
  };

  const updateQty = (productId: string | number, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const tier = getActiveTier(String(productId), qty);
        const unitPrice = tier?.unitPrice ?? item.unitPrice;
        return { ...item, quantity: qty, unitPrice, tierPrice: tier, subtotal: unitPrice * qty };
      })
    );
  };

  const removeItem = (productId: string | number) =>
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const total = subtotal - voucherDiscount;

  const handleApplyVoucher = () => {
    setVoucherError('');
    const code = voucherInput.toUpperCase().trim();
    if (!code) return;
    if (cartItems.length === 0) { setVoucherError('Vui lòng thêm sản phẩm trước khi áp voucher'); return; }
    if (code === 'B2B10') {
      setVoucherCode('B2B10');
      setVoucherDiscount(Math.round(subtotal * 0.1));
    } else if (code === 'B2B20') {
      setVoucherCode('B2B20');
      setVoucherDiscount(Math.round(subtotal * 0.2));
    } else {
      setVoucherCode('');
      setVoucherDiscount(0);
      setVoucherError('Mã voucher không hợp lệ hoặc đã hết hạn');
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherInput('');
    setVoucherError('');
  };

  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    const result = await addOrder(cartItems, voucherCode, note);
    setSubmitting(false);
    if (result) {
      navigate('/company/orders');
    } else {
      // Hiển thị thông báo lỗi nếu cần
      alert('Tạo đơn hàng thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header Section ── */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <button onClick={() => navigate('/company')} className="hover:text-slate-900 transition-colors">
              B2B Portal
            </button>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <button onClick={() => navigate('/company/orders')} className="hover:text-slate-900 transition-colors">
              Đơn hàng
            </button>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-medium text-slate-900">Tạo đơn hàng mới</span>
          </nav>

          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tạo đơn hàng mới</h1>
              <p className="mt-1 text-sm text-slate-600">Chọn sản phẩm và số lượng để tạo đơn hàng B2B</p>
            </div>
            {cartItems.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-semibold text-slate-900">{cartItems.length} sản phẩm</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-bold text-blue-600">{fmt(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Product Catalog
          ══════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16">
                  <div className="text-center text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Không tìm thấy sản phẩm nào</p>
                  </div>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const tiers = mockTierPrices[product.id];
                  const inCart = cartItems.find((i) => i.productId === product.id);
                  const isExpanded = expandedTier === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-xl border shadow-sm transition-all ${inCart
                        ? 'border-blue-200 ring-2 ring-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      {/* Product Row */}
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border border-slate-200">
                              <Package className="h-8 w-8 text-slate-400" />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 mb-1">{product.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                {product.brand}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">{product.category}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-xs text-slate-500 mb-0.5">Giá niêm yết</p>
                                <p className="text-lg font-bold text-slate-900">{fmt(product.price)}</p>
                              </div>

                              {tiers && (
                                <button
                                  onClick={() => setExpandedTier(isExpanded ? null : product.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${isExpanded
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Giá theo số lượng</span>
                                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Add to Cart / Quantity Controls */}
                          <div className="flex-shrink-0">
                            {inCart ? (
                              <div className="flex flex-col items-end gap-2">
                                <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-1">
                                  <button
                                    onClick={() => updateQty(product.id, inCart.quantity - 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-red-50 transition-colors shadow-sm"
                                  >
                                    <Minus className="h-4 w-4 text-slate-600" />
                                  </button>
                                  <span className="min-w-[2rem] text-center text-sm font-bold text-slate-900">
                                    {inCart.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQty(product.id, inCart.quantity + 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-blue-50 transition-colors shadow-sm"
                                  >
                                    <Plus className="h-4 w-4 text-slate-600" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                  = <span className="font-semibold text-blue-600">{fmt(inCart.subtotal)}</span>
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => addProduct(product.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                              >
                                <Plus className="h-4 w-4" />
                                Thêm vào giỏ
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tier Pricing Expansion */}
                        {isExpanded && tiers && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                              Bảng giá theo số lượng
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {tiers.map((tier, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                  <div>
                                    <p className="text-xs font-medium text-slate-600">
                                      {tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : '+'} sản phẩm
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{fmt(tier.unitPrice)}</p>
                                  </div>
                                  {tier.discountPercent > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                      -{tier.discountPercent}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Sticky Cart Summary
          ══════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5">

              {/* Cart Items Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {/* Cart Header */}
                <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50 border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <ShoppingCart className="h-5 w-5 text-indigo-700" />
                    </div>
                    <span className="font-bold text-slate-900 text-base">Giỏ hàng</span>
                  </div>
                  {cartItems.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold shadow-md"
                        style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
                      >
                        {cartItems.length} SP
                      </span>
                    </div>
                  )}
                </div>

                {/* Cart Content */}
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                      <ShoppingCart className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Giỏ hàng trống</p>
                      <p className="text-xs text-slate-400 mt-1">Thêm sản phẩm để bắt đầu đặt hàng</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={String(item.productId)} className="group px-6 py-5 hover:bg-slate-50/50 transition-all duration-200">
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                                {item.productName}
                              </p>
                              {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                    -{item.tierPrice.discountPercent}% Tier
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    từ {item.tierPrice.minQty}+ sp
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between gap-4">
                            {/* Quantity Stepper */}
                            <div className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 bg-white p-1 shadow-sm hover:border-indigo-300 transition-colors">
                              <button
                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150"
                                title="Giảm"
                              >
                                <Minus className="h-4 w-4 text-slate-600 hover:text-red-600" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                                min={1}
                                className="w-14 bg-transparent text-center text-sm font-bold text-slate-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-indigo-50 active:scale-95 transition-all duration-150"
                                title="Tăng"
                              >
                                <Plus className="h-4 w-4 text-slate-600 hover:text-indigo-700" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-base font-bold text-slate-900">{fmt(item.subtotal)}</p>
                              <p className="text-xs text-slate-500">{fmt(item.unitPrice)} / sp</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Footer - Subtotal */}
                    <div className="border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">
                            {cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-900">{fmt(subtotal)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Voucher Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-amber-50 p-2">
                    <Tag className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="font-bold text-sm text-slate-900">Mã giảm giá</p>
                </div>

                {voucherCode ? (
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500 p-1.5 shadow-md">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900 mb-0.5">{voucherCode}</p>
                          <p className="text-xs font-semibold text-emerald-600">Tiết kiệm {fmt(voucherDiscount)}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white hover:text-red-600 transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                        placeholder="Nhập mã giảm giá"
                        className={`flex-1 rounded-xl border-2 py-3 px-4 text-sm font-medium outline-none transition-all ${voucherError
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                          : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100'
                          }`}
                      />
                      <button
                        onClick={handleApplyVoucher}
                        className="rounded-xl px-5 text-sm font-bold active:scale-95 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                        style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {voucherError}
                      </div>
                    )}
                    <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                      <p className="text-xs text-indigo-700">
                        💡 <span className="font-semibold">Mã khả dụng:</span> <span className="font-mono font-bold">B2B10</span> · <span className="font-mono font-bold">B2B20</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-3">
                <p className="font-bold text-sm text-slate-900">📝 Ghi chú đơn hàng</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập yêu cầu về đơn hàng (giao hàng, đóng gói, thời gian...)"
                  rows={3}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 resize-none"
                />
              </div>

              {/* Order Summary & Checkout */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                {/* Summary Title */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-tight text-slate-900">Tóm tắt đơn hàng</p>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} SP
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Tạm tính</span>
                    <span className="font-semibold tabular-nums text-slate-900">{fmt(subtotal)}</span>
                  </div>

                  {voucherDiscount > 0 && (
                    <div className="-mx-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Giảm giá</span>
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {voucherCode}
                        </span>
                      </div>
                      <span className="font-bold tabular-nums text-emerald-600">-{fmt(voucherDiscount)}</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="mt-1 border-t border-slate-200 pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <span className="text-sm font-medium uppercase tracking-wide text-slate-500">Tổng cộng</span>
                      <span className="text-3xl sm:text-4xl leading-none font-bold tracking-tight tabular-nums text-slate-900">
                        {fmt(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || cartItems.length === 0}
                  className={`w-full rounded-2xl py-4 text-base font-bold shadow-md transition-all duration-200 ${cartItems.length === 0 || submitting
                    ? 'bg-slate-300 cursor-not-allowed opacity-60 text-white'
                    : 'text-white hover:bg-indigo-800 hover:shadow-lg active:scale-[0.99]'
                    }`}
                  style={cartItems.length === 0 || submitting ? undefined : { backgroundColor: '#4338ca', color: '#ffffff' }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-3 border-white border-t-transparent" />
                      <span>Đang xử lý...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3 text-base font-semibold">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Đặt hàng ngay</span>
                    </span>
                  )}
                </button>

                {cartItems.length === 0 && (
                  <p className="text-center text-xs text-slate-400 -mt-2">
                    Vui lòng thêm sản phẩm vào giỏ hàng
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">

            {/* Modal Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Xác nhận đơn hàng</h2>
              <p className="mt-0.5 text-xs text-slate-500">Vui lòng kiểm tra lại trước khi gửi</p>
            </div>

            {/* Order Items */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 px-6">
              {cartItems.map((item) => (
                <div key={String(item.productId)} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.productName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-slate-500">SL: {item.quantity}</span>
                      {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                          -{item.tierPrice.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold text-slate-900">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-dashed border-slate-200 mx-6" />
            <div className="space-y-2 px-6 py-4 text-sm bg-slate-50/40">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Voucher <span className="font-mono font-bold">{voucherCode}</span></span>
                  <span className="font-medium">-{fmt(voucherDiscount)}</span>
                </div>
              )}
              {note && (
                <div className="flex justify-between text-slate-500">
                  <span>Ghi chú</span>
                  <span className="max-w-[180px] truncate text-right italic text-xs">{note}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-lg font-bold border-t border-slate-200">
                <span className="text-slate-900">Tổng cộng</span>
                <span className="text-indigo-700">{fmt(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
              >
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
