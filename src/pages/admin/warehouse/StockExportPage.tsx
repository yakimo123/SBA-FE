import {
  ArrowDownLeft,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  FileText,
  Loader2,
  MinusCircle,
  Package,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface ExportLine {
  id: string;
  productId: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  availableStock: number;
}

export function StockExportPage() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [branchId, setBranchId] = useState<string>('');
  const [exportDate, setExportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [exportLines, setExportLines] = useState<ExportLine[]>([
    {
      id: crypto.randomUUID(),
      productId: null,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      availableStock: 0,
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
    setExportLines([
      ...exportLines,
      {
        id: crypto.randomUUID(),
        productId: null,
        productName: '',
        quantity: 1,
        unitPrice: 0,
        availableStock: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (exportLines.length > 1)
      setExportLines(exportLines.filter((l) => l.id !== id));
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
    field: keyof ExportLine,
    value: string | number | null
  ) => {
    setExportLines(
      exportLines.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const selectProduct = async (lineId: string, product: Product) => {
    if (!branchId) {
      alert('Vui lòng chọn chi nhánh trước');
      return;
    }
    try {
      const stockInfo = await warehouseService.checkStock(
        Number(branchId),
        product.productId
      );
      setExportLines(
        exportLines.map((l) =>
          l.id === lineId
            ? {
                ...l,
                productId: product.productId,
                productName: product.productName,
                unitPrice: product.price || 0,
                availableStock: stockInfo.availableQuantity,
              }
            : l
        )
      );
    } catch {
      setExportLines(
        exportLines.map((l) =>
          l.id === lineId
            ? {
                ...l,
                productId: product.productId,
                productName: product.productName,
                unitPrice: product.price || 0,
                availableStock: 0,
              }
            : l
        )
      );
    }
    setSearchResults((p) => ({ ...p, [lineId]: [] }));
    setActiveSearch(null);
  };

  const subtotal = useMemo(
    () => exportLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [exportLines]
  );

  const totalItems = exportLines.filter((l) => l.productId !== null).length;
  const hasStockError = exportLines.some(
    (l) => l.productId && l.quantity > l.availableStock
  );

  const handleSubmit = async () => {
    if (!branchId) {
      alert('Vui lòng chọn chi nhánh');
      return;
    }
    const valid = exportLines.filter(
      (l) => l.productId !== null && l.quantity > 0
    );
    if (!valid.length) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }
    const insufficient = valid.find((l) => l.quantity > l.availableStock);
    if (insufficient) {
      alert(
        `${insufficient.productName}: không đủ tồn kho (còn ${insufficient.availableStock})`
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await warehouseService.exportStock({
        branchId: Number(branchId),
        note: notes,
        createdDate: new Date(exportDate).toISOString(),
        items: valid.map((l) => ({
          productId: l.productId!,
          quantity: l.quantity,
          price: l.unitPrice,
        })),
      });
      setShowSuccess(true);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Xuất kho thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Xuất kho thành công
          </h2>
          <p className="text-sm text-slate-500 mb-7">
            Đã xuất {totalItems} sản phẩm khỏi hệ thống.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/admin/inventory')}
              className="w-full h-10 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Xem tồn kho
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-10 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Xuất kho mới
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
              Xuất kho mới
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/admin/warehouse/inventory')}
              className="h-9 px-4 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || hasStockError}
              className="h-9 px-5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4" /> Hoàn tất xuất kho
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
                  Thông tin xuất kho
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Chi nhánh xuất hàng *
                  </Label>
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger className="h-9 text-sm border-slate-200 rounded-lg">
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
                  {!branchId && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                      <span className="w-3.5 h-3.5 inline-flex items-center justify-center">
                        !
                      </span>
                      Chọn chi nhánh để kiểm tra tồn kho
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Ngày xuất
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="date"
                      value={exportDate}
                      onChange={(e) => setExportDate(e.target.value)}
                      className="pl-9 h-9 text-sm border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Lý do xuất kho
                  </Label>
                  <Textarea
                    placeholder="Vd: Bán hàng, Điều chuyển nội bộ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="text-sm border-slate-200 rounded-lg min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
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
                    {exportLines
                      .filter((l) => l.productId)
                      .reduce((s, l) => s + l.quantity, 0)}{' '}
                    đơn vị
                  </span>
                </div>
                {hasStockError && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                    Một số sản phẩm vượt quá tồn kho
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Tổng giá trị
                  </span>
                  <span className="text-sm font-semibold text-orange-600">
                    {subtotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-visible">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Sản phẩm xuất kho
              </h3>
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 px-3 h-7 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm dòng
              </button>
            </div>

            <div className="overflow-visible">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-[40%]">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-[14%]">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-[16%]">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-[18%]">
                      Đơn giá (đ)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider w-[12%]">
                      Thành tiền
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exportLines.map((line) => {
                    const isOverStock =
                      line.productId !== null &&
                      line.quantity > line.availableStock;
                    const isLowStock =
                      line.productId !== null &&
                      line.availableStock > 0 &&
                      line.availableStock < 5;

                    return (
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
                                className="pl-9 h-9 text-sm border-slate-200 rounded-lg"
                              />
                            </div>

                            {line.productId && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  <CheckCircle className="w-3 h-3" />
                                  ID: {line.productId}
                                </span>
                              </div>
                            )}

                            {/* Dropdown */}
                            {activeSearch === line.id &&
                              searchResults[line.id]?.length > 0 && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
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
                                        className="w-full px-3 py-2.5 text-left hover:bg-orange-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
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
                                          {product.price?.toLocaleString(
                                            'vi-VN'
                                          )}
                                          đ
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {searchLoading[line.id] &&
                              activeSearch === line.id && (
                                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg p-4 text-center shadow-lg">
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" />
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Available stock */}
                        <td className="px-4 py-3 text-center">
                          {line.productId ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
                                line.availableStock === 0
                                  ? 'bg-red-50 text-red-600'
                                  : isLowStock
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {line.availableStock === 0 && (
                                <ArrowDownLeft className="w-3 h-3" />
                              )}
                              {line.availableStock} sp
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
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
                              className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
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
                              className={`w-12 h-7 text-center text-sm rounded-md tabular-nums px-1 ${
                                isOverStock
                                  ? 'border-red-300 bg-red-50 text-red-600 focus:ring-red-300'
                                  : 'border-slate-200'
                              }`}
                            />
                            <button
                              onClick={() =>
                                updateLine(
                                  line.id,
                                  'quantity',
                                  line.quantity + 1
                                )
                              }
                              className="w-7 h-7 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                          {isOverStock && (
                            <p className="text-xs text-red-500 text-center mt-1">
                              Vượt tồn kho
                            </p>
                          )}
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
                            className="h-9 text-sm text-right border-slate-200 rounded-lg tabular-nums"
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
                            disabled={exportLines.length === 1}
                            className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
              <div className="text-sm text-slate-500">
                {totalItems} sản phẩm ·{' '}
                {exportLines
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
