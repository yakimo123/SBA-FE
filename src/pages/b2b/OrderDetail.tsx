import { ArrowLeft, CheckCircle2, Clock, Package, Pencil, Truck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { BulkOrderStatus } from '../../types';

const STATUS_LABEL: Record<BulkOrderStatus, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy',
};
const STATUS_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  PROCESSING: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  SHIPPED: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const TIMELINE = [
  { status: 'PENDING' as BulkOrderStatus, label: 'Chờ duyệt', icon: Clock },
  { status: 'APPROVED' as BulkOrderStatus, label: 'Đã duyệt', icon: CheckCircle2 },
  { status: 'PROCESSING' as BulkOrderStatus, label: 'Xử lý', icon: Package },
  { status: 'SHIPPED' as BulkOrderStatus, label: 'Đang giao', icon: Truck },
  { status: 'DELIVERED' as BulkOrderStatus, label: 'Đã giao', icon: CheckCircle2 },
];
const STATUS_ORDER: BulkOrderStatus[] = ['PENDING', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, cancelOrder, updateCustomization } = useBulkOrders();
  const [customInput, setCustomInput] = useState('');
  const [saving, setSaving] = useState(false);

  const order = orders.find((o) => o.orderId === id);

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
        <XCircle className="h-10 w-10 opacity-40" />
        <p className="text-sm">Không tìm thấy đơn hàng</p>
        <button onClick={() => navigate('/company/orders')} className="text-xs text-blue-600 hover:underline">
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const currentStep = order.status === 'CANCELLED' ? -1 : STATUS_ORDER.indexOf(order.status);

  const handleSaveCustomization = async () => {
    if (!customInput.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateCustomization(order.orderId, customInput.trim());
    setCustomInput('');
    setSaving(false);
  };

  const handleCancel = () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    cancelOrder(order.orderId);
  };

  return (
    <div className="space-y-6">

      {/* ── Back + header ── */}
      <div>
        <button
          onClick={() => navigate('/company/orders')}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Đơn hàng của tôi
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Đơn hàng
                <span className="ml-2 font-mono text-blue-600">{order.orderId}</span>
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Tạo lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          {order.status === 'PENDING' && (
            <button
              onClick={handleCancel}
              className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* ── Timeline ── */}
      {order.status !== 'CANCELLED' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Tiến trình đơn hàng</p>
          <div className="flex items-center">
            {TIMELINE.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      active ? 'bg-blue-600 shadow-md shadow-blue-200' : done ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : done ? 'text-blue-500' : 'text-slate-300'}`} />
                    </div>
                    <span className={`mt-2 text-center text-[10px] font-medium ${
                      active ? 'text-blue-700' : done ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < TIMELINE.length - 1 && (
                    <div className={`mx-1 h-px flex-1 ${idx < currentStep ? 'bg-blue-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content grid ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Sản phẩm */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sản phẩm</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-2.5 font-medium">Tên sản phẩm</th>
                <th className="px-5 py-2.5 font-medium text-right">SL</th>
                <th className="px-5 py-2.5 font-medium text-right">Đơn giá</th>
                <th className="px-5 py-2.5 font-medium text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                      <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                        Tier -{item.tierPrice.discountPercent}% (≥{item.tierPrice.minQty} sp)
                      </span>
                    )}
                    {item.customization && (
                      <p className="mt-0.5 text-xs italic text-slate-400">✏ {item.customization}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{fmt(item.unitPrice)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar phải */}
        <div className="space-y-4">

          {/* Thanh toán */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Thanh toán</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              {order.voucherCode && (
                <div className="flex justify-between text-emerald-600">
                  <span>Voucher <span className="font-mono font-bold">{order.voucherCode}</span></span>
                  <span>-{fmt(order.voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 font-bold">
                <span className="text-slate-800">Tổng cộng</span>
                <span className="text-blue-700 text-base">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {order.note && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Ghi chú</p>
              <p className="text-sm text-slate-600 leading-relaxed">{order.note}</p>
            </div>
          )}

          {/* Tuỳ chỉnh */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Pencil className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tuỳ chỉnh</p>
            </div>
            {order.customization && (
              <div className="mb-3 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 ring-1 ring-blue-200">
                {order.customization}
              </div>
            )}
            {order.status === 'PENDING' ? (
              <div className="space-y-2">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Màu sắc, kích thước, khắc tên..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <button
                  onClick={handleSaveCustomization}
                  disabled={saving || !customInput.trim()}
                  className="w-full rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? 'Đang lưu...' : 'Lưu tuỳ chỉnh'}
                </button>
              </div>
            ) : !order.customization ? (
              <p className="text-xs text-slate-400">Không có yêu cầu tuỳ chỉnh</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

