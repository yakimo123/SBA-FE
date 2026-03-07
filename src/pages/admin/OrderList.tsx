import { Eye, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Column, DataTable } from '../../components/admin/DataTable';
import { OrderResponse, orderService, OrderStatus } from '../../services/orderService';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-indigo-100 text-indigo-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED:    'bg-blue-100 text-blue-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
  REFUNDED:   'bg-orange-100 text-orange-800',
};

export function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .getOrders({ page: 0, size: 20, sort: 'orderDate,desc' })
      .then((data) => setOrders(data.content))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<OrderResponse>[] = [
    {
      header: 'Order ID',
      accessor: 'orderId',
      render: (order) => (
        <span className="font-['Fira_Code'] font-medium text-purple-900">#{order.orderId}</span>
      ),
    },
    { header: 'Customer', accessor: 'userFullName' },
    {
      header: 'Date',
      accessor: 'orderDate',
      render: (order) => new Date(order.orderDate).toLocaleDateString('vi-VN'),
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      render: (order) => (
        <span className="font-semibold text-gray-900">₫{order.totalAmount.toLocaleString()}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'orderStatus',
      render: (order) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      ),
    },
    { header: 'Payment', accessor: 'paymentMethod' },
    {
      header: 'Actions',
      accessor: 'orderId',
      sortable: false,
      render: (order) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-50">
            <Printer className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-['Fira_Sans'] text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-['Fira_Sans'] text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Orders</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage customer orders</p>
        </div>
      </div>

      <DataTable columns={columns} data={orders} keyField="orderId" pageSize={10} />
    </div>
  );
}
