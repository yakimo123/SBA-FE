import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Attribute {
  id: string;
  name: string;
  type: string;
  values: string; // Comma separated for display
}

const mockAttributes: Attribute[] = [
  { id: '1', name: 'Color', type: 'Color Swatch', values: 'Red, Blue, Green, Black, White' },
  { id: '2', name: 'Size', type: 'Select', values: 'S, M, L, XL, XXL' },
  { id: '3', name: 'Material', type: 'Text', values: 'Cotton, Polyester, Leather' },
  { id: '4', name: 'Storage', type: 'Select', values: '64GB, 128GB, 256GB, 512GB, 1TB' },
];

export function AttributeList() {
  const [attributes] = useState<Attribute[]>(mockAttributes);

  const columns: Column<Attribute>[] = [
    { header: 'Attribute Name', accessor: 'name', render: (attr) => <span className="font-medium text-purple-900">{attr.name}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Values', accessor: 'values', render: (attr) => <span className="text-gray-600">{attr.values}</span> },
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Product Attributes</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage global product attributes</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add Attribute
        </button>
      </div>

      <DataTable columns={columns} data={attributes} keyField="id" pageSize={10} />
    </div>
  );
}
