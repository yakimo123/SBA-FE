import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { VoucherSelector } from '../../components/common/VoucherSelector';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useBulkOrders } from '../../contexts/BulkOrderContext';
import bulkOrderService from '../../services/bulkOrderService';
import productService from '../../services/productService';
import { VoucherResponse } from '../../services/voucherService';
import { CompanyProduct } from '../../types/product';

// ─── Local cart types (not submitted to API, used only during order building) ─
interface CartEntry {
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  /** unit price from last server response (or product.price fallback) */
  unitPrice: number;
  subtotal: number;
  customizations?: { type: string; note?: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const PAGE_SIZE = 10;

export function BulkOrderCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrders } = useBulkOrders();

  // ── Product search state ─────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<CompanyProduct[]>([]);
  const [productPage, setProductPage] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(0);
  const [productLoading, setProductLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cart ─────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);

  // ── Voucher ──────────────────────────────────────────────────────────────
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [isVoucherSelectorOpen, setIsVoucherSelectorOpen] = useState(false);

  // ── Submit ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // ── Customizations ───────────────────────────────────────────────────────
  const [editingCustomizationId, setEditingCustomizationId] = useState<
    number | null
  >(null);
  const [customType, setCustomType] = useState('LOGO_PRINT');
  const [customNote, setCustomNote] = useState('');

  // ── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (keyword: string, page: number) => {
    setProductLoading(true);
    try {
      const data = await productService.getCompanyProducts({
        keyword: keyword || undefined,
        page,
        size: PAGE_SIZE,
        sort: 'productName,asc',
      });
      setProducts(data.content);
      setProductTotalPages(data.totalPages ?? 1);
    } catch {
      setProducts([]);
    } finally {
      setProductLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchProducts('', 0);
  }, [fetchProducts]);

  // Set default shipping address from user data
  useEffect(() => {
    if (user?.address && !shippingAddress) {
      setShippingAddress(user.address);
    }
  }, [user, shippingAddress]);

  // debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setProductPage(0);
      fetchProducts(value, 0);
    }, 400);
  };

  const handlePageChange = (page: number) => {
    setProductPage(page);
    fetchProducts(search, page);
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const getEffectivePrice = (product: CompanyProduct, qty: number) => {
    if (!product.priceTiers || product.priceTiers.length === 0)
      return product.price;

    // Find the highest minQty tier that is <= quantity
    const applicableTier = [...product.priceTiers]
      .filter((t) => t.isActive && qty >= t.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0];

    return applicableTier ? applicableTier.unitPrice : product.price;
  };

  const addToCart = (product: CompanyProduct) => {
    const existing = cartItems.find((i) => i.productId === product.productId);
    if (existing) {
      updateQty(product.productId, existing.quantity + 1);
      return;
    }

    const price = getEffectivePrice(product, 1);
    setCartItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.productName,
        productImage: product.mainImage,
        quantity: 1,
        unitPrice: price,
        subtotal: price,
      },
    ]);
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }

    const product = products.find((p) => p.productId === productId);
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;

        const effectiveUnitPrice = product
          ? getEffectivePrice(product, qty)
          : item.unitPrice;

        return {
          ...item,
          quantity: qty,
          unitPrice: effectiveUnitPrice,
          subtotal: effectiveUnitPrice * qty,
        };
      })
    );
  };

  const removeItem = (productId: number) =>
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));

  const addCustomization = (productId: number) => {
    if (!customType) return;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const current = item.customizations || [];
        return {
          ...item,
          customizations: [
            ...current,
            { type: customType, note: customNote.trim() },
          ],
        };
      })
    );
    setEditingCustomizationId(null);
    setCustomType('LOGO_PRINT');
    setCustomNote('');
  };

  const removeCustomization = (productId: number, index: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const current = item.customizations || [];
        return {
          ...item,
          customizations: current.filter((_, i) => i !== index),
        };
      })
    );
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);

  // ── Voucher ──────────────────────────────────────────────────────────────
  const handleApplyVoucher = () => {
    setVoucherError('');
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    if (cartItems.length === 0) {
      setVoucherError('Vui lòng thêm sản phẩm trước khi áp voucher');
      return;
    }
    setVoucherCode(code);
  };

  const handleSelectVoucher = (voucher: VoucherResponse) => {
    setVoucherCode(voucher.voucherCode);
    setVoucherInput(voucher.voucherCode);
    setIsVoucherSelectorOpen(false);
    setVoucherError('');
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setVoucherInput('');
    setVoucherError('');
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    setSubmitError('');
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setSubmitError('');
    try {
      if (!user) throw new Error('Chưa đăng nhập');
      const userId =
        typeof user.userId === 'string'
          ? parseInt(user.userId, 10)
          : user.userId;

      await bulkOrderService.createBulkOrder(
        {
          voucherCode: voucherCode || undefined,
          shippingAddress: shippingAddress || undefined,
          items: cartItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customizations:
              i.customizations && i.customizations.length > 0
                ? i.customizations
                : undefined,
          })),
        },
        userId
      );
      await refreshOrders();
      navigate('/company/orders');
    } catch (err: unknown) {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err instanceof Error ? err.message : null) ||
        'Tạo đơn hàng thất bại. Vui lòng thử lại.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <button
              onClick={() => navigate('/company')}
              className="hover:text-slate-900 transition-colors"
            >
              B2B Portal
            </button>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <button
              onClick={() => navigate('/company/orders')}
              className="hover:text-slate-900 transition-colors"
            >
              Đơn hàng
            </button>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="font-medium text-slate-900">Tạo đơn hàng mới</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Tạo đơn hàng mới
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Chọn sản phẩm và số lượng để tạo đơn hàng B2B
              </p>
            </div>
            {cartItems.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border border-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <div className="text-sm">
                  <span className="font-semibold text-slate-900">
                    {cartItems.length} sản phẩm
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="font-bold text-blue-600">
                    {fmt(subtotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Two Column Layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ LEFT — Product Catalog ═══ */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              {productLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    <p className="text-sm">Đang tải sản phẩm...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16">
                  <div className="text-center text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      Không tìm thấy sản phẩm nào
                    </p>
                  </div>
                </div>
              ) : (
                products.map((product) => {
                  const inCart = cartItems.find(
                    (i) => i.productId === product.productId
                  );
                  return (
                    <div
                      key={product.productId}
                      className={`bg-white rounded-xl border shadow-sm transition-all ${
                        inCart
                          ? 'border-blue-200 ring-2 ring-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden border border-slate-200">
                              {product.mainImage ? (
                                <img
                                  src={product.mainImage}
                                  alt={product.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {product.productName}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {product.brandName && (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                  {product.brandName}
                                </span>
                              )}
                              {product.categoryName && (
                                <>
                                  <span className="text-xs text-slate-400">
                                    •
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {product.categoryName}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Bảng giá sỉ
                              </p>
                              {product.priceTiers &&
                              product.priceTiers.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {product.priceTiers
                                    .filter((t) => t.isActive)
                                    .sort((a, b) => a.minQty - b.minQty)
                                    .map((tier, idx) => (
                                      <div
                                        key={idx}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="text-slate-600">
                                          Từ {tier.minQty} SP:
                                        </span>
                                        <span className="font-bold text-indigo-600">
                                          {fmt(tier.unitPrice)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm font-bold text-slate-900">
                                  {fmt(product.price)}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Add to Cart / Qty */}
                          <div className="flex-shrink-0">
                            {inCart ? (
                              <div className="flex flex-col items-end gap-2">
                                <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-1">
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        product.productId,
                                        inCart.quantity - 1
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-red-50 transition-colors shadow-sm"
                                  >
                                    <Minus className="h-4 w-4 text-slate-600" />
                                  </button>
                                  <span className="min-w-[2rem] text-center text-sm font-bold text-slate-900">
                                    {inCart.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQty(
                                        product.productId,
                                        inCart.quantity + 1
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white hover:bg-blue-50 transition-colors shadow-sm"
                                  >
                                    <Plus className="h-4 w-4 text-slate-600" />
                                  </button>
                                </div>
                                <p className="text-xs text-slate-500">
                                  ={' '}
                                  <span className="font-semibold text-blue-600">
                                    {fmt(inCart.subtotal)}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
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

            {/* Pagination */}
            {productTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  disabled={productPage === 0}
                  onClick={() => handlePageChange(productPage - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: productTotalPages }, (_, i) => i).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                        p === productPage
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p + 1}
                    </button>
                  )
                )}
                <button
                  disabled={productPage >= productTotalPages - 1}
                  onClick={() => handlePageChange(productPage + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* ═══ RIGHT — Cart Summary ═══ */}
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
                    <span className="font-bold text-slate-900 text-base">
                      Giỏ hàng
                    </span>
                  </div>
                  {cartItems.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold shadow-md"
                      style={{ backgroundColor: '#4338ca', color: '#ffffff' }}
                    >
                      {cartItems.length} SP
                    </span>
                  )}
                </div>

                {/* Cart Content */}
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                      <ShoppingCart className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">
                        Giỏ hàng trống
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Thêm sản phẩm để bắt đầu đặt hàng
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 max-h-[calc(100vh-20rem)] overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.productId}
                          className="group px-6 py-5 hover:bg-slate-50/50 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="text-sm font-semibold text-slate-900 leading-snug">
                              {item.productName}
                            </p>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price Tiers for this item */}
                          {(() => {
                            const product = products.find(
                              (p) => p.productId === item.productId
                            );
                            if (
                              !product ||
                              !product.priceTiers ||
                              product.priceTiers.length === 0
                            )
                              return null;
                            return (
                              <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                  Bảng giá sỉ áp dụng
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {product.priceTiers
                                    .filter((t) => t.isActive)
                                    .sort((a, b) => a.minQty - b.minQty)
                                    .map((tier, idx) => {
                                      const isCurrent =
                                        item.quantity >= tier.minQty &&
                                        (!tier.maxQty ||
                                          item.quantity <= tier.maxQty);
                                      return (
                                        <div
                                          key={idx}
                                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg border transition-all ${
                                            isCurrent
                                              ? 'bg-indigo-600 border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                                              : 'bg-white border-slate-200'
                                          }`}
                                        >
                                          <span
                                            className={`text-[10px] font-medium ${
                                              isCurrent
                                                ? 'text-white'
                                                : 'text-slate-500'
                                            }`}
                                          >
                                            {tier.minQty}+ SP
                                          </span>
                                          <span
                                            className={`text-[11px] font-bold ${
                                              isCurrent
                                                ? 'text-white'
                                                : 'text-indigo-600'
                                            }`}
                                          >
                                            {fmt(tier.unitPrice)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            );
                          })()}

                          <div className="flex items-center justify-between gap-4">
                            <div className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 bg-white p-1 shadow-sm hover:border-indigo-300 transition-colors">
                              <button
                                onClick={() =>
                                  updateQty(item.productId, item.quantity - 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 active:scale-95 transition-all duration-150"
                              >
                                <Minus className="h-4 w-4 text-slate-600" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQty(
                                    item.productId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min={1}
                                className="w-14 bg-transparent text-center text-sm font-bold text-slate-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() =>
                                  updateQty(item.productId, item.quantity + 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-indigo-50 active:scale-95 transition-all duration-150"
                              >
                                <Plus className="h-4 w-4 text-slate-600" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-base font-bold text-slate-900">
                                {fmt(item.subtotal)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {fmt(item.unitPrice)} / sp
                              </p>
                            </div>
                          </div>

                          {/* Customizations Section */}
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            {/* List existing customizations */}
                            {item.customizations &&
                              item.customizations.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {item.customizations.map((c, idx) => (
                                    <div
                                      key={idx}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                                    >
                                      <div>
                                        <span className="font-semibold">
                                          {c.type}
                                        </span>
                                        {c.note && (
                                          <span className="text-slate-500 ml-1">
                                            - {c.note}
                                          </span>
                                        )}
                                        <span className="ml-2 text-[10px] italic text-amber-600 font-medium">
                                          (Phí: Chờ admin xác nhận)
                                        </span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          removeCustomization(
                                            item.productId,
                                            idx
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 self-end sm:self-auto font-medium transition"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Add new customization */}
                            {editingCustomizationId === item.productId ? (
                              <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Loại tùy chọn
                                  </label>
                                  <select
                                    value={customType}
                                    onChange={(e) =>
                                      setCustomType(e.target.value)
                                    }
                                    className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 p-2 outline-none bg-white"
                                  >
                                    <option value="LOGO_ENGRAVING">
                                      Khắc Logo/Laser
                                    </option>
                                    <option value="KEYCAP_CUSTOM">
                                      Tùy chỉnh Keycap/Switch
                                    </option>
                                    <option value="SPEC_UPGRADE">
                                      Nâng cấp cấu hình
                                    </option>
                                    <option value="COLOR_CUSTOM">
                                      Tùy chỉnh màu sắc/Vỏ
                                    </option>
                                    <option value="GIFT_PACKAGING">
                                      Đóng gói quà tặng
                                    </option>
                                    <option value="OTHER">Yêu cầu khác</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Ghi chú thêm (không bắt buộc)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Vd: Khắc logo mặt A, Nâng cấp RAM 32GB, bọc chống sốc..."
                                    value={customNote}
                                    onChange={(e) =>
                                      setCustomNote(e.target.value)
                                    }
                                    className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 p-2 outline-none bg-white"
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() =>
                                      addCustomization(item.productId)
                                    }
                                    className="flex-1 bg-indigo-600 text-white rounded-lg py-1.5 text-xs font-semibold hover:bg-indigo-700 transition"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() =>
                                      setEditingCustomizationId(null)
                                    }
                                    className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-lg py-1.5 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingCustomizationId(item.productId);
                                  setCustomType('LOGO_PRINT');
                                  setCustomNote('');
                                }}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition block text-left w-full"
                              >
                                + Thêm tùy chọn (in/thêu/phối màu...)
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal */}
                    <div className="border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">
                            {cartItems.reduce((s, i) => s + i.quantity, 0)} sản
                            phẩm
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-900">
                          {fmt(subtotal)}
                        </span>
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
                  <p className="font-bold text-sm text-slate-900">
                    Mã giảm giá
                  </p>
                </div>

                {voucherCode ? (
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500 p-1.5 shadow-md">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900 mb-0.5">
                            {voucherCode}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Sẽ được áp dụng khi đặt hàng
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveVoucher}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => {
                          setVoucherInput(e.target.value.toUpperCase());
                          setVoucherError('');
                        }}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleApplyVoucher()
                        }
                        placeholder="Nhập mã giảm giá"
                        className={`flex-1 rounded-xl border-2 py-3 px-4 text-sm font-medium outline-none transition-all ${
                          voucherError
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

                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-6 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all"
                      onClick={() => setIsVoucherSelectorOpen(true)}
                    >
                      <Ticket className="w-5 h-5" />
                      <span>Chọn voucher có sẵn</span>
                    </Button>
                    {voucherError && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {voucherError}
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      Mã voucher sẽ được xác thực khi đặt hàng
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping Address Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    Địa chỉ giao hàng
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Nhập địa chỉ giao hàng chi tiết..."
                    rows={3}
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    * Đơn hàng sỉ sẽ được admin liên hệ xác nhận địa chỉ và phí
                    vận chuyển sau khi đặt.
                  </p>
                </div>
              </div>

              {/* Order Summary & Checkout */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-tight text-slate-900">
                    Tóm tắt đơn hàng
                  </p>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} SP
                  </span>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Tạm tính</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {fmt(subtotal)}
                    </span>
                  </div>

                  {voucherCode && (
                    <div className="-mx-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">
                          Voucher
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {voucherCode}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium italic">
                        (áp dụng khi đặt)
                      </span>
                    </div>
                  )}

                  <div className="mt-1 border-t border-slate-200 pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Tổng cộng
                      </span>
                      <span className="text-3xl sm:text-4xl leading-none font-bold tracking-tight tabular-nums text-slate-900">
                        {fmt(subtotal)}
                      </span>
                    </div>
                    {voucherCode && (
                      <p className="text-xs text-emerald-600 text-right mt-1">
                        * Giảm giá sẽ hiển thị sau khi server xác nhận voucher
                      </p>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {submitError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cartItems.length === 0}
                  className={`w-full rounded-2xl py-4 text-base font-bold shadow-md transition-all duration-200 ${
                    cartItems.length === 0 || submitting
                      ? 'bg-slate-300 cursor-not-allowed opacity-60 text-white'
                      : 'text-white hover:bg-indigo-800 hover:shadow-lg active:scale-[0.99]'
                  }`}
                  style={
                    cartItems.length === 0 || submitting
                      ? undefined
                      : { backgroundColor: '#4338ca', color: '#ffffff' }
                  }
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

      {/* ── Confirmation Modal ──────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Xác nhận đơn hàng
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Vui lòng kiểm tra lại trước khi gửi
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 px-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.productName}
                    </p>
                    <span className="text-xs text-slate-500">
                      SL: {item.quantity}
                    </span>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold text-slate-900">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 mx-6" />
            <div className="space-y-2 px-6 py-4 text-sm bg-slate-50/40">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>
              {voucherCode && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Voucher{' '}
                    <span className="font-mono font-bold">{voucherCode}</span>
                  </span>
                  <span className="italic text-xs">(xác nhận bởi server)</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-lg font-bold border-t border-slate-200">
                <span className="text-slate-900">Tổng cộng</span>
                <span className="text-indigo-700">{fmt(subtotal)}</span>
              </div>
              {shippingAddress && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Giao đến:
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {shippingAddress}
                  </p>
                </div>
              )}
            </div>

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

      {/* Voucher Selector Dialog */}
      <VoucherSelector
        open={isVoucherSelectorOpen}
        onOpenChange={setIsVoucherSelectorOpen}
        onSelect={handleSelectVoucher}
        subtotal={subtotal}
      />
    </div>
  );
}
