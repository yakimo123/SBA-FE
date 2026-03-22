import { Bell, Home, LogIn, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { Sidebar } from '../components/admin/Sidebar';
import ScrollToTop from '../components/common/ScrollToTop';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services';

type SearchResults = {
  products: Array<{
    productId: number | string;
    productName: string;
    categoryName?: string;
    price?: number;
  }>;
  orders: Array<{
    orderId: number | string;
    userId?: number | string;
    userFullName?: string;
    orderStatus?: string;
  }>;
  customers: Array<{
    userId: number | string;
    fullName: string;
    email?: string;
  }>;
  reviews: Array<{
    id: number | string;
    userFullName?: string;
    productName?: string;
    rating?: number;
  }>;
  categories: Array<{
    id: number | string;
    categoryName: string;
  }>;
  brands: Array<{
    id: number | string;
    brandName: string;
  }>;
  suppliers: Array<{
    id: number | string;
    supplierName: string;
    email?: string;
  }>;
  vouchers: Array<{
    id: number | string;
    voucherCode: string;
    description?: string;
  }>;
  storeBranches: Array<{
    id: number | string;
    branchName: string;
    address?: string;
  }>;
};

const HIGHLIGHT_CLASS =
  'bg-[#dc2626]/10 text-[#dc2626] rounded-[3px] px-[2px] font-semibold';

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

export function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    products: [],
    orders: [],
    customers: [],
    reviews: [],
    categories: [],
    brands: [],
    suppliers: [],
    vouchers: [],
    storeBranches: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setOpen(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      window.clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/search', {
          params: { q: query.trim(), limit: 5 },
        });
        const payload = (response.data as any)?.data ?? response.data;
        setResults({
          products: payload?.products ?? [],
          orders: payload?.orders ?? [],
          customers: payload?.customers ?? [],
          reviews: payload?.reviews ?? [],
          categories: payload?.categories ?? [],
          brands: payload?.brands ?? [],
          suppliers: payload?.suppliers ?? [],
          vouchers: payload?.vouchers ?? [],
          storeBranches: payload?.storeBranches ?? [],
        });
        setOpen(true);
      } catch {
        setResults({
          products: [],
          orders: [],
          customers: [],
          reviews: [],
          categories: [],
          brands: [],
          suppliers: [],
          vouchers: [],
          storeBranches: [],
        });
        setOpen(true);
      } finally {
        setLoading(false);
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

  const hasAnyResult =
    (results.products?.length ?? 0) > 0 ||
    (results.orders?.length ?? 0) > 0 ||
    (results.customers?.length ?? 0) > 0 ||
    (results.reviews?.length ?? 0) > 0 ||
    (results.categories?.length ?? 0) > 0 ||
    (results.brands?.length ?? 0) > 0 ||
    (results.suppliers?.length ?? 0) > 0 ||
    (results.vouchers?.length ?? 0) > 0 ||
    (results.storeBranches?.length ?? 0) > 0;

  return (
    <SidebarProvider>
      <ScrollToTop />
      <Sidebar />

      {/* Main Content */}
      <SidebarInset className="bg-[#f8f9fa]">
        {/* Header */}
        <header
          className="sticky top-0 z-30 shadow-sm border-b border-gray-100 bg-white"
        >
          <div className="flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4 mx-4">
              {/* Search */}
              <div className="flex-1 max-w-3xl" ref={searchContainerRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="w-full rounded-[12px] border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 font-['Inter'] text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 focus:bg-white"
                    value={query}
                    onChange={(e) => {
                      const next = e.target.value;
                      setQuery(next);
                      if (!next.trim()) {
                        setOpen(false);
                      } else {
                        setOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (query.trim()) setOpen(true);
                    }}
                  />
                  {open && query.trim() && (
                    <div className="absolute left-0 right-0 mt-2 max-h-[420px] overflow-y-auto rounded-[12px] border border-[#dc2626]/20 bg-white py-2 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                      <div className="px-4 pt-[10px] pb-[6px] border-b border-[#f3f4f6] flex items-center justify-between text-[12px] font-['Inter'] text-[#6b7280]">
                        <span>Kết quả tìm kiếm cho "{query.trim()}"</span>
                        {loading && (
                          <span className="italic text-[#dc2626]/70">Đang tìm...</span>
                        )}
                      </div>

                      {loading && (
                        <div className="px-4 py-3">
                          <div className="space-y-2 animate-pulse">
                            <div className="h-8 rounded-[8px] bg-[#f3f4f6]" />
                            <div className="h-8 rounded-[8px] bg-[#f3f4f6]" />
                            <div className="h-8 rounded-[8px] bg-[#f3f4f6]" />
                          </div>
                        </div>
                      )}

                      {!loading && !hasAnyResult && (
                        <div className="px-4 py-10 text-center font-['Inter']">
                          <div className="text-[18px]">🔍</div>
                          <div className="mt-2 text-[12px] font-semibold text-[#1a1a2e]">
                            Không tìm thấy kết quả
                          </div>
                          <div className="mt-1 text-[11px] text-[#9ca3af]">
                            cho '{query.trim()}'
                          </div>
                        </div>
                      )}

                      {!loading && hasAnyResult && (
                        <div className="divide-y divide-[#f3f4f6] font-['Inter']">
                          {(results.products ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>📦 Sản phẩm</span>
                              </div>
                              {(results.products ?? []).map((p) => (
                                <button
                                  key={p.productId}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/products/${p.productId}/edit`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(p.productName, query.trim())}
                                  </div>
                                  <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                    {p.categoryName && (
                                      <span className="mr-2">
                                        {highlightText(p.categoryName, query.trim())}
                                      </span>
                                    )}
                                    {typeof p.price === 'number' && (
                                      <span>
                                        {highlightText(
                                          `${p.price.toLocaleString('vi-VN')}₫`,
                                          query.trim()
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.orders ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🛒 Đơn hàng</span>
                              </div>
                              {(results.orders ?? []).map((o) => (
                                <button
                                  key={o.orderId}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/orders/${o.orderId}`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(`Đơn #${o.orderId}`, query.trim())}
                                  </div>
                                  <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                    {o.userFullName && (
                                      <span className="mr-2">
                                        {highlightText(o.userFullName, query.trim())}
                                      </span>
                                    )}
                                    {o.orderStatus && (
                                      <span>{highlightText(o.orderStatus, query.trim())}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.customers ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>👤 Khách hàng</span>
                              </div>
                              {(results.customers ?? []).map((c) => (
                                <button
                                  key={c.userId}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/customers/${c.userId}`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(c.fullName, query.trim())}
                                  </div>
                                  {c.email && (
                                    <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                      {highlightText(c.email, query.trim())}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.reviews ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>💬 Đánh giá</span>
                              </div>
                              {(results.reviews ?? []).map((r) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/customers/feedback`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(r.userFullName || 'Review', query.trim())}
                                  </div>
                                  <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                    {r.productName && (
                                      <span className="mr-2">
                                        {highlightText(r.productName, query.trim())}
                                      </span>
                                    )}
                                    {typeof r.rating === 'number' && (
                                      <span>{highlightText(`${r.rating}★`, query.trim())}</span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.categories ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🏷️ Danh mục</span>
                              </div>
                              {(results.categories ?? []).map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/products/categories`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(c.categoryName, query.trim())}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.brands ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🎯 Thương hiệu</span>
                              </div>
                              {(results.brands ?? []).map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/products/trademarks`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(b.brandName, query.trim())}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.suppliers ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🏭 Nhà cung cấp</span>
                              </div>
                              {(results.suppliers ?? []).map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/products/suppliers`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(s.supplierName, query.trim())}
                                  </div>
                                  {s.email && (
                                    <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                      {highlightText(s.email, query.trim())}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.vouchers ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🎟️ Voucher</span>
                              </div>
                              {(results.vouchers ?? []).map((v) => (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/orders/vouchers`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(v.voucherCode, query.trim())}
                                  </div>
                                  {v.description && (
                                    <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                      {highlightText(v.description, query.trim())}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {(results.storeBranches ?? []).length > 0 && (
                            <div className="py-2">
                              <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#dc2626]/70 flex items-center gap-1">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#dc2626]/40" />
                                <span>🏪 Chi nhánh</span>
                              </div>
                              {(results.storeBranches ?? []).map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/admin/settings/stores`);
                                    setOpen(false);
                                  }}
                                  className="w-full px-4 py-2 text-left transition duration-150 hover:bg-[#dc2626]/5 rounded-[8px]"
                                >
                                  <div className="text-[13px] font-semibold text-[#1a1a2e]">
                                    {highlightText(b.branchName, query.trim())}
                                  </div>
                                  {b.address && (
                                    <div className="mt-[2px] text-[11px] text-[#9ca3af] line-clamp-2">
                                      {highlightText(b.address, query.trim())}
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* User Email */}
              {isAuthenticated && user?.email && (
                <span className="hidden md:inline-block max-w-[200px] truncate text-sm font-['Inter'] text-gray-700">
                  User: {user.email}
                </span>
              )}

              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-[10px] p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#dc2626]"></span>
              </button>

              {/* Trang chủ */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 rounded-[10px] border border-gray-200 px-3 py-1.5 text-sm font-['Inter'] font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </button>

              {/* Login */}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#ee4d2d] to-[#d73211] px-3 py-1.5 text-sm font-['Inter'] font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
