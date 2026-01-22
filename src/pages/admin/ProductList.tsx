import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Column, DataTable } from '../../components/admin/DataTable';

// Mock data
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  trademark: string;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive' | 'Out of Stock';
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    sku: 'AAPL-IP15PM-256',
    category: 'Smartphones',
    trademark: 'Apple',
    price: 29990000,
    stock: 45,
    status: 'Active',
  },
  {
    id: '2',
    name: 'AirPods Pro 2nd Gen',
    sku: 'AAPL-APP2-WHT',
    category: 'Audio',
    trademark: 'Apple',
    price: 6490000,
    stock: 120,
    status: 'Active',
  },
  {
    id: '3',
    name: 'MacBook Air M2',
    sku: 'AAPL-MBA-M2-256',
    category: 'Laptops',
    trademark: 'Apple',
    price: 27990000,
    stock: 0,
    status: 'Out of Stock',
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SAMS-S24U-512',
    category: 'Smartphones',
    trademark: 'Samsung',
    price: 33990000,
    stock: 32,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5',
    sku: 'SONY-WH1000XM5-BLK',
    category: 'Audio',
    trademark: 'Sony',
    price: 8990000,
    stock: 15,
    status: 'Active',
  },
];

export function ProductList() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    trademark: '',
    status: '',
  });

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (product) => (
        <div className="font-medium text-purple-900">{product.name}</div>
      ),
    },
    {
      header: 'SKU',
      accessor: 'sku',
      render: (product) => (
        <span className="font-['Fira_Code'] text-xs text-gray-600">
          {product.sku}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Trademark',
      accessor: 'trademark',
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (product) => (
        <span className="font-semibold text-gray-900">
          ₫{product.price.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (product) => (
        <span
          className={`font-semibold ${
            product.stock === 0
              ? 'text-red-600'
              : product.stock < 20
                ? 'text-orange-600'
                : 'text-green-600'
          }`}
        >
          {product.stock}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (product) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            product.status === 'Active'
              ? 'bg-green-100 text-green-800'
              : product.status === 'Inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (product) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            className="rounded-lg p-1.5 text-purple-600 transition-colors hover:bg-purple-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filter products
  const filteredProducts = mockProducts.filter((product) => {
    if (
      filters.search &&
      !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !product.sku.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    if (filters.trademark && product.trademark !== filters.trademark) {
      return false;
    }
    if (filters.status && product.status !== filters.status) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            Products
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md transition-all duration-200 hover:bg-orange-600 hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Categories</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Audio">Audio</option>
              <option value="Laptops">Laptops</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Trademark
            </label>
            <select
              value={filters.trademark}
              onChange={(e) =>
                setFilters({ ...filters, trademark: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Trademarks</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Sony">Sony</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-purple-100 px-6 py-3">
          <span className="font-['Fira_Sans'] text-sm font-medium text-purple-900">
            {selectedProducts.length} product(s) selected
          </span>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 font-['Fira_Sans'] text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Delete Selected
          </button>
          <button
            type="button"
            className="rounded-lg bg-purple-600 px-4 py-2 font-['Fira_Sans'] text-sm font-semibold text-white transition-colors hover:bg-purple-700"
          >
            Update Status
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyField="id"
        selectable
        onSelectionChange={setSelectedProducts}
        pageSize={10}
      />
    </div>
  );
}
