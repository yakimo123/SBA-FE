import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Download,
  MoreVertical,
  Package,
  Pencil,
  Tag,
  Truck,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { vnpayService } from '../../services/vnpayService';
import { BulkOrderStatus } from '../../types';

const STATUS_LABEL: Record<BulkOrderStatus, string> = {
  PENDING_REVIEW: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  AWAITING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Từ chối',
};

const STATUS_STYLE: Record<BulkOrderStatus, string> = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-300',
  CONFIRMED: 'bg-red-50 text-[#d73211] border -[#fca5a5]',
  AWAITING_PAYMENT: 'bg-orange-50 text-orange-700 border border-orange-300',
  PAID: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
  PROCESSING: 'bg-red-50 text-[#d73211] border -[#fca5a5]',
  SHIPPED: '-[#fff1f0] -[#d73211] border -[#fca5a5]',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-300',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-300',
  REJECTED: 'bg-red-50 text-red-700 border border-red-300',
};

const TIMELINE: {
  status: BulkOrderStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { status: 'PENDING_REVIEW', label: 'Chờ duyệt', icon: Clock },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
  { status: 'AWAITING_PAYMENT', label: 'Chờ thanh toán', icon: DollarSign },
  { status: 'PAID', label: 'Đã thanh toán', icon: CheckCircle2 },
  { status: 'PROCESSING', label: 'Đang sản xuất', icon: Package },
  { status: 'SHIPPED', label: 'Vận chuyển', icon: Truck },
  { status: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
];

const STATUS_ORDER: BulkOrderStatus[] = [
  'PENDING_REVIEW',
  'CONFIRMED',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
];

const STEP_ICON_STYLE: Partial<Record<BulkOrderStatus, string>> = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-600 border-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-600 border-sky-200',
  AWAITING_PAYMENT: 'bg-orange-50 text-orange-600 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  PROCESSING: 'bg-red-50 text-[#ee4d2d] border-[#fca5a5]',
  SHIPPED: '-[#fff1f0] text-[#ee4d2d] -[#fca5a5]',
  COMPLETED: 'bg-green-50 text-green-600 border-green-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  REJECTED: 'bg-red-50 text-red-500 border-red-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  );

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, cancelOrder } = useBulkOrders();
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const order = orders.find((o) => String(o.bulkOrderId) === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <XCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Không tìm thấy đơn hàng
          </h2>
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

  const normalizedStatus = String(
    order.status
  ).toUpperCase() as BulkOrderStatus;
  const currentStatus =
    normalizedStatus === 'CANCELLED' ||
    normalizedStatus === 'REJECTED' ||
    STATUS_ORDER.includes(normalizedStatus)
      ? normalizedStatus
      : 'PENDING_REVIEW';
  const currentStep =
    currentStatus === 'CANCELLED' || currentStatus === 'REJECTED'
      ? -1
      : STATUS_ORDER.indexOf(currentStatus);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReasonText.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    setIsCancelling(true);
    try {
      await cancelOrder(order.bulkOrderId, cancelReasonText);
      toast.success('Đã gửi yêu cầu hủy đơn hàng');
      setShowCancelModal(false);
    } catch {
      toast.error('Không thể hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      const res = await vnpayService.createPaymentUrl(
        order.bulkOrderId,
        'BULK'
      );
      if (res && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error('Không thể tạo link thanh toán VNPay');
      }
    } catch (error) {
      console.error('Lỗi khi tạo payment url:', error);
      toast.error('Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(String(order.bulkOrderId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100/60">
      {/* ── Sticky Breadcrumb ── */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-600">
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
            <span className="font-medium text-slate-900">
              #{order.bulkOrderId}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Order Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  Đơn hàng #{order.bulkOrderId}
                </h1>
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
                  <span>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-900">
                    {order.details.length} sản phẩm
                  </span>
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
              {currentStatus === 'AWAITING_PAYMENT' && (
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#ee4d2d] to-[#d73211] hover:from-[#d73211] hover:-[#b03030] rounded-lg shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  {isPaying ? 'Đang xử lý...' : 'Thanh toán ngay'}
                </button>
              )}
              {(currentStatus === 'PENDING_REVIEW' ||
                currentStatus === 'CONFIRMED') && (
                <button
                  onClick={handleCancelClick}
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
        {currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-6">
              Tiến trình đơn hàng
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#ee4d2d] to-[#d73211] transition-all duration-500"
                  style={{
                    width: `${currentStep >= 0 ? (currentStep / (TIMELINE.length - 1)) * 100 : 0}%`,
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
                    <div
                      key={step.status}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                          active
                            ? 'bg-gradient-to-r from-[#ee4d2d] to-[#d73211] border-[#d73211] shadow-lg shadow-[#ee4d2d]/40 scale-110'
                            : done
                              ? (STEP_ICON_STYLE[step.status] ??
                                'bg-white text-slate-400 border-slate-200')
                              : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 transition-colors ${
                            active ? 'text-white' : done ? '' : 'text-slate-400'
                          }`}
                        />
                      </div>

                      <div className="mt-3 text-center">
                        <p
                          className={`text-xs font-semibold ${
                            active
                              ? 'text-[#d73211]'
                              : done
                                ? 'text-slate-700'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {active && order.createdAt && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString(
                              'vi-VN'
                            )}
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
          <div
            className={`${
              currentStatus === 'REJECTED'
                ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
            } border rounded-xl p-6`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${currentStatus === 'REJECTED' ? 'bg-red-100' : 'bg-slate-100'}`}
              >
                <XCircle
                  className={`h-5 w-5 ${currentStatus === 'REJECTED' ? 'text-red-600' : 'text-slate-600'}`}
                />
              </div>
              <div>
                <h3
                  className={`text-sm font-semibold mb-1 ${
                    currentStatus === 'REJECTED'
                      ? 'text-red-900'
                      : 'text-slate-900'
                  }`}
                >
                  Đơn hàng đã bị{' '}
                  {currentStatus === 'REJECTED' ? 'từ chối' : 'hủy'}
                </h3>
                <p
                  className={`text-sm ${currentStatus === 'REJECTED' ? 'text-red-700' : 'text-slate-600'}`}
                >
                  Đơn hàng này đã bị{' '}
                  {currentStatus === 'REJECTED' ? 'từ chối' : 'hủy'} và không
                  thể tiếp tục xử lý.
                </p>
                {(order.cancelReason || order.adminNote) && (
                  <div className={`mt-3 p-3 rounded-lg border ${currentStatus === 'REJECTED' ? 'bg-red-100/50 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${currentStatus === 'REJECTED' ? 'text-red-800' : 'text-slate-500'}`}>
                      {order.adminNote && !order.cancelReason ? 'Ghi chú từ Admin:' : 'Lý do:'}
                    </p>
                    <p className={`text-sm italic ${currentStatus === 'REJECTED' ? 'text-red-900' : 'text-slate-700'}`}>
                      {order.cancelReason || order.adminNote}
                    </p>
                  </div>
                )}
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
                <h2 className="text-sm font-semibold text-slate-900">
                  Chi tiết sản phẩm
                </h2>
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
                    {order.details.map((detail) => (
                      <tr
                        key={detail.bulkOrderDetailId}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {detail.productImage ? (
                              <img
                                src={detail.productImage}
                                alt={detail.productName}
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                <Package className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {detail.productName}
                              </p>
                              {(detail.tierLabel ||
                                (detail.priceTiers &&
                                  detail.priceTiers.length > 0)) && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                  <Tag className="h-3 w-3" />
                                  {detail.tierLabel || 'Tier giá'}:{' '}
                                  {detail.appliedTierPrice.toLocaleString(
                                    'vi-VN'
                                  )}
                                  đ/sp
                                </span>
                              )}
                              {detail.customizations?.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  {detail.customizations.map((c) => (
                                    <div
                                      key={c.customizationId}
                                      className="flex items-center gap-2 text-xs"
                                    >
                                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                        <Pencil className="h-3 w-3 text-slate-400" />
                                        {c.type}
                                      </div>
                                      <span className="text-slate-500 italic">
                                        {c.note}
                                      </span>
                                      {c.totalFee && c.totalFee > 0 ? (
                                        <span className="text-[#ee4d2d] font-bold">
                                          +{fmt(c.totalFee)}
                                        </span>
                                      ) : (
                                        <span className="text-amber-600 font-medium italic">
                                          (Phí:{' '}
                                          {c.status === 'CONFIRMED'
                                            ? 'Miễn phí'
                                            : 'Chờ duyệt'}
                                          )
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 bg-slate-100 rounded-md text-sm font-medium text-slate-700">
                            {detail.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                          {detail.unitPriceSnapshot !== null
                            ? fmt(detail.unitPriceSnapshot)
                            : fmt(detail.appliedTierPrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                          {fmt(detail.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Thông tin thanh toán
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Giá gốc (Tổng)</span>
                  <span className="font-medium text-slate-900">
                    {fmt(order.basePriceTotal || 0)}
                  </span>
                </div>
                {order.tierDiscountTotal && order.tierDiscountTotal < 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Giảm giá theo số lượng</span>
                    <span className="font-medium text-emerald-600">
                      {fmt(order.tierDiscountTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1 border-t border-slate-50">
                  <span className="text-slate-600">Tổng sau chiết khấu</span>
                  <span className="font-medium text-slate-900">
                    {fmt(order.subtotalAfterTier)}
                  </span>
                </div>
                {(order.customizationFeeConfirmed || order.customizationFeePending) && (
                  <div className="space-y-2 py-2 border-t border-slate-50">
                    {order.customizationFeeConfirmed ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Phí tùy chỉnh (Đã duyệt)</span>
                        <span className="font-medium text-[#ee4d2d]">
                          +{fmt(order.customizationFeeConfirmed)}
                        </span>
                      </div>
                    ) : null}
                    {order.customizationFeePending ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Phí tùy chỉnh (Chờ duyệt)</span>
                        <span className="font-medium text-amber-600 italic">
                          +{fmt(order.customizationFeePending)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}
                <div className="flex justify-between text-sm pt-1 border-t border-slate-50">
                  <span className="text-slate-600">Phí vận chuyển</span>
                  <span className="font-medium text-slate-900">
                    {order.shippingFeeWaived ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      fmt(order.shippingFee || 0)
                    )}
                  </span>
                </div>
                {order.voucherCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Voucher {order.voucherCode}
                    </span>
                    <span className="font-medium text-emerald-600">
                      -{fmt(order.voucherDiscountAmount ?? 0)}
                    </span>
                  </div>
                )}
                <div className="h-px bg-slate-200"></div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-semibold text-slate-900">
                    Tổng cộng
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {fmt(order.finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Thông tin công ty
              </h2>
              <p className="text-sm text-slate-700 font-medium">
                {order.companyName}
              </p>
              {order.userFullName && (
                <p className="text-sm text-slate-500 mt-1">
                  {order.userFullName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ── Cancel Order Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <div className="p-2 rounded-full bg-red-50">
                  <XCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Xác nhận hủy đơn hàng</h2>
              </div>
              <p className="text-sm text-slate-500">
                Lưu ý: Hành động này không thể hoàn tác. Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Lý do hủy đơn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  placeholder="Vd: Tôi thay đổi quyết định, Sai địa chỉ, Muốn đặt sản phẩm khác..."
                  rows={4}
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none transition-all focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling || !cancelReasonText.trim()}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
