import { AlertCircle,CheckCircle2, Minus, Plus, Search, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { allProducts, mockTierPrices } from '../../data/mockData';
import { BulkOrderItem, TierPrice } from '../../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/** Lấy tier price phù hợp với số lượng */
function getActiveTier(productId: string, qty: number): TierPrice | undefined {
  const tiers = mockTierPrices[productId];
  if (!tiers) return undefined;
  return [...tiers]
    .reverse()
    .find((t) => qty >= t.minQty);
}

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
    addOrder(cartItems, voucherCode, voucherDiscount, note, total, subtotal);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    navigate('/company/orders');
  };

  return (
    <div className="space-y-6 font-['Fira_Sans']">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-2xl font-bold text-blue-900">Tạo đơn hàng mới</h1>
          <p className="mt-1 text-sm text-gray-500">Chọn sản phẩm, điều chỉnh số lượng và xác nhận đơn hàng</p>
        </div>
        {cartItems.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200">
            <ShoppingCart className="h-4 w-4" />
            {cartItems.length} sản phẩm · {fmt(total)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ══════════════════════════════════════════
            CỘT TRÁI — Danh mục sản phẩm
        ══════════════════════════════════════════ */}
        <div className="xl:col-span-2 space-y-3">

          {/* Thanh tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, thương hiệu..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Bảng sản phẩm */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3 text-right">Giá niêm yết</th>
                  <th className="px-5 py-3 text-center w-24">Tier price</th>
                  <th className="px-5 py-3 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const tiers = mockTierPrices[product.id];
                  const inCart = cartItems.find((i) => i.productId === product.id);
                  const isExpanded = expandedTier === product.id;

                  return (
                    <React.Fragment key={product.id}>
                      {/* ── Hàng sản phẩm ── */}
                      <tr className={`border-b border-gray-50 transition-colors ${inCart ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.brand} · {product.category}</p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="font-semibold text-gray-800">{fmt(product.price)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {tiers ? (
                            <button
                              onClick={() => setExpandedTier(isExpanded ? null : product.id)}
                              className={`rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors ${
                                isExpanded
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                              }`}
                            >
                              {isExpanded ? '▲ Ẩn' : '▼ Xem giá'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">Không có</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {inCart ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateQty(product.id, inCart.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                {inCart.quantity}
                              </span>
                              <button
                                onClick={() => updateQty(product.id, inCart.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addProduct(product.id)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              + Thêm
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* ── Hàng tier price (mở rộng) ── */}
                      {isExpanded && tiers && (
                        <tr className="border-b border-blue-100 bg-blue-50/60">
                          <td colSpan={4} className="px-8 py-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                              Bảng giá theo số lượng
                            </p>
                            <div className="inline-block min-w-[280px]">
                              <table className="w-full text-xs border border-blue-100 rounded-lg overflow-hidden">
                                <thead>
                                  <tr className="bg-blue-100 text-blue-700">
                                    <th className="px-3 py-1.5 text-left font-semibold">Số lượng</th>
                                    <th className="px-3 py-1.5 text-right font-semibold">Đơn giá / sp</th>
                                    <th className="px-3 py-1.5 text-right font-semibold">Tiết kiệm</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-blue-50">
                                  {tiers.map((tier, i) => (
                                    <tr key={i} className="hover:bg-blue-50/50">
                                      <td className="px-3 py-1.5 text-gray-700">
                                        {tier.minQty}{tier.maxQty ? ` – ${tier.maxQty}` : ' trở lên'}
                                      </td>
                                      <td className="px-3 py-1.5 text-right font-semibold text-blue-800">
                                        {fmt(tier.unitPrice)}
                                      </td>
                                      <td className="px-3 py-1.5 text-right">
                                        {tier.discountPercent > 0 ? (
                                          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                            -{tier.discountPercent}%
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">Giá gốc</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            CỘT PHẢI — Giỏ hàng & thanh toán
        ══════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* ── Giỏ hàng ── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header giỏ hàng */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-sm text-gray-800">Giỏ hàng</span>
              </div>
              {cartItems.length > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </div>

            {/* Nội dung giỏ */}
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                <ShoppingCart className="h-8 w-8 opacity-30" />
                <p className="text-sm">Chưa có sản phẩm nào</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={String(item.productId)} className="px-5 py-3 space-y-2">
                      {/* Tên + xóa */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-gray-900 leading-snug flex-1">
                          {item.productName}
                        </p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Tier badge */}
                      {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                            -{item.tierPrice.discountPercent}%
                          </span>
                          <span className="text-xs text-gray-400">
                            áp dụng từ {item.tierPrice.minQty} sp
                          </span>
                        </div>
                      )}

                      {/* Số lượng + thành tiền */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                          <button
                            onClick={() => updateQty(item.productId, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Minus className="h-3 w-3 text-gray-500" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-10 bg-transparent text-center text-xs font-semibold text-gray-800 outline-none"
                          />
                          <button
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Plus className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{fmt(item.subtotal)}</p>
                          <p className="text-xs text-gray-400">{fmt(item.unitPrice)} / sp</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal nhỏ trong giỏ */}
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-2.5 flex justify-between text-xs text-gray-500">
                  <span>{cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
                  <span className="font-semibold text-gray-700">{fmt(subtotal)}</span>
                </div>
              </>
            )}
          </div>

          {/* ── Voucher ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
            <p className="font-semibold text-sm text-gray-800">Mã giảm giá</p>

            {voucherCode ? (
              /* Voucher đã áp dụng */
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-800">{voucherCode}</p>
                    <p className="text-xs text-green-600">Giảm {fmt(voucherDiscount)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveVoucher}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                >
                  Xóa
                </button>
              </div>
            ) : (
              /* Nhập voucher */
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => { setVoucherInput(e.target.value.toUpperCase()); setVoucherError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                      placeholder="Nhập mã voucher"
                      className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition ${
                        voucherError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    className="rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Áp dụng
                  </button>
                </div>
                {voucherError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {voucherError}
                  </div>
                )}
                <p className="text-xs text-gray-400">Gợi ý: <span className="font-mono">B2B10</span>, <span className="font-mono">B2B20</span></p>
              </div>
            )}
          </div>

          {/* ── Ghi chú ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
            <p className="font-semibold text-sm text-gray-800">Ghi chú đơn hàng</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Yêu cầu đặc biệt về giao hàng, đóng gói..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* ── Tổng tiền & Đặt hàng ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium text-gray-800">{fmt(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({voucherCode})</span>
                  <span className="font-medium">-{fmt(voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-2.5 text-base font-bold">
                <span className="text-gray-900">Tổng cộng</span>
                <span className="text-blue-700">{fmt(total)}</span>
              </div>
            </div>

            {/* Nút đặt hàng */}
            <button
              onClick={handleSubmit}
              disabled={submitting || cartItems.length === 0}
              className="relative w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Đặt hàng
                  {cartItems.length > 0 && <span className="opacity-80">· {fmt(total)}</span>}
                </span>
              )}
            </button>

            {cartItems.length === 0 && (
              <p className="text-center text-xs text-gray-400">Thêm sản phẩm để tiếp tục</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Modal xác nhận đặt hàng ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Header modal */}
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-base font-bold text-gray-900">Xác nhận đơn hàng</h2>
              <p className="mt-0.5 text-xs text-gray-500">Vui lòng kiểm tra lại trước khi gửi</p>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 px-6">
              {cartItems.map((item) => (
                <div key={String(item.productId)} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">{item.productName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-gray-400">SL: {item.quantity}</span>
                      {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                          -{item.tierPrice.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                    {fmt(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="border-t border-dashed border-gray-200 mx-6" />
            <div className="space-y-1.5 px-6 py-4 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Voucher <span className="font-mono font-bold">{voucherCode}</span></span>
                  <span>-{fmt(voucherDiscount)}</span>
                </div>
              )}
              {note && (
                <div className="flex justify-between text-gray-500">
                  <span>Ghi chú</span>
                  <span className="max-w-[180px] truncate text-right italic">{note}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-bold">
                <span className="text-gray-900">Tổng cộng</span>
                <span className="text-blue-700">{fmt(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
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
