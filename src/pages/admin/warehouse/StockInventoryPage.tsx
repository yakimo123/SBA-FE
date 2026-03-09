import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    } catch (error) {
      console.error('Failed to fetch branches:', error);
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
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, branchFilter, page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchInventory]);

  const stats = useMemo(() => {
    const totalItems = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const lowStockCount = inventory.filter(
      (item) => (item.quantity || 0) < 10
    ).length;
    return { totalItems, lowStockCount };
  }, [inventory]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Fira_Sans'] pb-20 selection:bg-[#59168B]/10">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-['Fira_Sans']">
            Stock Inventory
          </h1>
          <p className="text-base text-slate-500 font-medium">
            Monitor and manage your warehouse stock levels.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Products
              </CardTitle>
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black text-slate-900">
                {totalElements}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold italic uppercase tracking-tighter">
                Across all filtered branches
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Low Stock Alerts
              </CardTitle>
              <div className="h-8 w-8 bg-red-50 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black text-red-600">
                {stats.lowStockCount}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold italic uppercase tracking-tighter">
                Action required
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Quantities
              </CardTitle>
              <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                <ArrowUpRight className="h-5 w-5 text-[#59168B]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-black text-[#59168B]">
                {stats.totalItems}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold italic uppercase tracking-tighter">
                Physical units
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-slate-200 shadow-md overflow-visible rounded-xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Product name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="pl-10 h-10 text-sm border-slate-200 focus:ring-[#59168B] rounded-lg bg-slate-50/20"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={branchFilter}
                  onValueChange={(v) => {
                    setBranchFilter(v);
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[220px] h-10 text-sm border-slate-200 rounded-lg focus:ring-[#59168B] font-medium">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all" className="text-sm">
                      All Branches
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
                <Button
                  variant="outline"
                  className="h-10 px-4 gap-2 border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-white border-slate-200 shadow-xl overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] text-slate-400">
                    Product
                  </th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] text-slate-400">
                    Brand & Category
                  </th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] text-slate-400">
                    Supplier
                  </th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] text-slate-400 text-right">
                    Stock
                  </th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[11px] text-slate-400 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-100 rounded w-1/4" />
                            <div className="h-3 bg-slate-50 rounded w-1/6" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-slate-200" />
                        <p className="text-slate-400 font-bold text-lg">
                          No inventory items found.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inventory.map((item) => (
                    <tr
                      key={item.productId}
                      className="hover:bg-slate-50/30 transition-all cursor-default group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 group-hover:text-[#59168B] transition-colors">
                          {item.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-semibold">
                          ID: {item.productId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold space-y-1">
                        <div className="text-sm font-bold text-slate-700">
                          {item.brandName || 'N/A'}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-black">
                          {item.categoryName || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-500 italic">
                          {item.supplierName || 'System'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-black text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {item.quantity < 10 ? (
                            <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-black border border-red-100 shadow-sm">
                              <ArrowDownLeft className="h-3.5 w-3.5" />
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 font-['Fira_Sans'] italic shadow-sm">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              OPTIMAL
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && inventory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-slate-200" />
                        <p className="text-slate-500 font-bold text-sm">
                          No items found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing {inventory.length} of {totalElements} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="h-8 w-8 p-0 border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-3 text-xs font-bold text-slate-700">
                Page {page + 1} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8 w-8 p-0 border-slate-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
