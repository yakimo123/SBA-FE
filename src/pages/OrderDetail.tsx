import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  Tag,
  Truck,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { OrderResponse, orderService } from '../services/orderService';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận', icon: Clock },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Đang xử lý', icon: Package },
  { key: 'SHIPPED', label: 'Đang giao', icon: Truck },
  { key: 'DELIVERED', label: 'Đã giao', icon: CheckCircle },
];

const CANCELLED_STATUSES = ['CANCELLED', 'REFUNDED'];

function getStatusText(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };
  return map[status] ?? status;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-700';
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700';
    case 'PROCESSING':
    case 'CONFIRMED':
      return 'bg-yellow-100 text-yellow-700';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getPaymentMethodLabel(method: string) {
  const map: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng',
    CREDIT_CARD: 'Thẻ tín dụng / Ghi nợ',
    VNPAY: 'VNPay',
    E_WALLET: 'Ví điện tử',
    INSTALLMENT: 'Trả góp',
  };
  return map[method] ?? method;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch {
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    setCancelling(true);
    try {
      await orderService.cancelOrder(order.orderId, cancelReason);
      toast.success('Đã gửi yêu cầu hủy đơn hàng thành công');
      setShowCancelModal(false);
      fetchOrder();
    } catch {
      toast.error('Không thể hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <Button onClick={() => navigate('/account')} className="bg-red-600 hover:bg-red-700">
            Quay lại tài khoản
          </Button>
        </div>
      </div>
    );
  }

  const isCancelled = CANCELLED_STATUSES.includes(order.orderStatus);
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus);
  const subtotal = order.orderItems?.reduce((sum, item) => sum + item.subtotal, 0) ?? order.totalAmount;
  const discountAmount = order.discountAmount ?? 0;
  const finalAmount = order.finalAmount ?? order.totalAmount;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <button onClick={() => navigate('/account')} className="text-gray-600 hover:text-red-600">
            Tài khoản
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Đơn hàng #{order.orderId}</span>
        </div>

        {/* Back + title */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/account')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Đơn hàng #{order.orderId}</h1>
            <Badge className={getStatusColor(order.orderStatus)}>
              {getStatusText(order.orderStatus)}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Order progress tracker */}
          {(true) /* Show timeline even if cancelled, handled inside */}
          <Card className="p-6">
            <h2 className="font-bold mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" />
              Trạng thái đơn hàng
            </h2>
            <div className="flex items-start justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-red-600 z-0 transition-all"
                style={{
                  width:
                    isCancelled
                      ? '100%'
                      : currentStepIndex < 0
                        ? '0%'
                        : `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                  backgroundColor: isCancelled ? '#ef4444' : undefined
                }}
              />

              {(isCancelled 
                ? [...STATUS_STEPS.filter(s => s.key !== 'DELIVERED'), { key: 'CANCELLED', label: 'Đã hủy', icon: XCircle }]
                : STATUS_STEPS
              ).map((step, idx) => {
                const done = isCancelled ? (idx < 4 || step.key === 'CANCELLED') : (currentStepIndex >= idx);
                const Icon = step.icon;
                const isStepCancelled = step.key === 'CANCELLED';
                
                return (
                  <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isStepCancelled
                          ? 'bg-red-600 border-red-600 text-white'
                          : done
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs mt-2 text-center max-w-[70px] leading-tight ${
                        (done || isStepCancelled) ? 'text-red-600 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {isCancelled && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-red-600">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">
                    Đơn hàng này đã bị{' '}
                    {order.orderStatus === 'REFUNDED' ? 'hoàn tiền' : 'hủy'}.
                  </span>
                </div>
                {order.cancelReason && (
                  <p className="text-sm text-red-500 mt-1 italic pl-8">
                    Lý do: {order.cancelReason}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Order items */}
          <Card className="p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              Sản phẩm đặt hàng ({order.orderItems?.length ?? 0})
            </h2>

            {(!order.orderItems || order.orderItems.length === 0) ? (
              <p className="text-gray-500 text-sm">Không có thông tin sản phẩm.</p>
            ) : (
              <div className="divide-y">
                {order.orderItems.map((item) => (
                  <div key={item.orderDetailId} className="py-4 flex gap-4 items-start">
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={item.productImage ?? ''}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium line-clamp-2 cursor-pointer hover:text-red-600"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        {item.productName}
                      </h3>
                      {item.branchName && (
                        <p className="text-xs text-gray-500 mt-0.5">{item.branchName}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {item.unitPrice.toLocaleString('vi-VN')}₫ × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-red-600">
                        {item.subtotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="text-red-600 text-xl">{finalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </Card>

          {/* Delivery & Payment info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Địa chỉ giao hàng
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{order.userFullName}</p>
                <p>{order.shippingAddress || 'Chưa có địa chỉ'}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                Thông tin thanh toán
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đặt hàng</span>
                  <span className="font-medium">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {order.voucherCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Mã giảm giá
                    </span>
                    <span className="font-medium text-green-600">{order.voucherCode}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order summary info */}
          <Card className="p-4 bg-gray-50 border-dashed">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ReceiptText className="w-4 h-4" />
              <span>Mã đơn hàng: <span className="font-medium text-gray-700">#{order.orderId}</span></span>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/account')} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>

            {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancelClick}
                disabled={cancelling}
              >
                Hủy đơn hàng
              </Button>
            )}

            <Button
              onClick={() => navigate('/products')}
              className="ml-auto bg-red-600 hover:bg-red-700"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>

      {/* ── Custom Cancel Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <XCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Xác nhận hủy đơn hàng</h2>
              </div>
              <p className="text-sm text-gray-500">
                Lưu ý: Hành động này không thể hoàn tác. Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lý do hủy đơn <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vd: Tôi muốn thay đổi hình thức thanh toán, Đặt nhầm sản phẩm..."
                rows={4}
                className="w-full rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none p-3 text-sm transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3 px-6 py-4 bg-gray-50">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Quay lại
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                onClick={handleConfirmCancel}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Xác nhận hủy'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
