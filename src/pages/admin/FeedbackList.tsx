import { Check, MessageSquare, ShieldAlert,Star, X } from 'lucide-react';
import { useState } from 'react';

import { Column, DataTable } from '../../components/admin/DataTable';

interface Feedback {
  id: string;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockFeedback: Feedback[] = [
  { id: '1', customer: 'Nguyen Van A', product: 'iPhone 15 Pro Max', rating: 5, comment: 'Excellent product, fast delivery!', date: '2024-01-21', status: 'Approved' },
  { id: '2', customer: 'Tran Thi B', product: 'MacBook Air M2', rating: 4, comment: 'Good quality but packaging was damaged.', date: '2024-01-20', status: 'Pending' },
  { id: '3', customer: 'Le Van C', product: 'AirPods Pro 2', rating: 1, comment: 'Fake product! Do not buy!', date: '2024-01-19', status: 'Rejected' },
];

export function FeedbackList() {
  const [feedbacks] = useState<Feedback[]>(mockFeedback);

  const columns: Column<Feedback>[] = [
    { header: 'Product', accessor: 'product', render: (f) => <span className="font-medium text-purple-900">{f.product}</span> },
    { header: 'Customer', accessor: 'customer' },
    { 
      header: 'Rating', 
      accessor: 'rating',
      render: (f) => (
        <div className="flex items-center gap-1 text-orange-500">
          <span>{f.rating}</span>
          <Star className="h-4 w-4 fill-current" />
        </div>
      )
    },
    { header: 'Comment', accessor: 'comment', render: (f) => <p className="max-w-xs truncate text-gray-600" title={f.comment}>{f.comment}</p> },
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (f) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold 
          ${f.status === 'Approved' ? 'bg-green-100 text-green-800' : 
            f.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {f.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (f) => (
        <div className="flex gap-2">
          {f.status === 'Pending' && (
            <>
              <button className="rounded-lg p-1.5 text-green-600 hover:bg-green-50" title="Approve"><Check className="h-4 w-4" /></button>
              <button className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Reject"><X className="h-4 w-4" /></button>
            </>
          )}
          <button className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="Reply"><MessageSquare className="h-4 w-4" /></button>
          <button className="rounded-lg p-1.5 text-orange-600 hover:bg-orange-50" title="Flag"><ShieldAlert className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Feedback & Reviews</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">Moderate product reviews and customer feedback</p>
        </div>
      </div>

      <DataTable columns={columns} data={feedbacks} keyField="id" pageSize={10} />
    </div>
  );
}
