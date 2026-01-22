import { Building, Eye,Users } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Company {
  id: string;
  name: string;
  taxId: string;
  contactPerson: string;
  employeeCount: number;
  bulkOrders: number;
  status: 'Verified' | 'Pending';
}

const mockCompanies: Company[] = [
  { id: '1', name: 'Corporate Solutions Ltd', taxId: '0312345678', contactPerson: 'John Doe', employeeCount: 150, bulkOrders: 5, status: 'Verified' },
  { id: '2', name: 'Tech Start Inc', taxId: '0398765432', contactPerson: 'Jane Smith', employeeCount: 45, bulkOrders: 2, status: 'Verified' },
  { id: '3', name: 'Edu Partners', taxId: '0356789012', contactPerson: 'Li Wei', employeeCount: 200, bulkOrders: 1, status: 'Pending' },
];

export function CompanyList() {
  const [companies] = useState<Company[]>(mockCompanies);

  const columns: Column<Company>[] = [
    { header: 'Company Name', accessor: 'name', render: (c) => <div className="font-medium text-purple-900">{c.name}<br/><span className="text-xs text-gray-500 font-normal">Tax ID: {c.taxId}</span></div> },
    { header: 'Contact', accessor: 'contactPerson' },
    { header: 'Employees', accessor: 'employeeCount', render: (c) => <div className="flex items-center gap-1"><Users className="h-3 w-3"/> {c.employeeCount}</div> },
    { header: 'Bulk Orders', accessor: 'bulkOrders' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (c) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${c.status === 'Verified' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {c.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: () => (
        <div className="flex gap-2">
          <button className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="View Details"><Eye className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Companies</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">B2B Customer Management</p>
        </div>
      </div>

      <DataTable columns={columns} data={companies} keyField="id" pageSize={10} />
    </div>
  );
}
