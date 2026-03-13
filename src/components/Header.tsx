import {
  Building2,
  Heart,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Phone,
  Search,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ROLES } from '../constants/roles';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
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

type PublicSearchResults = {
  products: Array<{
    productId: number | string;
    productName: string;
    mainImage?: string;
    price?: number;
    discountPercent?: number;
    rating?: number;
    categoryName?: string;
    brandName?: string;
  }>;
  categories: Array<{ categoryId: number | string; categoryName: string }>;
  brands: Array<{ brandId: number | string; brandName: string }>;
  vouchers: Array<{
    voucherCode: string;
    description?: string;
    discountPercent?: number;
  }>;
};

const HIGHLIGHT_CLASS = 'bg-[#ede9fe] text-[#7c3aed] rounded-[3px] px-[2px]';

function highlightText(text: string, keyword: string) {
  if (!keyword) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className={HIGHLIGHT_CLASS}>
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicSearchResults>({
    products: [],
    categories: [],
    brands: [],
    vouchers: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isCompany = user?.role === ROLES.COMPANY;

  const flattenedItems = useMemo(() => {
    type Item =
      | { type: 'product'; key: string; productId: number | string }
      | { type: 'category'; key: string; categoryId: number | string }
      | { type: 'brand'; key: string; brandId: number | string }
      | { type: 'voucher'; key: string; voucherCode: string };

    const items: Item[] = [];
    for (const p of results.products ?? []) {
      items.push({ type: 'product', key: `p-${p.productId}`, productId: p.productId });
    }
    for (const c of results.categories ?? []) {
      items.push({ type: 'category', key: `c-${c.categoryId}`, categoryId: c.categoryId });
    }
    for (const b of results.brands ?? []) {
      items.push({ type: 'brand', key: `b-${b.brandId}`, brandId: b.brandId });
    }
    for (const v of results.vouchers ?? []) {
      items.push({ type: 'voucher', key: `v-${v.voucherCode}`, voucherCode: v.voucherCode });
    }
    return items;
  }, [results]);

  const hasAnyResult =
    (results.products?.length ?? 0) > 0 ||
    (results.categories?.length ?? 0) > 0 ||
    (results.brands?.length ?? 0) > 0 ||
    (results.vouchers?.length ?? 0) > 0;

  useEffect(() => {
    if (!query.trim()) {
      setOpen(false);
      setActiveIndex(-1);
      setResults({ products: [], categories: [], brands: [], vouchers: [] });
      return;
    }

    if (query.trim().length < 1) {
      setOpen(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      const API_BASE_URL =
        (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
          .VITE_API_URL || 'http://localhost:8080';
      const url = `${API_BASE_URL}/api/public/search?q=${encodeURIComponent(query.trim())}&limit=5`;

      try {
        setLoading(true);
        console.log('[public-search] baseURL:', API_BASE_URL);
        console.log('[public-search] url:', url);

        const res = await fetch(url);
        const raw = await res.text();
        let data: any = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          data = raw;
        }

        console.log('[public-search] status:', res.status);
        console.log('[public-search] body:', data);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const payload = (data as any)?.data ?? data;
        setResults({
          products: payload?.products ?? [],
          categories: payload?.categories ?? [],
          brands: payload?.brands ?? [],
          vouchers: payload?.vouchers ?? [],
        });
        setOpen(true);
      } catch (error) {
        console.log('[public-search] error:', error);
        setResults({ products: [], categories: [], brands: [], vouchers: [] });
        setOpen(true);
      } finally {
        setLoading(false);
        setActiveIndex(-1);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmitSearch = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const handleSelectItem = async (item: (typeof flattenedItems)[number]) => {
    if (item.type === 'product') {
      navigate(`/product/${item.productId}`);
      setOpen(false);
      return;
    }
    if (item.type === 'category') {
      navigate(`/products?category=${item.categoryId}`);
      setOpen(false);
      return;
    }
    if (item.type === 'brand') {
      navigate(`/products?brand=${item.brandId}`);
      setOpen(false);
      return;
    }
    if (item.type === 'voucher') {
      try {
        await navigator.clipboard.writeText(item.voucherCode);
        toast.info(`Đã copy mã: ${item.voucherCode}`);
      } catch {
        toast.error('Không thể copy mã voucher');
      } finally {
        setOpen(false);
      }
    }
  };

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
            <div className="relative" ref={searchContainerRef}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer"
                onClick={handleSubmitSearch}
              />
              <Input
                placeholder="Tìm kiếm sản phẩm, danh mục, thương hiệu..."
                className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  setQuery(next);
                  if (next.trim()) setOpen(true);
                  else setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setOpen(false);
                    setActiveIndex(-1);
                    return;
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!open) setOpen(true);
                    setActiveIndex((prev) => {
                      const next = Math.min(prev + 1, flattenedItems.length - 1);
                      return next;
                    });
                    return;
                  }

                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                    return;
                  }

                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeIndex >= 0 && flattenedItems[activeIndex]) {
                      void handleSelectItem(flattenedItems[activeIndex]);
                    } else {
                      handleSubmitSearch();
                    }
                  }
                }}
                onFocus={() => {
                  if (query.trim()) setOpen(true);
                }}
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}

              {open && query.trim() && (
                <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-[8px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100">
                  <div className="max-h-[420px] overflow-y-auto py-2">
                    {!loading && !hasAnyResult && (
                      <div className="px-4 py-6 text-center">
                        <div className="text-lg">🔍</div>
                        <div className="mt-2 text-sm font-semibold text-gray-800">
                          Không tìm thấy kết quả
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          cho "{query.trim()}"
                        </div>
                      </div>
                    )}

                    {(results.products ?? []).length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#ee4d2d]">
                          📦 Sản phẩm
                        </div>
                        {(results.products ?? []).map((p) => {
                          const idx = flattenedItems.findIndex(
                            (i) => i.type === 'product' && i.key === `p-${p.productId}`
                          );
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={p.productId}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => {
                                navigate(`/product/${p.productId}`);
                                setOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left transition duration-150 ${
                                isActive ? 'bg-[#fff7f0]' : 'hover:bg-[#fff7f0]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 shrink-0 overflow-hidden rounded bg-gray-100">
                                  {p.mainImage ? (
                                    <img
                                      src={p.mainImage}
                                      alt={p.productName}
                                      className="h-5 w-5 object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="truncate text-sm font-medium text-gray-900">
                                    {highlightText(p.productName, query.trim())}
                                  </div>
                                </div>
                                {typeof p.price === 'number' && (
                                  <div className="text-sm font-semibold text-[#ee4d2d]">
                                    {p.price.toLocaleString('vi-VN')}₫
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(results.categories ?? []).length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#ee4d2d]">
                          🏷️ Danh mục
                        </div>
                        {(results.categories ?? []).map((c) => {
                          const idx = flattenedItems.findIndex(
                            (i) => i.type === 'category' && i.key === `c-${c.categoryId}`
                          );
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={c.categoryId}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => {
                                navigate(`/products?category=${c.categoryId}`);
                                setOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left transition duration-150 ${
                                isActive ? 'bg-[#fff7f0]' : 'hover:bg-[#fff7f0]'
                              }`}
                            >
                              <div className="text-sm text-gray-900">
                                {highlightText(c.categoryName, query.trim())}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(results.brands ?? []).length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#ee4d2d]">
                          🎯 Thương hiệu
                        </div>
                        {(results.brands ?? []).map((b) => {
                          const idx = flattenedItems.findIndex(
                            (i) => i.type === 'brand' && i.key === `b-${b.brandId}`
                          );
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={b.brandId}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => {
                                navigate(`/products?brand=${b.brandId}`);
                                setOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-left transition duration-150 ${
                                isActive ? 'bg-[#fff7f0]' : 'hover:bg-[#fff7f0]'
                              }`}
                            >
                              <div className="text-sm text-gray-900">
                                {highlightText(b.brandName, query.trim())}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(results.vouchers ?? []).length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#ee4d2d]">
                          🎟️ Voucher
                        </div>
                        {(results.vouchers ?? []).map((v) => {
                          const idx = flattenedItems.findIndex(
                            (i) => i.type === 'voucher' && i.key === `v-${v.voucherCode}`
                          );
                          const isActive = idx === activeIndex;
                          return (
                            <button
                              key={v.voucherCode}
                              type="button"
                              onMouseEnter={() => setActiveIndex(idx)}
                              onClick={() => {
                                void (async () => {
                                  try {
                                    await navigator.clipboard.writeText(v.voucherCode);
                                    toast.info(`Đã copy mã: ${v.voucherCode}`);
                                  } catch {
                                    toast.error('Không thể copy mã voucher');
                                  } finally {
                                    setOpen(false);
                                  }
                                })();
                              }}
                              className={`w-full px-4 py-2 text-left transition duration-150 ${
                                isActive ? 'bg-[#fff7f0]' : 'hover:bg-[#fff7f0]'
                              }`}
                            >
                              <div className="text-sm font-semibold text-gray-900">
                                {highlightText(v.voucherCode, query.trim())}
                              </div>
                              {v.description && (
                                <div className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                                  {highlightText(v.description, query.trim())}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              onClick={() => navigate('/wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600">
                  {wishlistCount}
                </Badge>
              )}
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
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Quản trị
                    </DropdownMenuItem>
                  )}
                  {isCompany && (
                    <DropdownMenuItem onClick={() => navigate('/company')}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Doanh nghiệp
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
              to="/products?categoryName=Phụ kiện điện thoại"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện điện thoại
            </Link>
            <Link
              to="/products?categoryName=Phụ kiện laptop"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện laptop
            </Link>
            <Link
              to="/products?categoryName=Thiết bị âm thanh"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Thiết bị âm thanh
            </Link>
            <Link
              to="/products?categoryName=Phụ kiện gaming"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Phụ kiện gaming
            </Link>
            <Link
              to="/products?categoryName=Thiết bị lưu trữ"
              className="hover:text-red-600 whitespace-nowrap"
            >
              Thiết bị lưu trữ
            </Link>
            <button
              onClick={() => navigate('/products?sortBy=discountPercent,desc')}
              className="text-red-600 font-medium whitespace-nowrap"
            >
              🔥 Flash Sale
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
