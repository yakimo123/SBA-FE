import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  FileText,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BranchResponse, branchService } from '@/services/branchService';
import { productService } from '@/services/productService';
import { warehouseService } from '@/services/warehouseService';
import { Product } from '@/types/product';

interface ImportLine {
  id: string;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function StockImportPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [branchId, setBranchId] = useState<string>('');
  const [importDate, setImportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [importLines, setImportLines] = useState<ImportLine[]>([
    {
      id: crypto.randomUUID(),
      productId: null,
      productName: '',
      quantity: 1,
      unitPrice: 0,
    },
  ]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    [lineId: string]: Product[];
  }>({});
  const [searchLoading, setSearchLoading] = useState<{
    [lineId: string]: boolean;
  }>({});
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const addLine = () => {
    setImportLines([
      ...importLines,
      {
        id: crypto.randomUUID(),
        productId: null,
        productName: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (importLines.length > 1)
      setImportLines(importLines.filter((l) => l.id !== id));
  };

  const searchProducts = async (lineId: string, q: string) => {
    if (q.length < 2) {
      setSearchResults((p) => ({ ...p, [lineId]: [] }));
      return;
    }
    setSearchLoading((p) => ({ ...p, [lineId]: true }));
    try {
      const data = await productService.searchProducts(q);
      setSearchResults((p) => ({ ...p, [lineId]: data.content }));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading((p) => ({ ...p, [lineId]: false }));
    }
  };

  const updateLine = (
    id: string,
    field: keyof ImportLine,
    value: string | number | null
  ) => {
    setImportLines(
      importLines.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const selectProduct = (lineId: string, product: Product) => {
    setImportLines(
      importLines.map((l) =>
        l.id === lineId
          ? {
              ...l,
              productId: product.productId,
              productName: product.productName,
              unitPrice: product.price || 0,
            }
          : l
      )
    );
    setSearchResults((p) => ({ ...p, [lineId]: [] }));
    setActiveSearch(null);
  };

  const subtotal = useMemo(
    () => importLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [importLines]
  );

  const totalItems = importLines.filter((l) => l.productId !== null).length;

  const handleSubmit = async () => {
    if (!branchId) {
      alert('Vui lòng chọn chi nhánh');
      return;
    }
    const valid = importLines.filter(
      (l) => l.productId !== null && l.quantity > 0
    );
    if (!valid.length) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      await warehouseService.importStock({
        branchId: Number(branchId),
        note: notes,
        createdDate: new Date(importDate).toISOString(),
        items: valid.map((l) => ({
          productId: l.productId!,
          quantity: l.quantity,
          price: l.unitPrice,
        })),
      });
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Nhập kho thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Nhập kho thành công
          </h2>
          <p className="text-sm text-slate-500 mb-7">
            Đã cập nhật {totalItems} sản phẩm vào hệ thống.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/admin/inventory')}
              className="w-full h-10 bg-slate-900 text-white text-sm font-medium rounded-[10px] hover:bg-slate-800 transition-colors"
            >
              Xem tồn kho
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-10 border border-slate-200 text-slate-600 text-sm font-medium rounded-[10px] hover:bg-slate-50 transition-colors"
            >
              Nhập kho mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/warehouse/inventory')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kho hàng
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-sm font-medium text-slate-800">
              Nhập kho mới
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/warehouse/inventory')}
              className="h-9 px-4 text-sm font-medium text-slate-600 border border-slate-200 rounded-[10px] hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-9 px-5 text-sm font-medium text-white bg-[#ee4d2d] rounded-[10px] hover:bg-[#ee4d2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Hoàn tất nhập kho
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left panel */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Thông tin chung
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Chi nhánh nhập hàng *
                  </Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger className="h-9 text-sm border-slate-200 rounded-[10px]">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Ngày nhập
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="date"
                      value={importDate}
                      onChange={(e) => setImportDate(e.target.value)}
                      className="pl-9 h-9 text-sm border-slate-200 rounded-[10px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Ghi chú
                  </Label>
                  <Textarea
                    placeholder="Ghi chú về lô hàng này..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-sm border-slate-200 rounded-[10px] min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Tóm tắt
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Số sản phẩm</span>
                  <span className="font-medium text-slate-800">
                    {totalItems} sp
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tổng đơn vị</span>
                  <span className="font-medium text-slate-800">
                    {importLines
                      .filter((l) => l.productId)
                      .reduce((s, l) => s + l.quantity, 0)}{' '}
                    đơn vị
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Tổng giá trị
                  </span>
                  <span className="text-sm font-semibold text-[#ee4d2d]">
                    {subtotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — product table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-visible">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Sản phẩm nhập kho
              </h3>
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 text-xs font-medium text-[#ee4d2d] hover:text-[#ee4d2d] px-3 h-7 border border-blue-200 rounded-[10px] hover:bg-[#fff1f0] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng
              </button>
            </div>

            <div className="overflow-visible">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-[42%]">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-[16%]">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-[22%]">
                      Đơn giá (đ)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-[16%]">
                      Thành tiền
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importLines.map((line, idx) => (
                    <tr
                      key={line.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Product search */}
                      <td className="px-5 py-3">
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                              placeholder="Tìm sản phẩm..."
                              value={line.productName}
                              onChange={(e) => {
                                updateLine(
                                  line.id,
                                  'productName',
                                  e.target.value
                                );
                                searchProducts(line.id, e.target.value);
                                setActiveSearch(line.id);
                              }}
                              onFocus={() => setActiveSearch(line.id)}
                              className="pl-9 h-9 text-sm border-slate-200 rounded-[10px]"
                            />
                          </div>

                          {line.productId && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[10px]">
                                <CheckCircle className="w-3 h-3" />
                                ID: {line.productId}
                              </span>
                            </div>
                          )}

                          {/* Dropdown */}
                          {activeSearch === line.id &&
                            searchResults[line.id]?.length > 0 && (
                              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-[10px] shadow-lg overflow-hidden">
                                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-400 font-medium">
                                  {searchResults[line.id].length} kết quả
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                  {searchResults[line.id].map((product) => (
                                    <button
                                      key={product.productId}
                                      onClick={() =>
                                        selectProduct(line.id, product)
                                      }
                                      className="w-full px-3 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-slate-100 rounded-[10px] flex items-center justify-center shrink-0">
                                          <Package className="w-3.5 h-3.5 text-slate-400" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-slate-800">
                                            {product.productName}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            ID: {product.productId}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-sm font-semibold text-slate-700 tabular-nums">
                                        {product.price?.toLocaleString('vi-VN')}
                                        đ
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                          {searchLoading[line.id] &&
                            activeSearch === line.id && (
                              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-[10px] p-4 text-center shadow-lg">
                                <Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" />
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            onClick={() =>
                              updateLine(
                                line.id,
                                'quantity',
                                Math.max(1, line.quantity - 1)
                              )
                            }
                            className="w-7 h-7 rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                          >
                            −
                          </button>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                'quantity',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-12 h-7 text-center text-sm border-slate-200 rounded-[10px] tabular-nums px-1"
                          />
                          <button
                            onClick={() =>
                              updateLine(line.id, 'quantity', line.quantity + 1)
                            }
                            className="w-7 h-7 rounded-[10px] border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Unit price */}
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={line.unitPrice || ''}
                          onChange={(e) =>
                            updateLine(
                              line.id,
                              'unitPrice',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="h-9 text-sm text-right border-slate-200 rounded-[10px] tabular-nums"
                        />
                      </td>

                      {/* Line total */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-800 tabular-nums">
                          {(line.quantity * line.unitPrice).toLocaleString(
                            'vi-VN'
                          )}
                          đ
                        </span>
                      </td>

                      {/* Remove */}
                      <td className="pr-3 py-3">
                        <button
                          onClick={() => removeLine(line.id)}
                          disabled={importLines.length === 1}
                          className="w-8 h-8 rounded-[10px] text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer total */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
              <div className="text-sm text-slate-500">
                {totalItems} sản phẩm ·{' '}
                {importLines
                  .filter((l) => l.productId)
                  .reduce((s, l) => s + l.quantity, 0)}{' '}
                đơn vị
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Tổng giá trị</span>
                <span className="text-lg font-semibold text-slate-900 tabular-nums">
                  {subtotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
