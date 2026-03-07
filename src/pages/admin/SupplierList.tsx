import { Edit, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { supplierService, SupplierResponse } from '../../services/supplierService';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const data = await supplierService.getSuppliers({ size: 100 });
        const mapped: Supplier[] = data.content.map((s: SupplierResponse) => ({
          id: String(s.supplierId),
          name: s.supplierName,
          contactPerson: s.contactPerson,
          phone: s.phoneNumber,
          email: s.email,
          address: s.address,
        }));
        setSuppliers(mapped);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const columns: Column<Supplier>[] = [
    { header: 'Supplier Name', accessor: 'name', render: (s) => <div className="font-medium text-purple-900">{s.name}<br/><span className="text-xs text-gray-500 font-normal">{s.contactPerson}</span></div> },
    { header: 'Contact', accessor: 'phone', render: (s) => <div className="text-sm"><div className="flex items-center gap-1"><Phone className="h-3 w-3"/> {s.phone}</div><div className="flex items-center gap-1 text-gray-500"><Mail className="h-3 w-3"/> {s.email}</div></div> },
    { header: 'Address', accessor: 'address' },
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
