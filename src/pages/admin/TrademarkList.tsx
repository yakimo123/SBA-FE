import { Edit, Plus, Star,Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Trademark {
  id: string;
  name: string;
  country: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

const mockTrademarks: Trademark[] = [
  { id: '1', name: 'Apple', country: 'USA', productCount: 156, status: 'Active' },
  { id: '2', name: 'Samsung', country: 'South Korea', productCount: 142, status: 'Active' },
  { id: '3', name: 'Sony', country: 'Japan', productCount: 89, status: 'Active' },
  { id: '4', name: 'Xiaomi', country: 'China', productCount: 120, status: 'Active' },
  { id: '5', name: 'Logitech', country: 'Switzerland', productCount: 45, status: 'Active' },
];

export function TrademarkList() {
  const [trademarks] = useState<Trademark[]>(mockTrademarks);

  const columns: Column<Trademark>[] = [
    { header: 'Trademark', accessor: 'name', render: (tm) => <span className="font-medium text-purple-900">{tm.name}</span> },
    { header: 'Country', accessor: 'country' },
    { header: 'Products', accessor: 'productCount' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (tm) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tm.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {tm.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="flex gap-2">
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Trademarks</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage brands and trademarks</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add Trademark
        </button>
      </div>

      <DataTable columns={columns} data={trademarks} keyField="id" pageSize={10} />
    </div>
  );
}
