import { CheckCircle, Clock, Gift, Heart, LogOut, MapPin, Package, ShoppingBag, User, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { mockOrders, vouchers } from '../data/mockData';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipping':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Đã giao';
      case 'shipping':
        return 'Đang giao';
      case 'processing':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Chờ xác nhận';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipping':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
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
                  {user.name.charAt(0)}
                </Avatar>
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5" />
                  <span className="font-medium">Điểm thưởng</span>
                </div>
                <div className="text-3xl font-bold">{user.points}</div>
                <p className="text-sm text-white/80 mt-1">≈ {Math.floor(user.points / 100) * 10}K giảm giá</p>
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
                  {mockOrders.map((order) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold">Đơn hàng #{order.id}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Ngày đặt: {order.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {order.total.toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>

                      <Separator className="mb-4" />

                      <div className="space-y-3 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-medium">{item.name}</span>
                              <span className="text-gray-600"> x{item.quantity}</span>
                            </div>
                            <span className="font-medium">
                              {item.price.toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        {order.status === 'delivered' && (
                          <>
                            <Button variant="outline" className="flex-1">
                              Mua lại
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Đánh giá
                            </Button>
                          </>
                        )}
                        {order.status === 'shipping' && (
                          <Button variant="outline" className="flex-1">
                            Theo dõi đơn hàng
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                            Hủy đơn hàng
                          </Button>
                        )}
                        <Button variant="outline">Chi tiết</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Vouchers Tab */}
              <TabsContent value="vouchers">
                <div className="grid md:grid-cols-2 gap-4">
                  {vouchers.map((voucher) => (
                    <Card key={voucher.id} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5" />
                          <span className="font-medium">Mã giảm giá</span>
                        </div>
                        <div className="text-2xl font-bold mb-1">{voucher.code}</div>
                        <p className="text-sm text-white/90">{voucher.title}</p>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">HSD: {voucher.expiry}</span>
                          {voucher.used ? (
                            <Badge variant="outline">Đã sử dụng</Badge>
                          ) : (
                            <Badge className="bg-green-600">Khả dụng</Badge>
                          )}
                        </div>
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={voucher.used}
                        >
                          {voucher.used ? 'Đã sử dụng' : 'Sử dụng ngay'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-6 mt-6 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0">
                      <Gift className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">Tích điểm đổi quà</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Bạn có <span className="font-bold text-purple-600">{user.points} điểm</span>
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
    </div>
  );
}
