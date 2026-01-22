import { Edit, Plus, ShieldCheck,Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Guarantee {
  id: string;
  name: string;
  duration: string;
  type: 'Standard' | 'Extended' | 'Premium';
  coverage: string;
  status: 'Active' | 'Inactive';
}

const mockGuarantees: Guarantee[] = [
  { id: '1', name: 'Standard 12 Months', duration: '12 Months', type: 'Standard', coverage: 'Manufacturer defects', status: 'Active' },
  { id: '2', name: 'AppleCare+', duration: '24 Months', type: 'Premium', coverage: 'Accidental damage coverage', status: 'Active' },
  { id: '3', name: 'Extended 2 Year', duration: '24 Months', type: 'Extended', coverage: 'Parts and labor', status: 'Active' },
];

export function GuaranteeList() {
  const [guarantees] = useState<Guarantee[]>(mockGuarantees);

  const columns: Column<Guarantee>[] = [
    { header: 'Policy Name', accessor: 'name', render: (g) => <div className="font-medium text-purple-900 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-purple-500"/> {g.name}</div> },
    { header: 'Duration', accessor: 'duration' },
    { header: 'Type', accessor: 'type' },
    { header: 'Coverage', accessor: 'coverage', render: (g) => <span className="text-gray-600 text-sm max-w-xs truncate block">{g.coverage}</span> },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (g) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${g.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {g.status}
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
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Guarantee Policies</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Manage warranty and guarantee terms</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Add Policy
        </button>
      </div>

      <DataTable columns={columns} data={guarantees} keyField="id" pageSize={10} />
    </div>
  );
}
