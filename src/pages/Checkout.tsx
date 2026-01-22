import { Banknote, CheckCircle,CreditCard, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    note: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = deliveryMethod === 'express' ? 50000 : deliveryMethod === 'standard' ? 30000 : 0;
  const total = subtotal + shippingFee;

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    setStep('success');
    clearCart();
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
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-medium">DH{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-red-600">{total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/account')}
              className="bg-red-600 hover:bg-red-700"
            >
              Xem đơn hàng
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
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
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <button onClick={() => navigate('/cart')} className="text-gray-600 hover:text-red-600">
            Giỏ hàng
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Thanh toán</span>
        </div>

        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'info' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {step === 'info' ? '1' : <CheckCircle className="w-5 h-5" />}
            </div>
            <span className={step === 'info' ? 'font-medium' : 'text-gray-600'}>Thông tin giao hàng</span>
          </div>
          <Separator className="w-16 mx-4" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className={step === 'payment' ? 'font-medium' : 'text-gray-600'}>Thanh toán</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 'info' ? (
              <form onSubmit={handleSubmitInfo}>
                {/* Customer Info */}
                <Card className="p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Thông tin khách hàng</h3>
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ward">Phường/Xã *</Label>
                        <Input
                          id="ward"
                          value={formData.ward}
                          onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="note">Ghi chú đơn hàng (tùy chọn)</Label>
                      <Input
                        id="note"
                        placeholder="Ví dụ: Giao hàng giờ hành chính"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      />
                    </div>
                  </div>
                </Card>

                {/* Delivery Method */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Phương thức giao hàng</h3>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="express" id="express" />
                          <div>
                            <div className="font-medium">Giao hàng nhanh (2-4 giờ)</div>
                            <div className="text-sm text-gray-600">Áp dụng nội thành TP.HCM</div>
                          </div>
                        </div>
                        <span className="font-medium">50,000₫</span>
                      </label>
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="standard" id="standard" />
                          <div>
                            <div className="font-medium">Giao hàng tiêu chuẩn (2-3 ngày)</div>
                            <div className="text-sm text-gray-600">Toàn quốc</div>
                          </div>
                        </div>
                        <span className="font-medium">30,000₫</span>
                      </label>
                      <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <div>
                            <div className="font-medium">Nhận tại cửa hàng</div>
                            <div className="text-sm text-gray-600">Miễn phí</div>
                          </div>
                        </div>
                        <span className="font-medium text-green-600">Miễn phí</span>
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
                  <h3 className="text-xl font-bold mb-4">Phương thức thanh toán</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="cod" id="cod" />
                        <Banknote className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                          <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Thẻ tín dụng/Ghi nợ</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard, JCB</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="ewallet" id="ewallet" />
                        <Wallet className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Ví điện tử</div>
                          <div className="text-sm text-gray-600">MoMo, ZaloPay, VNPay</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value="installment" id="installment" />
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Trả góp 0%</div>
                          <div className="text-sm text-gray-600">Qua thẻ tín dụng, duyệt nhanh</div>
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
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Đặt hàng
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Đơn hàng ({cartItems.length} sản phẩm)</h3>
              
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
                      <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-red-600 font-medium">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
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
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-lg mb-4">
                <span className="font-bold">Tổng cộng</span>
                <span className="font-bold text-red-600 text-2xl">{total.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                Bằng việc tiến hành đặt hàng, bạn đồng ý với{' '}
                <a href="#" className="text-red-600 hover:underline">Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="#" className="text-red-600 hover:underline">Chính sách bảo mật</a>
                {' '}của chúng tôi.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
