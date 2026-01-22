import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface BulkOrder {
  id: string;
  companyName: string;
  product: string;
  quantity: number;
  requestedPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

const mockBulkOrders: BulkOrder[] = [
  { id: 'BLK-001', companyName: 'Corporate Solutions Ltd', product: 'MacBook Air M2', quantity: 50, requestedPrice: 25000000, status: 'Pending', date: '2024-01-22' },
  { id: 'BLK-002', companyName: 'Tech Start Inc', product: 'Sony WH-1000XM5', quantity: 20, requestedPrice: 8500000, status: 'Approved', date: '2024-01-21' },
  { id: 'BLK-003', companyName: 'Edu Partners', product: 'iPad Air 5', quantity: 100, requestedPrice: 14000000, status: 'Rejected', date: '2024-01-20' },
];

export function BulkRequestList() {
  const [requests] = useState<BulkOrder[]>(mockBulkOrders);

  const columns: Column<BulkOrder>[] = [
    { header: 'Request ID', accessor: 'id', render: (req) => <span className="font-['Fira_Code'] font-medium text-purple-900">{req.id}</span> },
    { header: 'Company', accessor: 'companyName' },
    { header: 'Product', accessor: 'product' },
    { header: 'Qty', accessor: 'quantity', render: (req) => <span className="font-semibold">{req.quantity}</span> },
    { header: 'Target Price', accessor: 'requestedPrice', render: (req) => <span className="text-gray-900">₫{req.requestedPrice.toLocaleString()}</span> },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (req) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold 
          ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : 
            req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {req.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (req) => req.status === 'Pending' ? (
        <div className="flex gap-2">
          <button className="rounded-lg p-1.5 text-green-600 hover:bg-green-50" title="Approve"><Check className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Reject"><X className="h-4 w-4" /></button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Bulk Order Requests</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage B2B wholesale pricing requests</p>
        </div>
      </div>

      <DataTable columns={columns} data={requests} keyField="id" pageSize={10} />
    </div>
  );
}
