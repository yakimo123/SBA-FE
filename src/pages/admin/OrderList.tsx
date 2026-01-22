import { Eye, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-2401', customer: 'Nguyen Van A', date: '2024-01-22', total: 1234000, status: 'Delivered', paymentMethod: 'Credit Card' },
  { id: 'ORD-2402', customer: 'Tran Thi B', date: '2024-01-22', total: 567000, status: 'Shipped', paymentMethod: 'COD' },
  { id: 'ORD-2403', customer: 'Le Van C', date: '2024-01-21', total: 890000, status: 'Processing', paymentMethod: 'Bank Transfer' },
  { id: 'ORD-2404', customer: 'Pham Thi D', date: '2024-01-20', total: 2340000, status: 'Pending', paymentMethod: 'Credt Card' },
  { id: 'ORD-2405', customer: 'Hoang Van E', date: '2024-01-19', total: 456000, status: 'Cancelled', paymentMethod: 'COD' },
];

export function OrderList() {
  const navigate = useNavigate();
  const [orders] = useState<Order[]>(mockOrders);

  const columns: Column<Order>[] = [
    { header: 'Order ID', accessor: 'id', render: (order) => <span className="font-['Fira_Code'] font-medium text-purple-900">{order.id}</span> },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Date', accessor: 'date' },
    { header: 'Total', accessor: 'total', render: (order) => <span className="font-semibold text-gray-900">₫{order.total.toLocaleString()}</span> },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (order) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold 
          ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'Processing' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {order.status}
        </span>
      )
    },
    { header: 'Payment', accessor: 'paymentMethod' },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (order) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-50"><Printer className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Orders</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage customer orders</p>
        </div>
      </div>

      <DataTable columns={columns} data={orders} keyField="id" pageSize={10} />
    </div>
  );
}
