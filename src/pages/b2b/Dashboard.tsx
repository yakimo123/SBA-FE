import {
  ClipboardList,
  DollarSign,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';
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
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-300',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-300',
  AWAITING_PAYMENT: 'bg-orange-50 text-orange-700 border-orange-300',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-300',
  COMPLETED: 'bg-green-50 text-green-700 border-green-300',
  CANCELLED: 'bg-slate-100 text-slate-600 border-slate-300',
  REJECTED: 'bg-red-50 text-red-700 border-red-300',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  );

export function CompanyDashboard() {
  const navigate = useNavigate();
  const { orders } = useBulkOrders();

  const totalSpend = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + o.finalPrice, 0);
  const pendingCount = orders.filter(
    (o) => o.status === 'PENDING_REVIEW'
  ).length;
  const totalOrders = orders.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Fira_Code'] text-3xl font-bold text-blue-900">
          Tổng quan
        </h1>
        <p className="mt-1 font-['Fira_Sans'] text-gray-500">
          Theo dõi hoạt động đặt hàng của công ty bạn
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Tổng đơn */}
        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Fira_Sans'] text-sm text-gray-500">
                Tổng đơn hàng
              </p>
              <p className="mt-1 font-['Fira_Code'] text-3xl font-bold text-blue-900">
                {totalOrders}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Chờ duyệt */}
        <div className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Fira_Sans'] text-sm text-gray-500">
                Chờ duyệt
              </p>
              <p className="mt-1 font-['Fira_Code'] text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Tổng chi tiêu */}
        <div className="rounded-xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-['Fira_Sans'] text-sm text-gray-500">
                Tổng chi tiêu
              </p>
              <p className="mt-1 font-['Fira_Code'] text-2xl font-bold text-green-700">
                {fmt(totalSpend)}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/company/orders/new')}
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-['Fira_Sans'] text-sm font-semibold shadow-sm transition-colors"
          style={{
            borderColor: '#bfdbfe',
            backgroundColor: '#ffffff',
            color: '#1d4ed8',
          }}
        >
          <PlusCircle className="h-4 w-4" />
          Tạo đơn hàng mới
        </button>
        <button
          onClick={() => navigate('/company/orders')}
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-['Fira_Sans'] text-sm font-semibold transition-colors"
          style={{
            borderColor: '#93c5fd',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
          }}
        >
          <ClipboardList className="h-4 w-4" />
          Xem tất cả đơn hàng
        </button>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="mb-4 font-['Fira_Code'] text-xl font-semibold text-blue-900">
          Đơn hàng gần đây
        </h2>
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <table className="w-full text-sm font-['Fira_Sans']">
            <thead>
              <tr className="border-b border-blue-50 bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-blue-700">
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Ngày tạo</th>
                <th className="px-6 py-3">Sản phẩm</th>
                <th className="px-6 py-3 text-right">Tổng tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.bulkOrderId}
                  className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-medium text-blue-700">
                    {order.bulkOrderId}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate">
                    {order.details && order.details.length > 0
                      ? order.details.map((d) => d.productName).join(', ')
                      : 'Không có chi tiết'}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {fmt(order.finalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 border text-xs font-semibold ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() =>
                        navigate(`/company/orders/${order.bulkOrderId}`)
                      }
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Chưa có đơn hàng nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
