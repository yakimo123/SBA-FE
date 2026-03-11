import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Package,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProductResponse, VoucherResponse } from '../../types';
import productService from '../../services/productService';
import voucherService from '../../services/voucherService';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Helper functions
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export function BulkOrderCreate() {
  const navigate = useNavigate();
  const { createOrder } = useBulkOrders();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDetail, setVoucherDetail] = useState<VoucherResponse | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch products from API
  const fetchProducts = useCallback(async (keyword?: string) => {
    setLoadingProducts(true);
    try {
      const data = await productService.search(keyword, undefined, undefined, 0, 50);
      setProducts(data.content);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search || undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  const addProduct = (product: ProductResponse) => {
    const existing = cartItems.find((i) => i.productId === product.productId);
    if (existing) {
      updateQty(product.productId, existing.quantity + 1);
      return;
    }
    setCartItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price,
      },
    ]);
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        return { ...item, quantity: qty, subtotal: item.unitPrice * qty };
      })
    );
  };

  const removeItem = (productId: number) =>
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);

  // Calculate discount preview
  const voucherDiscount = voucherDetail
    ? voucherDetail.discountType === 'PERCENTAGE'
      ? subtotal * voucherDetail.discountValue / 100
      : voucherDetail.discountValue
    : 0;
  const total = subtotal - voucherDiscount;

  const handleApplyVoucher = async () => {
    setVoucherError('');
    const code = voucherInput.toUpperCase().trim();
    if (!code) return;
    if (cartItems.length === 0) { setVoucherError('Vui lòng thêm sản phẩm trước khi áp voucher'); return; }
    setVoucherLoading(true);
    try {
      const valid = await voucherService.validate(code, user?.userId ?? 0);
      if (!valid) {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        return;
      }
      const detail = await voucherService.getByCode(code);
      setVoucherCode(code);
      setVoucherDetail(detail);
    } catch {
      setVoucherError('Không thể xác thực mã giảm giá. Vui lòng thử lại.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setVoucherInput('');
    setVoucherDetail(null);
    setVoucherError('');
  };

  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await createOrder({
        companyId: 1, // TODO: Get from user's company
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        voucherCode: voucherCode || undefined,
      });
      navigate('/company/orders');
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
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
              {loadingProducts ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500">Đang tải sản phẩm...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16">
                  <div className="text-center text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Không tìm thấy sản phẩm nào</p>
                  </div>
                </div>
              ) : (
                products.map((product) => {
                  const inCart = cartItems.find((i) => i.productId === product.productId);

                  return (
                    <div
                      key={product.productId}
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
                            <h3 className="text-base font-semibold text-slate-900 mb-1">{product.productName}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              {product.brandName && (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                  {product.brandName}
                                </span>
                              )}
                              {product.categoryName && (
                                <>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">{product.categoryName}</span>
                                </>
                              )}
                              {product.quantity != null && (
                                <>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">Kho: {product.quantity}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-xs text-slate-500 mb-0.5">Giá niêm yết</p>
                                <p className="text-lg font-bold text-slate-900">{fmt(product.price)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Add to Cart / Quantity Controls */}
                          <div className="flex-shrink-0">
                            {inCart ? (
                              <div className="flex flex-col items-end gap-2">
                                <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-1">
                                  <button
                                    onClick={() => updateQty(product.productId, inCart.quantity - 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-red-50 transition-colors shadow-sm"
                                  >
                                    <Minus className="h-4 w-4 text-slate-600" />
                                  </button>
                                  <span className="min-w-[2rem] text-center text-sm font-bold text-slate-900">
                                    {inCart.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQty(product.productId, inCart.quantity + 1)}
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
                                onClick={() => addProduct(product)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                              >
                                <Plus className="h-4 w-4" />
                                Thêm vào giỏ
                              </button>
                            )}
                          </div>
                        </div>
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
                        <div key={item.productId} className="group px-6 py-5 hover:bg-slate-50/50 transition-all duration-200">
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 leading-snug mb-1">
                                {item.productName}
                              </p>
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

                {voucherCode && voucherDetail ? (
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald-900 mb-0.5">{voucherCode}</p>
                          <p className="text-xs font-semibold text-emerald-600">
                            Giảm {voucherDetail.discountType === 'PERCENTAGE'
                              ? `${voucherDetail.discountValue}% (-${fmt(voucherDiscount)})`
                              : fmt(voucherDetail.discountValue)}
                          </p>
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
                        disabled={voucherLoading}
                        className="rounded-xl px-5 text-sm font-bold active:scale-95 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap disabled:opacity-60"
                        style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
                      >
                        {voucherLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </button>
                    </div>
                    {voucherError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {voucherError}
                      </div>
                    )}
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

                  {voucherCode && voucherDetail && (
                    <div className="-mx-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Voucher</span>
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {voucherCode}
                        </span>
                      </div>
                      <span className="font-semibold text-emerald-600">-{fmt(voucherDiscount)}</span>
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
                <div key={item.productId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.productName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-slate-500">SL: {item.quantity}</span>
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
              {voucherCode && (
                <div className="flex justify-between text-emerald-600">
                  <span>Voucher <span className="font-mono font-bold">{voucherCode}</span></span>
                  <span className="text-xs">Áp dụng khi thanh toán</span>
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
