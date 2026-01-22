import { Eye, Lock, Mail, Unlock } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'Nguyen Van A', email: 'vana@example.com', phone: '0901234567', orders: 15, totalSpent: 25000000, status: 'Active', joinDate: '2023-01-15' },
  { id: '2', name: 'Tran Thi B', email: 'thib@example.com', phone: '0909876543', orders: 3, totalSpent: 1200000, status: 'Active', joinDate: '2023-06-20' },
  { id: '3', name: 'Le Van C', email: 'vanc@example.com', phone: '0912345678', orders: 0, totalSpent: 0, status: 'Blocked', joinDate: '2023-12-01' },
];

export function CustomerList() {
  const [customers] = useState<Customer[]>(mockCustomers);

  const columns: Column<Customer>[] = [
    { header: 'Name', accessor: 'name', render: (c) => <span className="font-medium text-purple-900">{c.name}</span> },
    { header: 'Contact', accessor: 'email', render: (c) => <div className="text-sm"><div>{c.email}</div><div className="text-gray-500">{c.phone}</div></div> },
    { header: 'Orders', accessor: 'orders' },
    { header: 'Total Spent', accessor: 'totalSpent', render: (c) => <span className="font-semibold text-gray-900">₫{c.totalSpent.toLocaleString()}</span> },
    { header: 'Join Date', accessor: 'joinDate' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (c) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {c.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (c) => (
        <div className="flex gap-2">
          <button className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View Profile"><Eye className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-50" title="Send Email"><Mail className="h-4 w-4" /></button>
          {c.status === 'Active' ? (
            <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Block User"><Lock className="h-4 w-4" /></button>
          ) : (
            <button className="rounded-lg p-1.5 text-green-600 hover:bg-green-50" title="Unblock User"><Unlock className="h-4 w-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Customers</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage customer accounts</p>
        </div>
      </div>

      <DataTable columns={columns} data={customers} keyField="id" pageSize={10} />
    </div>
  );
}
