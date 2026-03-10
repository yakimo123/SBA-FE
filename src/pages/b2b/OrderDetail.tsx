import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Package,
  Pencil,
  Truck,
  XCircle,
  Copy,
  MoreVertical,
  Download,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { BulkOrderStatus } from '../../types';

const STATUS_LABEL: Record<BulkOrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const STATUS_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-300',
  APPROVED: 'bg-blue-50 text-blue-700 border border-blue-300',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-300',
  SHIPPED: 'bg-purple-50 text-purple-700 border border-purple-300',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-300',
};

const TIMELINE = [
  { status: 'PENDING' as BulkOrderStatus, label: 'Chờ duyệt', icon: Clock },
  { status: 'APPROVED' as BulkOrderStatus, label: 'Đã duyệt', icon: CheckCircle2 },
  { status: 'PROCESSING' as BulkOrderStatus, label: 'Đang xử lý', icon: Package },
  { status: 'SHIPPED' as BulkOrderStatus, label: 'Vận chuyển', icon: Truck },
  { status: 'DELIVERED' as BulkOrderStatus, label: 'Hoàn thành', icon: CheckCircle2 },
];

const STATUS_ORDER: BulkOrderStatus[] = [
  'PENDING',
  'APPROVED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

const STEP_ICON_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  APPROVED: 'bg-sky-50 text-sky-600 border-sky-200',
  PROCESSING: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  SHIPPED: 'bg-violet-50 text-violet-600 border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, cancelOrder, updateCustomization } = useBulkOrders();
  const [customInput, setCustomInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const order = orders.find((o) => o.orderId === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <XCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Không tìm thấy đơn hàng</h2>
          <p className="text-sm text-slate-600 mb-6">
            Đơn hàng này không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => navigate('/company/orders')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const normalizedStatus = String(order.status).toUpperCase() as BulkOrderStatus;
  const currentStatus =
    normalizedStatus === 'CANCELLED' || STATUS_ORDER.includes(normalizedStatus)
      ? normalizedStatus
      : 'PENDING';
  const currentStep = currentStatus === 'CANCELLED' ? -1 : STATUS_ORDER.indexOf(currentStatus);

  const handleSaveCustomization = async () => {
    if (!customInput.trim()) return;
    setSaving(true);
    setSaveMessage('');
    await new Promise((r) => setTimeout(r, 500));
    updateCustomization(order.orderId, customInput.trim());
    setCustomInput('');
    setSaving(false);
    setSaveMessage('Đã lưu yêu cầu tùy chỉnh thành công.');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const handleCancel = () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    cancelOrder(order.orderId);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSaveDisabled = saving || !customInput.trim();
  const saveButtonLabel = saving ? 'Đang lưu...' : 'Lưu yêu cầu tùy chỉnh';

  return (
    <div className="min-h-screen bg-slate-100/60">
      {/* ── Sticky Breadcrumb ── */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-600">
            <button onClick={() => navigate('/company')} className="hover:text-slate-900 transition-colors">
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
            <span className="font-medium text-slate-900">{order.orderId}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Order Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Đơn hàng #{order.orderId}</h1>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors group relative"
                  title="Copy mã đơn"
                >
                  <Copy className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap">
                      Đã copy!
                    </span>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-slate-400" />
                  <span>{order.items.length} sản phẩm</span>
                </div>
                <span className="text-slate-300">•</span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[currentStatus]}`}
                >
                  {STATUS_LABEL[currentStatus]}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {currentStatus === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                >
                  Hủy đơn
                </button>
              )}
              <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Xuất PDF
              </button>
              <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate('/company/orders')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đơn hàng
        </button>

        {/* ── Progress Stepper ── */}
        {currentStatus !== 'CANCELLED' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-6">Tiến trình đơn hàng</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
                  style={{
                    width: `${(currentStep / (TIMELINE.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {TIMELINE.map((step, idx) => {
                  const done = idx <= currentStep;
                  const active = idx === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      {/* Icon Circle */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${active
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-700 shadow-lg shadow-blue-500/40 scale-110'
                          : done
                            ? STEP_ICON_STYLE[step.status]
                            : 'bg-white text-slate-400 border-slate-200'
                          }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors ${active ? 'text-white' : done ? '' : 'text-slate-400'
                            }`}
                        />
                      </div>

                      {/* Label */}
                      <div className="mt-3 text-center">
                        <p
                          className={`text-xs font-semibold ${active
                            ? 'text-blue-700'
                            : done
                              ? 'text-slate-700'
                              : 'text-slate-400'
                            }`}
                        >
                          {step.label}
                        </p>
                        {active && order.createdAt && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  Đơn hàng đã bị hủy
                </h3>
                <p className="text-sm text-red-700">
                  Đơn hàng này đã bị hủy và không thể tiếp tục xử lý.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Two Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-900">Chi tiết sản phẩm</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.productName}
                            </p>
                            {item.tierPrice && item.tierPrice.discountPercent > 0 && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                <Tag className="h-3 w-3" />
                                Giảm {item.tierPrice.discountPercent}% (≥{item.tierPrice.minQty} sp)
                              </span>
                            )}
                            {item.customization && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                                <Pencil className="h-3 w-3 text-slate-400" />
                                {item.customization}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                          {fmt(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                          {fmt(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Details */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Thông tin thanh toán</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium text-slate-900">{fmt(order.subtotal)}</span>
                </div>
                {order.voucherCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Voucher {order.voucherCode}
                    </span>
                    <span className="font-medium text-emerald-600">
                      -{fmt(order.voucherDiscount)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-slate-900">
                    {fmt(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.note && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">Ghi chú</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{order.note}</p>
              </div>
            )}

            {/* Customization */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Yêu cầu tùy chỉnh</h2>
              </div>
              {order.customization && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-900">{order.customization}</p>
                </div>
              )}
              {currentStatus === 'PENDING' ? (
                <div className="space-y-3">
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Màu sắc, kích thước, khắc tên, thiết kế đặc biệt..."
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                  <button
                    onClick={handleSaveCustomization}
                    disabled={isSaveDisabled}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                    style={
                      isSaveDisabled
                        ? {
                          background: '#e2e8f0',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                        }
                        : {
                          background: 'linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)',
                          color: '#ffffff',
                          border: '1px solid #4338ca',
                        }
                    }
                  >
                    {saveButtonLabel}
                  </button>
                  {saveMessage && (
                    <p className="text-sm font-medium text-emerald-600">{saveMessage}</p>
                  )}
                  {!saveMessage && !customInput.trim() && (
                    <p className="text-xs text-slate-500">Nhập nội dung tùy chỉnh để lưu.</p>
                  )}
                </div>
              ) : !order.customization ? (
                <p className="text-sm text-slate-500 italic">Không có yêu cầu tùy chỉnh</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
