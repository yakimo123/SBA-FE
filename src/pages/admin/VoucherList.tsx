import { Copy,Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Voucher {
  id: string;
  code: string;
  discount: string;
  type: 'Percentage' | 'Fixed';
  usage: number;
  limit: number;
  expiry: string;
  status: 'Active' | 'Expired';
}

const mockVouchers: Voucher[] = [
  { id: '1', code: 'WELCOME2024', discount: '10%', type: 'Percentage', usage: 154, limit: 1000, expiry: '2024-12-31', status: 'Active' },
  { id: '2', code: 'SUMMERSALE', discount: '₫50,000', type: 'Fixed', usage: 45, limit: 200, expiry: '2024-06-30', status: 'Active' },
  { id: '3', code: 'FLASH50', discount: '50%', type: 'Percentage', usage: 100, limit: 100, expiry: '2024-01-01', status: 'Expired' },
];

export function VoucherList() {
  const [vouchers] = useState<Voucher[]>(mockVouchers);

  const columns: Column<Voucher>[] = [
    { header: 'Code', accessor: 'code', render: (v) => <span className="rounded bg-gray-100 px-2 py-1 font-['Fira_Code'] font-medium text-purple-900">{v.code}</span> },
    { header: 'Discount', accessor: 'discount', render: (v) => <span className="font-bold text-green-600">{v.discount}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Usage', accessor: 'usage', render: (v) => <span>{v.usage} / {v.limit}</span> },
    { header: 'Expiry', accessor: 'expiry' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (v) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${v.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {v.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="flex gap-2">
          <button className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-50" title="Copy Code"><Copy className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50"><Edit className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Vouchers</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage discount codes and promotions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Create Voucher
        </button>
      </div>

      <DataTable columns={columns} data={vouchers} keyField="id" pageSize={10} />
    </div>
  );
}
