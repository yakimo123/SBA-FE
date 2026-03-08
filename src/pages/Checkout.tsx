import { Banknote, CheckCircle, CreditCard, Tag, Ticket, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { OrderResponse, orderService } from '../services/orderService';
import { vnpayService } from '../services/vnpayService';
import { VoucherResponse, voucherService } from '../services/voucherService';

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();

  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    note: '',
  });

  // Handle redirect back from VNPay gateway
  useEffect(() => {
    const state = location.state as {
      vnpaySuccess?: boolean;
      orderId?: number;
      totalAmount?: number;
    } | null;
    if (state?.vnpaySuccess) {
      setOrderResult({
        orderId: state.orderId ?? 0,
        totalAmount: state.totalAmount ?? 0,
      } as OrderResponse);
      setStep('success');
      // Clear navigation state to avoid re-triggering on refresh
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(
    null
  );
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherResponse[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [isFetchingVouchers, setIsFetchingVouchers] = useState(false);
  const [voucherSearch, setVoucherSearch] = useState('');

  const openVoucherModal = async () => {
    setVoucherSearch('');
    setShowVoucherModal(true);
    if (availableVouchers.length > 0) return;
    setIsFetchingVouchers(true);
    try {
      const result = await voucherService.getVouchers({ validOnly: true, size: 50 });
      setAvailableVouchers(result.content ?? []);
    } catch {
      // silently fail
    } finally {
      setIsFetchingVouchers(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee =
    deliveryMethod === 'express'
      ? 50000
      : deliveryMethod === 'standard'
        ? 30000
        : 0;

  // Calculate discount
  const discountAmount = appliedVoucher
    ? appliedVoucher.discountType === 'PERCENT'
      ? (subtotal * appliedVoucher.discountValue) / 100
      : appliedVoucher.discountValue
    : 0;

  const total = subtotal + shippingFee - discountAmount;

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const applyVoucherByCode = async (code: string) => {
    if (!user?.userId) {
      toast.error('Vui lòng đăng nhập để sử dụng mã giảm giá');
      return;
    }

    setVoucherError(null);
    setIsApplyingVoucher(true);
    try {
      const voucher = await voucherService.validateAndGetVoucher(
        code,
        user.userId,
        subtotal
      );
      setAppliedVoucher(voucher);
      setVoucherError(null);
      setShowVoucherModal(false);
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện';

      console.error(
        `Failed to apply voucher [${code}]:`,
        errorMessage,
        error
      );
      setVoucherError(errorMessage);
      toast.error(errorMessage);
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const paymentMethodMap: Record<string, string> = {
        cod: 'COD',
        card: 'CREDIT_CARD',
        vnpay: 'VNPAY',
        ewallet: 'E_WALLET',
        installment: 'INSTALLMENT',
      };

      const shippingAddress = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city,
      ]
        .filter(Boolean)
        .join(', ');

      const orderData = {
        shippingAddress,
        paymentMethod: paymentMethodMap[paymentMethod] || 'COD',
        voucherCode: appliedVoucher?.voucherCode,
        items: cartItems.map((item) => ({
          productId: Number(item.id),
          quantity: item.quantity,
        })),
      };

      const userId = user?.userId;
      if (!userId) {
        toast.error('Vui lòng đăng nhập để đặt hàng');
        setIsPlacingOrder(false);
        return;
      }

      const result = await orderService.createOrder(userId, orderData);

      // VNPay: redirect to payment gateway instead of showing success screen
      // Cart is NOT cleared here — it will only be cleared after confirmed SUCCESS on return
      if (paymentMethod === 'vnpay') {
        const vnpayResponse = await vnpayService.createPaymentUrl(result.orderId);
        window.location.href = vnpayResponse.paymentUrl;
        return;
      }

      setOrderResult(result);
      setStep('success');
    } catch (error: unknown) {
      console.error('Error placing order:', error);
      const errorMessage =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian
            sớm nhất.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-medium">
                {orderResult
                  ? `#${orderResult.orderId}`
                  : `DH${Date.now().toString().slice(-8)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-red-600">
                {(orderResult?.totalAmount ?? total).toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/account')}
              className="bg-red-600 hover:bg-red-700"
            >
              Xem đơn hàng
            </Button>
            <Button onClick={() => navigate('/')} variant="outline">
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-red-600"
          >
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate('/cart')}
            className="text-gray-600 hover:text-red-600"
          >
            Giỏ hàng
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Thanh toán</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'info'
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
            >
              {step === 'info' ? '1' : <CheckCircle className="w-5 h-5" />}
            </div>
            <span className={step === 'info' ? 'font-medium' : 'text-gray-600'}>
              Thông tin giao hàng
            </span>
          </div>
          <Separator className="w-16 mx-4" />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'payment'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span
              className={step === 'payment' ? 'font-medium' : 'text-gray-600'}
            >
              Thanh toán
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 'info' ? (
              <form onSubmit={handleSubmitInfo}>
                {/* Customer Info */}
                <Card className="p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">
                    Thông tin khách hàng
                  </h3>
                  {!user && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                      Bạn đã có tài khoản?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Đăng nhập
                      </button>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Delivery Address */}
                <Card className="p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Địa chỉ giao hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              district: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ward">Phường/Xã *</Label>
                        <Input
                          id="ward"
                          value={formData.ward}
                          onChange={(e) =>
                            setFormData({ ...formData, ward: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                      <Input
                        id="address"
                        placeholder="Số nhà, tên đường..."
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="note">Ghi chú đơn hàng (tùy chọn)</Label>
                      <Input
                        id="note"
                        placeholder="Ví dụ: Giao hàng giờ hành chính"
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Delivery Method */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Phương thức giao hàng
                  </h3>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={setDeliveryMethod}
                  >
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <div>
                            <div className="font-medium">
                              Giao hàng nhanh (2-4 giờ)
                            </div>
                            <div className="text-sm text-gray-600">
                              Áp dụng nội thành TP.HCM
                            </div>
                          </div>
                        </div>
                        <span className="font-medium">50,000₫</span>
                      </label>
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <div className="font-medium">
                              Giao hàng tiêu chuẩn (2-3 ngày)
                            </div>
                            <div className="text-sm text-gray-600">
                              Toàn quốc
                            </div>
                          </div>
                        </div>
                        <span className="font-medium">30,000₫</span>
                      </label>
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <div>
                            <div className="font-medium">Nhận tại cửa hàng</div>
                            <div className="text-sm text-gray-600">
                              Miễn phí
                            </div>
                          </div>
                        </div>
                        <span className="font-medium text-green-600">
                          Miễn phí
                        </span>
                      </label>
                    </div>
                  </RadioGroup>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/cart')}
                    className="flex-1"
                  >
                    Quay lại giỏ hàng
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Tiếp tục
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                {/* Payment Method */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Phương thức thanh toán
                  </h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="cod" id="cod" />
                        <Banknote className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">
                            Thanh toán khi nhận hàng (COD)
                          </div>
                          <div className="text-sm text-gray-600">
                            Thanh toán bằng tiền mặt khi nhận hàng
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Thẻ tín dụng/Ghi nợ</div>
                          <div className="text-sm text-gray-600">
                            Visa, Mastercard, JCB
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="vnpay" id="vnpay" />
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <span className="bg-[#005BAA] text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">
                            VNPay
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">VNPay</div>
                          <div className="text-sm text-gray-600">
                            Thanh toán qua cổng VNPay (ATM, Visa, QR Code)
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="ewallet" id="ewallet" />
                        <Wallet className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Ví điện tử</div>
                          <div className="text-sm text-gray-600">
                            MoMo, ZaloPay
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="installment" id="installment" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Trả góp 0%</div>
                          <div className="text-sm text-gray-600">
                            Qua thẻ tín dụng, duyệt nhanh
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep('info')}
                    className="flex-1"
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isPlacingOrder
                      ? 'Đang xử lý...'
                      : paymentMethod === 'vnpay'
                        ? 'Thanh toán qua VNPay'
                        : 'Đặt hàng'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">
                Đơn hàng ({cartItems.length} sản phẩm)
              </h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-sm text-red-600 font-medium">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Voucher section */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-medium">Mã giảm giá</Label>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-4 h-4 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-green-700">{appliedVoucher.voucherCode}</span>
                        <p className="text-xs text-green-600 truncate">{appliedVoucher.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherError(null);
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0 ml-2"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openVoucherModal}
                      className="w-full justify-start gap-2 text-gray-600 border-dashed"
                    >
                      <Ticket className="w-4 h-4 text-red-500" />
                      Chọn mã giảm giá
                    </Button>
                    {voucherError && (
                      <div className="text-xs text-red-600 font-medium">{voucherError}</div>
                    )}
                  </>
                )}
              </div>

              {/* Voucher Modal */}
              <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-red-500" />
                      Chọn mã giảm giá
                    </DialogTitle>
                  </DialogHeader>

                  {/* Search inside modal */}
                  <div className="relative mb-1">
                    <Input
                      placeholder="Tìm theo mã..."
                      value={voucherSearch}
                      onChange={(e) => setVoucherSearch(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto -mx-6 px-6">
                    {isFetchingVouchers ? (
                      <div className="py-10 text-center text-sm text-gray-500">Đang tải...</div>
                    ) : availableVouchers.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-500">
                        Không có mã giảm giá khả dụng
                      </div>
                    ) : (
                      <div className="space-y-2 py-1">
                        {availableVouchers
                          .filter((v) =>
                            voucherSearch
                              ? v.voucherCode.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                                v.description.toLowerCase().includes(voucherSearch.toLowerCase())
                              : true
                          )
                          .map((v) => (
                            <button
                              key={v.voucherId}
                              type="button"
                              disabled={isApplyingVoucher}
                              onClick={() => applyVoucherByCode(v.voucherCode)}
                              className="w-full flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-red-400 hover:bg-red-50 text-left transition-colors disabled:opacity-50"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <Tag className="w-5 h-5 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-sm text-gray-900">{v.voucherCode}</span>
                                  <span className="text-sm font-semibold text-red-600 shrink-0">
                                    {v.discountType === 'PERCENT'
                                      ? `Giảm ${v.discountValue}%`
                                      : `Giảm ${v.discountValue.toLocaleString('vi-VN')}₫`}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{v.description}</p>
                                {v.minOrderValue > 0 && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Đơn hàng tối thiểu {v.minOrderValue.toLocaleString('vi-VN')}₫
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Separator className="my-4" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {subtotal.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-lg mb-4">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-red-600 text-2xl">
                  {total.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                Bằng việc tiến hành đặt hàng, bạn đồng ý với{' '}
                <a href="#" className="text-red-600 hover:underline">
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" className="text-red-600 hover:underline">
                  Chính sách bảo mật
                </a>{' '}
                của chúng tôi.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
