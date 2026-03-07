import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Printer,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { OrderResponse, orderService, OrderStatus } from '../../services/orderService';

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-indigo-100 text-indigo-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-blue-100 text-blue-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
  REFUNDED:   'bg-orange-100 text-orange-800',
};

const TIMELINE_STEPS: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const ALL_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.orderStatus);
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(order.orderId, selectedStatus);
      setOrder(updated);
      setShowStatusModal(false);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-['Fira_Sans'] text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-['Fira_Sans'] text-red-500">{error ?? 'Order not found'}</p>
      </div>
    );
  }

  const statusOrder = [...TIMELINE_STEPS, 'CANCELLED', 'REFUNDED'] as OrderStatus[];
  const currentIdx = statusOrder.indexOf(order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-['Fira_Code'] text-2xl font-bold text-purple-900 flex items-center gap-3">
              Order #{order.orderId}
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_BADGE[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </h1>
            <p className="font-['Fira_Sans'] text-gray-600">
              Placed on {new Date(order.orderDate).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Fira_Sans'] font-semibold text-gray-700 hover:bg-gray-50">
            <Printer className="h-5 w-5" /> Print Invoice
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-['Fira_Code'] text-lg font-bold text-gray-900">Update Order Status</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Summary */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Order Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {order.voucherCode && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Voucher</span>
                    <span className="font-medium text-green-700">{order.voucherCode}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₫{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="relative space-y-6 pl-4 border-l-2 border-gray-200">
                {TIMELINE_STEPS.map((s) => {
                  const stepIdx = statusOrder.indexOf(s);
                  const isDone = currentIdx >= stepIdx;
                  const isCurrent = order.orderStatus === s;
                  return (
                    <div key={s} className="relative">
                      <div className={`absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-white
                        ${isCurrent ? 'bg-orange-500' : isDone ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {s === 'SHIPPED' ? <Truck className="h-5 w-5" /> :
                          s === 'DELIVERED' ? <CheckCircle className="h-5 w-5" /> :
                          s === 'CANCELLED' ? <XCircle className="h-5 w-5" /> :
                          <Clock className="h-5 w-5" />}
                      </div>
                      <div className="pl-6 pt-2">
                        <h4 className={`font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Customer
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.userFullName}</p>
                  <p className="text-xs text-gray-500">User ID: {order.userId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Shipping Address
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-3 text-sm text-gray-600">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <p>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Payment Info
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <CreditCard className="h-4 w-4" />
                {order.paymentMethod}
              </div>
              <p className="text-sm text-gray-500">
                Ordered on {new Date(order.orderDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
