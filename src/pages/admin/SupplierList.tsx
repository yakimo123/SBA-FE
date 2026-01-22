import { Edit, Mail,Phone, Plus, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
}

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Tech Distribution Inc.', contactPerson: 'John Doe', phone: '+1 234 567 890', email: 'contact@techdist.com', status: 'Active' },
  { id: '2', name: 'Global Electronics Ltd.', contactPerson: 'Jane Smith', phone: '+44 20 7123 4567', email: 'sales@globalelec.com', status: 'Active' },
  { id: '3', name: 'Asia Components Co.', contactPerson: 'Li Wei', phone: '+86 10 1234 5678', email: 'info@asiacomp.cn', status: 'Active' },
];

export function SupplierList() {
  const [suppliers] = useState<Supplier[]>(mockSuppliers);

  const columns: Column<Supplier>[] = [
    { header: 'Supplier Name', accessor: 'name', render: (s) => <div className="font-medium text-purple-900">{s.name}<br/><span className="text-xs text-gray-500 font-normal">{s.contactPerson}</span></div> },
    { header: 'Contact', accessor: 'phone', render: (s) => <div className="text-sm"><div className="flex items-center gap-1"><Phone className="h-3 w-3"/> {s.phone}</div><div className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3"/> {s.email}</div></div> },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (s) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${s.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {s.status}
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Suppliers</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage detailed supplier information</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add Supplier
        </button>
      </div>

      <DataTable columns={columns} data={suppliers} keyField="id" pageSize={10} />
    </div>
  );
}
