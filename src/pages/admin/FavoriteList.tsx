import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Favorite {
  id: string;
  customerName: string;
  productName: string;
  dateAdded: string;
}

const mockFavorites: Favorite[] = [
  { id: '1', customerName: 'Nguyen Van A', productName: 'iPhone 15 Pro Max', dateAdded: '2024-01-20' },
  { id: '2', customerName: 'Tran Thi B', productName: 'MacBook Air M2', dateAdded: '2024-01-18' },
  { id: '3', customerName: 'Nguyen Van A', productName: 'AirPods Pro 2', dateAdded: '2024-01-15' },
];

export function FavoriteList() {
  const [favorites] = useState<Favorite[]>(mockFavorites);

  const columns: Column<Favorite>[] = [
    { header: 'Product', accessor: 'productName', render: (f) => <span className="font-medium text-purple-900">{f.productName}</span> },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Date Added', accessor: 'dateAdded' },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="flex gap-2">
          <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Remove"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Favorites</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">View what products customers are saving</p>
        </div>
      </div>

      <DataTable columns={columns} data={favorites} keyField="id" pageSize={10} />
    </div>
  );
}
