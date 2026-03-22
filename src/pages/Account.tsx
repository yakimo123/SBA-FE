import { Check, Gift, Heart, LogOut, MapPin, Shield, ShoppingBag, Star, User } from 'lucide-react';
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
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { type OrderItemResponse, OrderResponse, orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { VoucherResponse,voucherService } from '../services/voucherService';
import { customerWarrantyService, type CustomerWarrantyResponse } from '../services/customerWarrantyService';
import { AddressPage } from './Address';

interface ReviewDialogState {
  isOpen: boolean;
  orderId: number;
  orderItems: OrderItemResponse[];
  selectedProductId: number | null;
  selectedProductName: string;
  isLoadingItems: boolean;
}

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || user?.phone || ''
  });

  // Update form data when user changes
  useEffect(() => {
    setFormData({
      name: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || user?.phone || ''
    });
  }, [user?.userId, user?.fullName, user?.name, user?.email, user?.phoneNumber, user?.phone]);

  // API data states
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [voucherList, setVoucherList] = useState<VoucherResponse[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [warranties, setWarranties] = useState<CustomerWarrantyResponse[]>([]);
  const [loadingWarranties, setLoadingWarranties] = useState(false);

  // Review dialog state
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>({
    isOpen: false,
    orderId: 0,
    orderItems: [],
    selectedProductId: null,
    selectedProductName: '',
    isLoadingItems: false,
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState<Set<number>>(new Set());

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

  const fetchUserReviews = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const data = await reviewService.getReviews({ userId: user.userId, page: 0, size: 200 });
      setReviewedProducts(new Set(data.content.map((r) => r.productId)));
    } catch {
      // silent
    }
  }, [user?.userId]);

  const fetchWarranties = useCallback(async () => {
    setLoadingWarranties(true);
    try {
      const data = await customerWarrantyService.getMyWarranties();
      setWarranties(data);
    } catch (err) {
      console.error('Error fetching warranties:', err);
    } finally {
      setLoadingWarranties(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchVouchers();
    fetchUserReviews();
    fetchWarranties();
  }, [fetchOrders, fetchVouchers, fetchUserReviews, fetchWarranties]);

  const isOrderFullyReviewed = (order: OrderResponse) => {
    const items = order.orderItems || [];
    if (items.length === 0) return false;
    return items.every((item) => reviewedProducts.has(item.productId));
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openReviewDialog = (orderId: number) => {
    const localOrder = orders.find((o) => o.orderId === orderId);
    const items = localOrder?.orderItems || [];
    // Find first un-reviewed product
    const firstUnreviewed = items.find((item) => !reviewedProducts.has(item.productId));
    if (!firstUnreviewed) {
      toast.info('Bạn đã đánh giá tất cả sản phẩm trong đơn hàng này rồi.', { duration: 5000 });
      return;
    }
    setReviewDialog({
      isOpen: true,
      orderId,
      orderItems: items,
      selectedProductId: firstUnreviewed.productId,
      selectedProductName: firstUnreviewed.productName,
      isLoadingItems: false,
    });
    setReviewRating(5);
    setReviewComment('');
  };

  const closeReviewDialog = () => {
    setReviewDialog({
      isOpen: false,
      orderId: 0,
      orderItems: [],
      selectedProductId: null,
      selectedProductName: '',
      isLoadingItems: false,
    });
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!user?.userId) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }

    if (!reviewDialog.selectedProductId) {
      toast.error('Vui lòng chọn sản phẩm cần đánh giá');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(user.userId, {
        productId: reviewDialog.selectedProductId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      
      toast.success('Đánh giá thành công! Cảm ơn bạn đã đánh giá.', { duration: 5000 });
      const newReviewed = new Set(reviewedProducts);
      newReviewed.add(reviewDialog.selectedProductId!);
      setReviewedProducts(newReviewed);
      // Move to next un-reviewed product or close
      const nextItem = reviewDialog.orderItems.find(
        (item) => item.productId !== reviewDialog.selectedProductId && !newReviewed.has(item.productId)
      );
      if (nextItem) {
        setReviewDialog((prev) => ({
          ...prev,
          selectedProductId: nextItem.productId,
          selectedProductName: nextItem.productName,
        }));
        setReviewRating(5);
        setReviewComment('');
      } else {
        closeReviewDialog();
      }
    } catch (error: unknown) {
      const errorMap: Record<number, string> = {
        409: 'Bạn đã đánh giá sản phẩm này rồi',
        400: 'Thông tin đánh giá không hợp lệ',
        401: 'Vui lòng đăng nhập để đánh giá',
        403: 'Bạn không có quyền thực hiện thao tác này',
      };
      let message = 'Có lỗi xảy ra khi gửi đánh giá';
      if (error && typeof error === 'object' && 'response' in error) {
        const status = (error as { response: { status: number } }).response?.status;
        if (status && errorMap[status]) {
          message = errorMap[status];
        }
        // Mark product as already reviewed on 409
        if (status === 409 && reviewDialog.selectedProductId) {
          setReviewedProducts((prev) => new Set(prev).add(reviewDialog.selectedProductId!));
          setReviewDialog((prev) => ({
            ...prev,
            selectedProductId: null,
            selectedProductName: '',
          }));
        }
      }
      toast.error(message, { duration: 5000 });
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
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'profile' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Thông tin tài khoản</span>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'orders' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Đơn hàng của tôi</span>
                </button>
                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'wishlist' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Sản phẩm yêu thích</span>
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'address' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Địa chỉ giao hàng</span>
                </button>
                <button 
                  onClick={() => setActiveTab('vouchers')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'vouchers' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span>Ưu đãi của tôi</span>
                </button>
                <button
                  onClick={() => setActiveTab('warranty')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === 'warranty' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Bảo hành của tôi</span>
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
            <div className="space-y-6">
              {/* Profile Section */}
              {activeTab === 'profile' && (
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
              )}

              {/* Orders Section */}
              {activeTab === 'orders' && (
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
                                className={`flex-1 ${isOrderFullyReviewed(order) ? 'opacity-60' : ''}`}
                                type="button"
                                disabled={isOrderFullyReviewed(order)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openReviewDialog(order.orderId);
                                }}
                              >
                                {isOrderFullyReviewed(order) ? (
                                  <><Check className="w-4 h-4 mr-1" /> Đã đánh giá</>
                                ) : (
                                  'Đánh giá'
                                )}
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
                          <Button variant="outline" onClick={() => navigate(`/orders/${order.orderId}`)}>Chi tiết</Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Vouchers Section */}
              {activeTab === 'vouchers' && (
                <>
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
                </>
              )}

              {/* Wishlist Section - Placeholder */}
              {activeTab === 'wishlist' && (
                <Card className="p-6 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Danh sách yêu thích của bạn</p>
                </Card>
              )}

              {/* Address Section */}
              {activeTab === 'address' && (
                <AddressPage />
              )}

              {/* Warranty Section */}
              {activeTab === 'warranty' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Bảo hành của tôi</h2>
                    <Badge className="bg-blue-100 text-blue-700">
                      {warranties.filter(w => w.status === 'ACTIVE' && !w.isExpired).length} đang bảo hành
                    </Badge>
                  </div>

                  {loadingWarranties ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    </div>
                  ) : warranties.length === 0 ? (
                    <Card className="p-6 text-center">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Bạn chưa có thông tin bảo hành nào</p>
                      <Button onClick={() => navigate('/products')} className="mt-4 bg-red-600 hover:bg-red-700">
                        Mua sắm ngay
                      </Button>
                    </Card>
                  ) : (
                    warranties.map((warranty) => (
                      <Card key={warranty.id} className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={warranty.productImage}
                            alt={warranty.productName}
                            className="w-20 h-20 object-cover rounded-lg shrink-0 bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-gray-900 line-clamp-2">{warranty.productName}</h3>
                              <Badge className={
                                warranty.status === 'ACTIVE' && !warranty.isExpired
                                  ? 'bg-green-100 text-green-700 shrink-0'
                                  : warranty.status === 'EXPIRED' || warranty.isExpired
                                  ? 'bg-red-100 text-red-700 shrink-0'
                                  : warranty.status === 'CLAIMED'
                                  ? 'bg-yellow-100 text-yellow-700 shrink-0'
                                  : 'bg-gray-100 text-gray-700 shrink-0'
                              }>
                                {warranty.status === 'ACTIVE' && !warranty.isExpired
                                  ? 'Còn bảo hành'
                                  : warranty.status === 'EXPIRED' || warranty.isExpired
                                  ? 'Hết hạn'
                                  : warranty.status === 'CLAIMED'
                                  ? 'Đang xử lý'
                                  : 'Vô hiệu'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                              <span>
                                Loại đơn:{' '}
                                <span className="font-medium text-gray-900">
                                  {warranty.orderType === 'NORMAL'
                                    ? `Đơn lẻ #${warranty.orderId}`
                                    : `Đơn B2B #${warranty.bulkOrderId}`}
                                </span>
                              </span>
                              {warranty.quantity > 1 && (
                                <span>
                                  Số lượng: <span className="font-medium text-gray-900">{warranty.quantity}</span>
                                </span>
                              )}
                              <span>
                                Bắt đầu:{' '}
                                <span className="font-medium text-gray-900">
                                  {new Date(warranty.startDate).toLocaleDateString('vi-VN')}
                                </span>
                              </span>
                              <span>
                                Kết thúc:{' '}
                                <span className="font-medium text-gray-900">
                                  {new Date(warranty.endDate).toLocaleDateString('vi-VN')}
                                </span>
                              </span>
                              <span>
                                Thời hạn:{' '}
                                <span className="font-medium text-gray-900">{warranty.warrantyMonths} tháng</span>
                              </span>
                            </div>

                            {warranty.status === 'ACTIVE' && !warranty.isExpired ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(100, Math.max(0, (warranty.daysRemaining / (warranty.warrantyMonths * 30)) * 100))}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-green-600 shrink-0">
                                  Còn {warranty.daysRemaining} ngày
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-red-500">Đã hết hạn bảo hành</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/product/${warranty.productId}`)}
                          >
                            Xem sản phẩm
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => !open && closeReviewDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đánh giá sản phẩm</DialogTitle>
            <DialogDescription>
              Đơn hàng #{reviewDialog.orderId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current product being reviewed */}
            {reviewDialog.selectedProductId && (() => {
              const currentItem = reviewDialog.orderItems.find((i) => i.productId === reviewDialog.selectedProductId);
              return currentItem ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                  {currentItem.productImage ? (
                    <img src={currentItem.productImage} alt={currentItem.productName} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentItem.productName}</p>
                    <p className="text-xs text-gray-500">
                      SL: {currentItem.quantity} × {currentItem.unitPrice?.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Progress indicator for multi-item orders */}
            {reviewDialog.orderItems.length > 1 && (() => {
              const reviewedCount = reviewDialog.orderItems.filter(
                (item) => reviewedProducts.has(item.productId)
              ).length;
              const total = reviewDialog.orderItems.length;
              return (
                <p className="text-xs text-gray-500 text-center">
                  Đánh giá sản phẩm {reviewedCount + 1}/{total}
                </p>
              );
            })()}

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
