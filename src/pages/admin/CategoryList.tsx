import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

const mockCategories: Category[] = [
  { id: '1', name: 'Smartphones', slug: 'smartphones', productCount: 45, status: 'Active' },
  { id: '2', name: 'Laptops', slug: 'laptops', productCount: 32, status: 'Active' },
  { id: '3', name: 'Tablets', slug: 'tablets', productCount: 18, status: 'Active' },
  { id: '4', name: 'Audio', slug: 'audio', productCount: 56, status: 'Active' },
  { id: '5', name: 'Accessories', slug: 'accessories', productCount: 120, status: 'Active' },
];

export function CategoryList() {
  const [categories] = useState<Category[]>(mockCategories);

  const columns: Column<Category>[] = [
    { header: 'Name', accessor: 'name', render: (cat) => <span className="font-medium text-purple-900">{cat.name}</span> },
    { header: 'Slug', accessor: 'slug', render: (cat) => <span className="font-['Fira_Code'] text-xs text-gray-500">{cat.slug}</span> },
    { header: 'Products', accessor: 'productCount' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (cat) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cat.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {cat.status}
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Categories</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage product categories</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      <DataTable columns={columns} data={categories} keyField="id" pageSize={10} />
    </div>
  );
}
