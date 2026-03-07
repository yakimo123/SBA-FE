import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Column, DataTable } from '../../components/admin/DataTable';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import { Product, Category, Brand, ProductStatus } from '../../types/product';

const PAGE_SIZE = 10;

export function ProductList() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    status: '',
  });

  // Load filter options
  const loadFilters = useCallback(async () => {
    try {
      const [catData, brandData] = await Promise.all([
        categoryService.getCategories(0, 100),
        brandService.getBrands(0, 100),
      ]);
      setCategories(catData.content ?? []);
      setBrands(brandData.content ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts({
        page,
        size: PAGE_SIZE,
        keyword: filters.search || undefined,
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        brandId: filters.brandId ? Number(filters.brandId) : undefined,
      });
      setProducts(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters.search, filters.categoryId, filters.brandId]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete product "${product.productName}"?`)) return;
    try {
      await productService.deleteProduct(product.productId);
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const statusLabel = (status: ProductStatus) => {
    const map: Record<ProductStatus, { label: string; class: string }> = {
      AVAILABLE: { label: 'Available', class: 'bg-green-100 text-green-800' },
      UNAVAILABLE: { label: 'Inactive', class: 'bg-gray-100 text-gray-800' },
      OUT_OF_STOCK: { label: 'Out of Stock', class: 'bg-red-100 text-red-800' },
    };
    return map[status] ?? { label: status, class: 'bg-gray-100 text-gray-600' };
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      accessor: 'productName',
      render: (product) => (
        <div className="font-medium text-purple-900">{product.productName}</div>
      ),
    },
    {
      header: 'Category',
      accessor: 'categoryName',
      render: (product) => <span>{product.categoryName ?? '—'}</span>,
    },
    {
      header: 'Brand',
      accessor: 'brandName',
      render: (product) => <span>{product.brandName ?? '—'}</span>,
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (product) => (
        <span className="font-semibold text-gray-900">
          ₫{product.price.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Stock',
      accessor: 'quantity',
      render: (product) => (
        <span
          className={`font-semibold ${product.quantity === 0
              ? 'text-red-600'
              : product.quantity < 20
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
        >
          {product.quantity}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (product) => {
        const s = statusLabel(product.status);
        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${s.class}`}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'productId',
      sortable: false,
      render: (product) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/products/${product.productId}/edit`)}
            className="rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
            title="View/Edit"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/products/${product.productId}/edit`)}
            className="rounded-lg p-1.5 text-purple-600 transition-colors hover:bg-purple-50"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(product)}
            className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">Products</h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Manage your product inventory
            {totalElements > 0 && (
              <span className="ml-2 text-sm text-gray-400">({totalElements} total)</span>
            )}
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
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => {
                setPage(0);
                setFilters({ ...filters, search: e.target.value });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            />
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => {
                setPage(0);
                setFilters({ ...filters, categoryId: e.target.value });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Brand
            </label>
            <select
              value={filters.brandId}
              onChange={(e) => {
                setPage(0);
                setFilters({ ...filters, brandId: e.target.value });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-['Fira_Sans'] text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => {
                setPage(0);
                setFilters({ ...filters, status: e.target.value });
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-['Fira_Sans'] text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          keyField="productId"
          pageSize={PAGE_SIZE}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-['Fira_Sans'] text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
