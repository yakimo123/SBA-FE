import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Package,
  Pencil,
  XCircle,
  Copy,
  MoreVertical,
  Download,
  Calendar,
  DollarSign,
  Tag,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import bulkOrderService from '../../services/bulkOrderService';
import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { BulkOrderResponse, BulkOrderStatus } from '../../types';

const STATUS_LABEL: Record<BulkOrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const STATUS_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-300',
  APPROVED: 'bg-blue-50 text-blue-700 border border-blue-300',
  REJECTED: 'bg-red-50 text-red-700 border border-red-300',
  PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-300',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-300',
};

const TIMELINE = [
  { status: 'PENDING' as BulkOrderStatus, label: 'Chờ duyệt', icon: Clock },
  { status: 'APPROVED' as BulkOrderStatus, label: 'Đã duyệt', icon: CheckCircle2 },
  { status: 'PROCESSING' as BulkOrderStatus, label: 'Đang xử lý', icon: Package },
  { status: 'COMPLETED' as BulkOrderStatus, label: 'Hoàn thành', icon: CheckCircle2 },
];

const STATUS_ORDER: BulkOrderStatus[] = [
  'PENDING',
  'APPROVED',
  'PROCESSING',
  'COMPLETED',
];

const STEP_ICON_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-200',
  APPROVED: 'bg-sky-50 text-sky-600 border-sky-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  PROCESSING: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cancelOrder, addCustomization } = useBulkOrders();
  const [order, setOrder] = useState<BulkOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [customInput, setCustomInput] = useState('');
  const [customType, setCustomType] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await bulkOrderService.getById(Number(id));
      setOrder(data);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
    if (!customInput.trim() || !customType.trim()) return;
    if (!order?.details?.length) return;
    setSaving(true);
    setSaveMessage('');
    try {
      // Add customization to the first detail item
      const detailId = order.details[0].bulkOrderDetailId;
      await addCustomization(detailId, {
        type: customType.trim(),
        note: customInput.trim(),
      });
      setCustomInput('');
      setCustomType('');
      setSaveMessage('Đã lưu yêu cầu tùy chỉnh thành công.');
      await fetchOrder(); // Refresh data
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (err) {
      console.error('Failed to save customization:', err);
      setSaveMessage('Lỗi khi lưu yêu cầu tùy chỉnh.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    await cancelOrder(order!.bulkOrderId);
    await fetchOrder();
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(String(order!.bulkOrderId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSaveDisabled = saving || !customInput.trim() || !customType.trim();
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
            <span className="font-medium text-slate-900">#{order.bulkOrderId}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Order Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Đơn hàng #{order.bulkOrderId}</h1>
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
                  <span>{order.details?.length || 0} sản phẩm</span>
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
                    {order.details?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.productName}
                            </p>
                            {item.discountSnapshot != null && item.discountSnapshot > 0 && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                <Tag className="h-3 w-3" />
                                Giảm {item.discountSnapshot}%{item.appliedTierPrice ? ` (≥${item.appliedTierPrice} sp)` : ''}
                              </span>
                            )}
                            {item.priceTiers?.length > 0 && (
                              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                                <p className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border-b border-slate-200">
                                  Bảng giá sỉ
                                </p>
                                <div className="divide-y divide-slate-100">
                                  {item.priceTiers.map((tier) => (
                                    <div
                                      key={tier.bulkPriceTierId}
                                      className={`flex justify-between px-3 py-1.5 text-xs ${item.quantity >= tier.minQty ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
                                        }`}
                                    >
                                      <span>≥ {tier.minQty} sp</span>
                                      <span>{fmt(tier.unitPrice)}/sp</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.customizations?.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.customizations.map((c) => (
                                  <p key={c.customizationId} className="flex items-center gap-1 text-xs text-slate-600">
                                    <Pencil className="h-3 w-3 text-slate-400" />
                                    [{c.type}] {c.note}{c.extraFee ? ` (+${fmt(c.extraFee)})` : ''}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                          {fmt(item.unitPriceSnapshot)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                          {fmt(item.lineTotal)}
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
                  <span className="font-medium text-slate-900">{fmt(order.totalPrice)}</span>
                </div>
                {order.discountCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Voucher {order.discountCode}{order.discountPercentage ? ` (-${order.discountPercentage}%)` : ''}
                    </span>
                    <span className="font-medium text-emerald-600">
                      -{fmt(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-slate-900">
                    {fmt(order.finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customization */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">Yêu cầu tùy chỉnh</h2>
              </div>
              {order.details?.some(d => d.customizations?.length > 0) && (
                <div className="mb-4 space-y-2">
                  {order.details.flatMap(d => d.customizations ?? []).map((c) => (
                    <div key={c.customizationId} className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">[{c.type}]</span> {c.note}
                        {c.extraFee ? <span className="ml-2 text-xs text-blue-700">(+{fmt(c.extraFee)})</span> : null}
                        <span className="ml-2 text-xs text-blue-500">({c.status})</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {currentStatus === 'PENDING' ? (
                <div className="space-y-3">
                  <input
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Loại tùy chỉnh (vd: In logo, Khắc tên...)"
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Mô tả chi tiết yêu cầu tùy chỉnh..."
                    rows={3}
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
                  {!saveMessage && (!customInput.trim() || !customType.trim()) && (
                    <p className="text-xs text-slate-500">Nhập loại và nội dung tùy chỉnh để lưu.</p>
                  )}
                </div>
              ) : !order.details?.some(d => d.customizations?.length > 0) ? (
                <p className="text-sm text-slate-500 italic">Không có yêu cầu tùy chỉnh</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
