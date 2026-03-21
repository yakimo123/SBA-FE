import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BranchResponse, branchService } from '@/services/branchService';
import {
  WarehouseInventoryItem,
  warehouseService,
} from '@/services/warehouseService';

export function StockInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchBranches = useCallback(async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await warehouseService.getInventory({
        q: searchTerm || undefined,
        branchId: branchFilter === 'all' ? undefined : Number(branchFilter),
        page,
        size: pageSize,
      });
      setInventory(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, branchFilter, page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const t = setTimeout(fetchInventory, 500);
    return () => clearTimeout(t);
  }, [fetchInventory]);

  const stats = useMemo(
    () => ({
      totalItems: inventory.reduce((s, i) => s + (i.quantity || 0), 0),
      lowStockCount: inventory.filter((i) => (i.quantity || 0) < 10).length,
    }),
    [inventory]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tồn kho</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Theo dõi và quản lý mức tồn kho theo chi nhánh.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tổng sản phẩm
              </span>
              <div className="w-8 h-8 bg-[#fff1f0] rounded-[10px] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#ee4d2d]" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-800 tabular-nums">
              {totalElements}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Theo bộ lọc hiện tại
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Cảnh báo tồn thấp
              </span>
              <div className="w-8 h-8 bg-red-50 rounded-[10px] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-[#ee4d2d] tabular-nums">
              {stats.lowStockCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">Dưới 10 đơn vị</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tổng đơn vị
              </span>
              <div className="w-8 h-8 bg-emerald-50 rounded-[10px] flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-800 tabular-nums">
              {stats.totalItems.toLocaleString('vi-VN')}
            </div>
            <div className="text-xs text-slate-400 mt-1">Tất cả chi nhánh</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Tìm tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="pl-9 h-9 text-sm border-slate-200 rounded-[10px]"
              />
            </div>
            <Select
              value={branchFilter}
              onValueChange={(v) => {
                setBranchFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-52 h-9 text-sm border-slate-200 rounded-[10px]">
                <SelectValue placeholder="Tất cả chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">
                  Tất cả chi nhánh
                </SelectItem>
                {branches.map((b) => (
                  <SelectItem
                    key={b.branchId}
                    value={b.branchId.toString()}
                    className="text-sm"
                  >
                    {b.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Thương hiệu / Danh mục
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-[10px] shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 bg-slate-100 rounded w-36" />
                            <div className="h-3 bg-slate-50 rounded w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3.5 bg-slate-100 rounded w-24" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-3.5 bg-slate-100 rounded w-20" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="h-3.5 bg-slate-100 rounded w-10 ml-auto" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-6 bg-slate-100 rounded-full w-20 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">
                        Không tìm thấy sản phẩm nào
                      </p>
                    </td>
                  </tr>
                ) : (
                  inventory.map((item, idx) => {
                    const isLow = (item.quantity || 0) < 10;
                    return (
                      <tr
                        key={`${item.productId}-${idx}`}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-[10px] flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm">
                                {item.productName}
                              </div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">
                                ID: {item.productId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm text-slate-700">
                            {item.brandName || '—'}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {item.categoryName || 'Chung'}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-slate-500">
                            {item.supplierName || 'Hệ thống'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`text-sm font-semibold tabular-nums ${isLow ? 'text-[#ee4d2d]' : 'text-slate-800'}`}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#ee4d2d] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                                <ArrowDownLeft className="w-3 h-3" />
                                Tồn thấp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                Bình thường
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Hiển thị {inventory.length} / {totalElements} kết quả
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-600 px-2 font-medium">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
