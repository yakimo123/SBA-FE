import { Edit, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';
import { BranchResponse,branchService } from '../../services/branchService';

interface StoreBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
}

export function StoreBranchList() {
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const data = await branchService.getBranches({ size: 100 });
        const mapped: StoreBranch[] = data.content.map((b: BranchResponse) => ({
          id: String(b.branchId),
          name: b.branchName,
          address: b.location,
          phone: b.contactNumber,
          manager: b.managerName,
        }));
        setStores(mapped);
      } catch (err) {
        console.error('Error fetching branches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const columns: Column<StoreBranch>[] = [
    { header: 'Branch Name', accessor: 'name', render: (s) => <span className="font-medium text-purple-900">{s.name}</span> },
    { header: 'Address', accessor: 'address', render: (s) => <div className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3 text-gray-400"/> {s.address}</div> },
    { header: 'Phone', accessor: 'phone', render: (s) => <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3 text-gray-400"/> {s.phone}</div> },
    { header: 'Manager', accessor: 'manager' },
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
