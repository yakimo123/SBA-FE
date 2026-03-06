import { Gift, Heart, LogOut, MapPin, ShoppingBag, Star, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { OrderResponse,orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { VoucherResponse,voucherService } from '../services/voucherService';

interface ReviewDialogState {
  isOpen: boolean;
  orderId: string;
  productId: number;
  productName: string;
}

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // API data states
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [voucherList, setVoucherList] = useState<VoucherResponse[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  // Review dialog state
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>({
    isOpen: false,
    orderId: '',
    productId: 0,
    productName: ''
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.userId) return;
    setLoadingOrders(true);
    try {
      const data = await orderService.getOrders({ userId: user.userId, page: 0, size: 20, sort: 'orderDate,desc' });
      setOrders(data.content || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [user?.userId]);

  const fetchVouchers = useCallback(async () => {
    setLoadingVouchers(true);
    try {
      const data = await voucherService.getVouchers({ validOnly: true, page: 0, size: 20 });
      setVoucherList(data.content || []);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoadingVouchers(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchVouchers();
  }, [fetchOrders, fetchVouchers]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openReviewDialog = (orderId: string, productId: number, productName: string) => {
    setReviewDialog({
      isOpen: true,
      orderId,
      productId,
      productName
    });
    setReviewRating(5);
    setReviewComment('');
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      isOpen: false,
      orderId: '',
      productId: 0,
      productName: ''
    });
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!user?.userId) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(user.userId, {
        productId: reviewDialog.productId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      
      toast.success('Đánh giá thành công! Cảm ơn bạn đã đánh giá.');
      closeReviewDialog();
    } catch (error: unknown) {
      console.error('Error submitting review:', error);
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
          : 'Có lỗi xảy ra khi gửi đánh giá';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Đã giao';
      case 'SHIPPED':
        return 'Đang giao';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      case 'PENDING':
      default:
        return 'Chờ xác nhận';
    }
  };

  const getStatusColor = (status: string) => {
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
      case 'PENDING':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Tài khoản</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 text-white flex items-center justify-center text-2xl font-bold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <h3 className="font-bold">{user?.name || 'Người dùng'}</h3>
                  <p className="text-sm text-gray-600">{user?.email || ''}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5" />
                  <span className="font-medium">Điểm thưởng</span>
                </div>
                <div className="text-3xl font-bold">{user?.points || 0}</div>
                <p className="text-sm text-white/80 mt-1">≈ {Math.floor((user?.points || 0) / 100) * 10}K giảm giá</p>
              </div>

              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left">
                  <User className="w-5 h-5" />
                  <span>Thông tin tài khoản</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-left">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Đơn hàng của tôi</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left">
                  <Heart className="w-5 h-5" />
                  <span>Sản phẩm yêu thích</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left">
                  <MapPin className="w-5 h-5" />
                  <span>Địa chỉ giao hàng</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left">
                  <Gift className="w-5 h-5" />
                  <span>Ưu đãi của tôi</span>
                </button>
                <Separator className="my-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Thông tin</TabsTrigger>
                <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                <TabsTrigger value="vouchers">Ưu đãi</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
                    <Button
                      variant={editMode ? 'default' : 'outline'}
                      onClick={() => setEditMode(!editMode)}
                      className={editMode ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {editMode ? 'Lưu thay đổi' : 'Chỉnh sửa'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-bold mb-4">Đổi mật khẩu</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                        <Input id="currentPassword" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input id="newPassword" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                        <Input id="confirmNewPassword" type="password" placeholder="••••••••" />
                      </div>
                      <Button variant="outline">Cập nhật mật khẩu</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="space-y-4">
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <Card className="p-6 text-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
                      <Button onClick={() => navigate('/products')} className="mt-4 bg-red-600 hover:bg-red-700">
                        Mua sắm ngay
                      </Button>
                    </Card>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.orderId} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold">Đơn hàng #{order.orderId}</h3>
                              <Badge className={getStatusColor(order.orderStatus)}>
                                {getStatusText(order.orderStatus)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              {order.totalAmount.toLocaleString('vi-VN')}₫
                            </div>
                          </div>
                        </div>

                        <Separator className="mb-4" />

                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Phương thức thanh toán:</span>
                            <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                          </div>
                          {order.shippingAddress && (
                            <div className="flex justify-between">
                              <span>Địa chỉ giao hàng:</span>
                              <span className="font-medium text-gray-900 text-right max-w-[60%]">{order.shippingAddress}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          {order.orderStatus === 'DELIVERED' && (
                            <>
                              <Button variant="outline" className="flex-1">
                                Mua lại
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openReviewDialog(String(order.orderId), 1, `Đơn hàng #${order.orderId}`);
                                }}
                              >
                                Đánh giá
                              </Button>
                            </>
                          )}
                          {order.orderStatus === 'SHIPPED' && (
                            <Button variant="outline" className="flex-1">
                              Theo dõi đơn hàng
                            </Button>
                          )}
                          {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
                            <Button
                              variant="outline"
                              className="flex-1 text-red-600 hover:text-red-700"
                              onClick={async () => {
                                try {
                                  await orderService.cancelOrder(order.orderId);
                                  toast.success('Đã hủy đơn hàng thành công');
                                  fetchOrders();
                                } catch {
                                  toast.error('Không thể hủy đơn hàng');
                                }
                              }}
                            >
                              Hủy đơn hàng
                            </Button>
                          )}
                          <Button variant="outline">Chi tiết</Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Vouchers Tab */}
              <TabsContent value="vouchers">
                {loadingVouchers ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {voucherList.map((voucher) => (
                      <Card key={voucher.voucherId} className="overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5" />
                            <span className="font-medium">Mã giảm giá</span>
                          </div>
                          <div className="text-2xl font-bold mb-1">{voucher.voucherCode}</div>
                          <p className="text-sm text-white/90">{voucher.description}</p>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">
                              HSD: {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
                            </span>
                            {voucher.isValid ? (
                              <Badge className="bg-green-600">Khả dụng</Badge>
                            ) : (
                              <Badge variant="outline">Hết hạn</Badge>
                            )}
                          </div>
                          <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            disabled={!voucher.isValid}
                          >
                            {voucher.isValid ? 'Sử dụng ngay' : 'Hết hạn'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0">
                      <Gift className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">Tích điểm đổi quà</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Bạn có <span className="font-bold text-purple-600">{user?.points || 0} điểm</span>
                      </p>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Đổi điểm ngay
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => !open && closeReviewDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>
              Chia sẻ trải nghiệm của bạn về sản phẩm này
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Sản phẩm
              </Label>
              <p className="text-sm font-semibold text-gray-900">{reviewDialog.productName}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Đánh giá của bạn
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {reviewRating === 5
                  ? 'Tuyệt vời'
                  : reviewRating === 4
                  ? 'Hài lòng'
                  : reviewRating === 3
                  ? 'Bình thường'
                  : reviewRating === 2
                  ? 'Không hài lòng'
                  : 'Rất tệ'}
              </p>
            </div>

            <div>
              <Label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-2 block">
                Nhận xét của bạn
              </Label>
              <Textarea
                id="comment"
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReviewDialog} disabled={isSubmittingReview}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              disabled={isSubmittingReview || !reviewComment.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
