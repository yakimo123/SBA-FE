import {
  Heart,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ROLES } from '../constants/roles';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminOrCompany =
    user?.role === ROLES.ADMIN || user?.role === ROLES.COMPANY;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Hotline: 1900-xxxx</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Hệ thống 50+ cửa hàng toàn quốc</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:underline">Tra cứu đơn hàng</button>
            <button className="hover:underline">Tìm cửa hàng</button>
            <button
              onClick={() => navigate('/register-business')}
              className="hover:underline font-medium border-l pl-4"
            >
              🏢 Đăng ký Doanh nghiệp
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PK</span>
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-lg leading-tight">PHỤ KIỆN</div>
              <div className="text-xs text-gray-600">ĐIỆN TỬ</div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm, danh mục, thương hiệu..."
                className="pl-10 pr-4 h-11 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
              <button className="hover:text-red-600">Tai nghe gaming</button>
              <span>•</span>
              <button className="hover:text-red-600">Ốp lưng iPhone 15</button>
              <span>•</span>
              <button className="hover:text-red-600">Chuột không dây</button>
              <span>•</span>
              <button className="hover:text-red-600">Sạc nhanh</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    <span>{user.name || user.fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <User className="w-4 h-4 mr-2" />
                    Tài khoản
                  </DropdownMenuItem>
                  {isAdminOrCompany && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Quản trị
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="hidden md:flex bg-red-600 hover:bg-red-700"
              >
                Đăng nhập
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-8 py-3 text-sm overflow-x-auto">
            <Link to="/" className="font-medium text-red-600 whitespace-nowrap">
              Trang chủ
            </Link>
            <Link
              to="/products"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện điện thoại
            </Link>
            <Link
              to="/products"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện laptop
            </Link>
            <Link
              to="/products"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Thiết bị âm thanh
            </Link>
            <Link
              to="/products"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện gaming
            </Link>
            <Link
              to="/products"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Thiết bị lưu trữ
            </Link>
            <button className="text-red-600 font-medium whitespace-nowrap">
              🔥 Flash Sale
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
