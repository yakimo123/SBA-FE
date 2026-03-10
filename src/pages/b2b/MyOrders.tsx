import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBulkOrders } from '../../contexts/BulkOrderContext';
import { BulkOrderStatus } from '../../types';

const STATUS_LABEL: Record<BulkOrderStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const STATUS_STYLE: Record<BulkOrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  PROCESSING: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  SHIPPED: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const ALL_TABS = [
  'ALL',
  'PENDING',
  'APPROVED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;
type Tab = (typeof ALL_TABS)[number];

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export function MyOrders() {
  const navigate = useNavigate();
  const { orders, cancelOrder } = useBulkOrders();
  const [tab, setTab] = useState<Tab>('ALL');

  const filtered = tab === 'ALL' ? orders : orders.filter((o) => o.status === tab);

  const handleCancel = (orderId: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    cancelOrder(orderId);
  };

  const countByStatus = (s: BulkOrderStatus) => orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Đơn hàng của tôi</h1>
          <p className="mt-0.5 text-sm text-slate-500">{orders.length} đơn hàng tổng cộng</p>
        </div>
        <button
          onClick={() => navigate('/company/orders/new')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn mới
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TABS.map((s) => {
          const count = s === 'ALL' ? orders.length : countByStatus(s as BulkOrderStatus);
          const isActive = tab === s;
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : STATUS_LABEL[s as BulkOrderStatus]}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <p className="text-sm">Không có đơn hàng nào</p>
            <button
              onClick={() => navigate('/company/orders/new')}
              className="mt-2 text-xs text-blue-600 hover:underline font-medium"
            >
              Tạo đơn hàng đầu tiên →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Mã đơn</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3">Sản phẩm</th>
                <th className="px-5 py-3 text-right">Tổng tiền</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((order) => (
                <tr
                  key={order.orderId}
                  className="group hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => navigate(`/company/orders/${order.orderId}`)}
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-blue-600">
                      {order.orderId}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 max-w-[200px]">
                    <p className="truncate">{order.items.map((i) => i.productName).join(', ')}</p>
                    <p className="text-slate-400 mt-0.5">{order.items.length} sản phẩm</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-slate-800">{fmt(order.total)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/company/orders/${order.orderId}`)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Chi tiết →
                      </button>
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
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
        )}
      </div>
    </div>
  );
}
