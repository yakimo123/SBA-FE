import { Edit, MapPin, Phone,Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface StoreBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'Open' | 'Closed' | 'Renovating';
}

const mockStores: StoreBranch[] = [
  { id: '1', name: 'Main Store - D1', address: '123 Le Loi, District 1, HCMC', phone: '028 1234 5678', manager: 'Tran Van Quan', status: 'Open' },
  { id: '2', name: 'Branch 2 - D7', address: '456 Nguyen Van Linh, District 7, HCMC', phone: '028 8765 4321', manager: 'Le Thi Ly', status: 'Open' },
  { id: '3', name: 'Branch 3 - Hanoi', address: '789 Ba Trieu, Hai Ba Trung, Hanoi', phone: '024 1234 5678', manager: 'Pham Van Minh', status: 'Renovating' },
];

export function StoreBranchList() {
  const [stores] = useState<StoreBranch[]>(mockStores);

  const columns: Column<StoreBranch>[] = [
    { header: 'Branch Name', accessor: 'name', render: (s) => <span className="font-medium text-purple-900">{s.name}</span> },
    { header: 'Address', accessor: 'address', render: (s) => <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-gray-400"/> {s.address}</div> },
    { header: 'Phone', accessor: 'phone', render: (s) => <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-gray-400"/> {s.phone}</div> },
    { header: 'Manager', accessor: 'manager' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (s) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold 
          ${s.status === 'Open' ? 'bg-green-100 text-green-800' : 
            s.status === 'Closed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Store Branches</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage physical store locations</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add New Branch
        </button>
      </div>

      <DataTable columns={columns} data={stores} keyField="id" pageSize={10} />
    </div>
  );
}
