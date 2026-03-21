import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  Package,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
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

const ALL_TABS = [
  'ALL',
  'PENDING_REVIEW',
  'CONFIRMED',
  'AWAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
] as const;
type Tab = (typeof ALL_TABS)[number];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  );

export function MyOrders() {
  const navigate = useNavigate();
  const { orders, cancelOrder } = useBulkOrders();
  const [tab, setTab] = useState<Tab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filtered = useMemo(() => {
    let result =
      tab === 'ALL' ? orders : orders.filter((o) => o.status === tab);

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (o) =>
          String(o.bulkOrderId).includes(searchQuery) ||
          o.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.details.some((d) =>
            d.productName.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return b.finalPrice - a.finalPrice;
    });

    return result;
  }, [orders, tab, searchQuery, sortBy]);

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    await cancelOrder(orderId);
  };

  const countByStatus = (s: BulkOrderStatus) =>
    orders.filter((o) => o.status === s).length;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);
    const pendingCount = countByStatus('PENDING_REVIEW');
    const completedCount = countByStatus('COMPLETED');
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: pendingCount,
      completedOrders: completedCount,
      avgOrderValue,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Breadcrumb Navigation ── */}
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/company')}
            className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            B2B Portal
          </button>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900">Đơn hàng</span>
        </nav>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Đơn hàng của tôi
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Quản lý và theo dõi tất cả đơn hàng của bạn
            </p>
          </div>
          <button
            onClick={() => navigate('/company/orders/new')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ee4d2d] to-[#ee4d2d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:from-[#d73211] hover:to-[#d73211] focus:outline-none focus:ring-2 focus:ring-[#ee4d2d] focus:ring-offset-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            Tạo đơn hàng mới
          </button>
        </div>

        {/* ── Statistics Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Tổng đơn hàng
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-[#ee4d2d]" />
              </div>
            </div>
            <p className="mt-4 flex items-center text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% so với tháng trước
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Tổng chi tiêu
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M đ
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <p className="mt-4 flex items-center text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.4% so với tháng trước
            </p>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Chờ duyệt</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Cần xử lý trong 24h</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Đã hoàn thành
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats.completedOrders}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-[#ee4d2d]" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {stats.totalOrders > 0
                ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
                : 0}
              % tỷ lệ hoàn thành
            </p>
          </div>
        </div>

        {/* ── Filters & Search ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {/* Status Filter Pills */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3 block">
              Lọc theo trạng thái
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTab('ALL')}
                style={
                  tab === 'ALL'
                    ? {
                        backgroundColor: '#ee4d2d',
                        color: '#ffffff',
                        borderColor: '#ee4d2d',
                      }
                    : {}
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  tab === 'ALL'
                    ? 'shadow-sm hover:bg-[#d73211]'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Tất cả{' '}
                <span className="ml-1.5 text-xs opacity-80">
                  ({orders.length})
                </span>
              </button>

              {(
                [
                  'PENDING_REVIEW',
                  'CONFIRMED',
                  'AWAITING_PAYMENT',
                  'PAID',
                  'PROCESSING',
                  'SHIPPED',
                  'COMPLETED',
                  'CANCELLED',
                  'REJECTED',
                ] as const
              ).map((s) => {
                const count = countByStatus(s);
                const activeColors: Record<
                  BulkOrderStatus,
                  { bg: string; border: string; color: string }
                > = {
                  PENDING_REVIEW: {
                    bg: '#d97706',
                    border: '#d97706',
                    color: '#ffffff',
                  },
                  CONFIRMED: {
                    bg: '#ee4d2d',
                    border: '#ee4d2d',
                    color: '#ffffff',
                  },
                  AWAITING_PAYMENT: {
                    bg: '#ea580c',
                    border: '#ea580c',
                    color: '#ffffff',
                  },
                  PAID: { bg: '#059669', border: '#059669', color: '#ffffff' },
                  PROCESSING: {
                    bg: '#ee4d2d',
                    border: '#ee4d2d',
                    color: '#ffffff',
                  },
                  SHIPPED: {
                    bg: '#7c3aed',
                    border: '#7c3aed',
                    color: '#ffffff',
                  },
                  COMPLETED: {
                    bg: '#15803d',
                    border: '#15803d',
                    color: '#ffffff',
                  },
                  CANCELLED: {
                    bg: '#475569',
                    border: '#475569',
                    color: '#ffffff',
                  },
                  REJECTED: {
                    bg: '#dc2626',
                    border: '#dc2626',
                    color: '#ffffff',
                  },
                };
                const isActive = tab === s;
                const colors = activeColors[s];
                return (
                  <button
                    key={s}
                    onClick={() => setTab(s)}
                    style={
                      isActive
                        ? {
                            backgroundColor: colors.bg,
                            color: colors.color,
                            borderColor: colors.border,
                          }
                        : {}
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      isActive
                        ? 'shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {STATUS_LABEL[s]}{' '}
                    <span className="ml-1.5 text-xs opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hoặc sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d] focus:border-transparent transition-all"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortBy === 'date' ? 'Ngày tạo' : 'Giá trị'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Data Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-slate-400">
              <div className="p-6 bg-slate-50 rounded-full">
                <Package className="h-16 w-16 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-600 mb-1">
                  Không có đơn hàng nào
                </p>
                <p className="text-sm text-slate-500">
                  Bạn chưa có đơn hàng nào trong danh mục này
                </p>
              </div>
              <button
                onClick={() => navigate('/company/orders/new')}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ee4d2d] to-[#ee4d2d] text-white rounded-lg font-semibold hover:from-[#d73211] hover:to-[#d73211] transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Tạo đơn hàng đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Mã đơn
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => (
                    <tr
                      key={order.bulkOrderId}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/company/orders/${order.bulkOrderId}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                            <ShoppingBag className="h-5 w-5 text-[#ee4d2d]" />
                          </div>
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            #{order.bulkOrderId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString(
                              'vi-VN'
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[280px]">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {order.details.map((d) => d.productName).join(', ')}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {order.details.length} sản phẩm
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {fmt(order.finalPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
                        >
                          {STATUS_LABEL[order.status]}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(`/company/orders/${order.bulkOrderId}`)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#ee4d2d] hover:text-[#d73211] hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </button>
                          {(order.status === 'PENDING_REVIEW' ||
                            order.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancel(order.bulkOrderId)}
                              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
