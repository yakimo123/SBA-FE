import {
  ArrowDownLeft,
  Calendar,
  CheckCircle,
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      quantity: 0,
      unitPrice: 0,
      availableStock: 0,
    },
  ]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // For product search per line
  const [searchResults, setSearchResults] = useState<{
    [lineId: string]: Product[];
  }>({});
  const [searchLoading, setSearchLoading] = useState<{
    [lineId: string]: boolean;
  }>({});

  const fetchBranches = useCallback(async () => {
    try {
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
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
        quantity: 0,
        unitPrice: 0,
        availableStock: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (exportLines.length > 1) {
      setExportLines(exportLines.filter((line) => line.id !== id));
    }
  };

  const searchProducts = async (lineId: string, q: string) => {
    if (q.length < 2) {
      setSearchResults((prev) => ({ ...prev, [lineId]: [] }));
      return;
    }
    setSearchLoading((prev) => ({ ...prev, [lineId]: true }));
    try {
      const data = await productService.searchProducts(q);
      setSearchResults((prev) => ({ ...prev, [lineId]: data.content }));
    } catch (error) {
      console.error('Product search failed:', error);
    } finally {
      setSearchLoading((prev) => ({ ...prev, [lineId]: false }));
    }
  };

  const updateLine = (
    id: string,
    field: keyof ExportLine,
    value: string | number | null
  ) => {
    setExportLines(
      exportLines.map((line) => {
        if (line.id === id) {
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  const selectProduct = async (lineId: string, product: Product) => {
    if (!branchId) {
      alert('Please select a branch first to check availability');
      return;
    }

    try {
      const stockInfo = await warehouseService.checkStock(
        Number(branchId),
        product.productId
      );
      setExportLines(
        exportLines.map((line) => {
          if (line.id === lineId) {
            return {
              ...line,
              productId: product.productId,
              productName: product.productName,
              unitPrice: product.price || 0,
              availableStock: stockInfo.availableQuantity,
            };
          }
          return line;
        })
      );
    } catch (error: any) {
      console.error('Failed to check stock:', error);
      setExportLines(
        exportLines.map((line) => {
          if (line.id === lineId) {
            return {
              ...line,
              productId: product.productId,
              productName: product.productName,
              unitPrice: product.price || 0,
              availableStock: 0,
            };
          }
          return line;
        })
      );
    }
    setSearchResults((prev) => ({ ...prev, [lineId]: [] }));
  };

  const subtotal = useMemo(() => {
    return exportLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
  }, [exportLines]);

  const handleSubmit = async () => {
    if (!branchId) {
      alert('Please select a branch');
      return;
    }
    const validLines = exportLines.filter(
      (l) => l.productId !== null && l.quantity > 0
    );
    if (validLines.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    // Check for stock insufficiency
    const insufficientLine = validLines.find(
      (l) => l.quantity > l.availableStock
    );
    if (insufficientLine) {
      alert(
        `${insufficientLine.productName} has insufficient stock (Available: ${insufficientLine.availableStock})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await warehouseService.exportStock({
        branchId: Number(branchId),
        note: notes,
        createdDate: new Date(exportDate).toISOString(),
        items: validLines.map((l) => ({
          productId: l.productId!,
          quantity: l.quantity,
          price: l.unitPrice,
        })),
      });
      setShowSuccess(true);
    } catch (error: unknown) {
      console.error('Submit export error:', error);
      const message =
        (error as any).response?.data?.message ||
        'Failed to submit stock export';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden rounded-3xl text-lg">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardContent className="pt-8 pb-10 px-8 text-center bg-white">
            <h2 className="text-4xl font-black text-slate-800 mb-4 font-['Fira_Sans']">
              Export Successful!
            </h2>
            <p className="text-slate-500 font-bold mb-8 text-base">
              The goods have been successfully issued from the warehouse.
            </p>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => navigate('/admin/inventory')}
                className="w-full bg-[#59168B] hover:bg-[#45126D] text-white font-black h-14 rounded-2xl text-lg shadow-lg hover:shadow-purple-200"
              >
                Go to Inventory
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full font-bold h-14 rounded-2xl text-slate-600 border-slate-200 text-lg hover:bg-slate-50"
              >
                New Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Fira_Sans'] pb-20 selection:bg-orange-500/10 animate-in fade-in duration-500">
      <div className="max-w-[1400px] mx-auto space-y-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-['Fira_Sans'] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-orange-600 to-slate-800">
              Stock Export
            </h1>
            <p className="text-lg text-slate-500 font-bold flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Process goods issuing and update inventory levels.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/warehouse/inventory')}
              className="font-black border-slate-200 rounded-2xl h-14 px-8 text-slate-600 hover:bg-slate-50 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-2xl hover:shadow-orange-200 text-white font-black px-10 rounded-2xl h-14 text-lg transition-all flex items-center gap-3 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MinusCircle className="h-6 w-6" />
                  Issue Goods
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 items-start">
          {/* General Information */}
          <Card className="xl:col-span-1 border-slate-100 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 sticky top-8">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-500" />
                Export Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                  Dispatching Branch
                </Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-orange-500 font-bold text-slate-800 shadow-sm text-base hover:bg-slate-100 transition-colors">
                    <SelectValue placeholder="Select source branch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch.branchId}
                        value={branch.branchId.toString()}
                        className="font-bold text-slate-700 py-3 text-base"
                      >
                        {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                  Export Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <Input
                    type="date"
                    value={exportDate}
                    onChange={(e) => setExportDate(e.target.value)}
                    className="pl-14 bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-orange-500 font-bold text-slate-800 shadow-sm text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                  Notes / Reason
                </Label>
                <Textarea
                  placeholder="Reason for issuing (e.g. Sale, Internal transfer)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-50 border-slate-100 min-h-[160px] rounded-2xl focus:ring-orange-500 font-bold text-slate-800 shadow-sm p-5 text-base placeholder:text-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Export Lines */}
          <Card className="xl:col-span-3 border-slate-200/60 shadow-xl rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-500" />
                Products to Issue
              </CardTitle>
              <Button
                onClick={addLine}
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-black text-sm gap-2 group px-4 h-10 rounded-xl"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                ADD LINE
              </Button>
            </CardHeader>
            <CardContent className="p-0 border-none overflow-visible">
              <div className="overflow-visible min-h-[500px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[45%]">
                        Product Details
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-[15%]">
                        Quantity
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right w-[20%]">
                        Unit Price
                      </th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-[15%]">
                        Total
                      </th>
                      <th className="px-8 py-5 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exportLines.map((line) => (
                      <tr
                        key={line.id}
                        className="group hover:bg-slate-50/80 transition-all duration-300"
                      >
                        <td className="px-8 py-10">
                          <div className="space-y-4 relative">
                            <div className="relative isolate">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                              <Input
                                placeholder="Search SKU or Name..."
                                value={line.productName}
                                onChange={(e) => {
                                  updateLine(
                                    line.id,
                                    'productName',
                                    e.target.value
                                  );
                                  searchProducts(line.id, e.target.value);
                                }}
                                className="pl-12 h-16 text-lg font-black border-slate-100 rounded-2xl focus:ring-orange-500 bg-slate-50/50 group-hover:bg-white transition-all shadow-sm"
                              />
                            </div>

                            {line.productId && (
                              <div className="flex items-center gap-3 mt-2 px-1">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                  Live Inventory:
                                </span>
                                <span
                                  className={`text-[13px] font-extrabold flex items-center gap-1 ${line.availableStock < 5 ? 'text-red-500' : 'text-emerald-600'}`}
                                >
                                  {line.availableStock < 5 ? (
                                    <ArrowDownLeft className="h-3.5 w-3.5" />
                                  ) : (
                                    <Package className="h-3.5 w-3.5" />
                                  )}
                                  {line.availableStock} in stock
                                </span>
                              </div>
                            )}

                            {searchResults[line.id] &&
                              searchResults[line.id].length > 0 && (
                                <div className="absolute z-[100] w-full min-w-[500px] mt-2 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                  <div className="bg-slate-50 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    Search Results (
                                    {searchResults[line.id].length})
                                  </div>
                                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {searchResults[line.id].map((product) => (
                                      <button
                                        key={product.productId}
                                        onClick={() =>
                                          selectProduct(line.id, product)
                                        }
                                        className="w-full px-6 py-4 text-left hover:bg-orange-50 transition-all border-b border-slate-50 last:border-none flex items-center justify-between group/item"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover/item:bg-white transition-colors">
                                            <Package className="h-6 w-6 text-slate-400 group-hover/item:text-orange-500" />
                                          </div>
                                          <div>
                                            <div className="text-base font-black text-slate-800 group-hover/item:text-orange-600">
                                              {product.productName}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                ID: {product.productId}
                                              </span>
                                              <span className="text-xs font-bold text-orange-500/60 tabular-nums">
                                                {product.price.toLocaleString()}{' '}
                                                VNĐ
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-[10px] font-black text-orange-500 uppercase tracking-tighter opacity-0 group-hover/item:opacity-100 transform translate-x-2 group-hover/item:translate-x-0 transition-all">
                                            Check Stock & Select →
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {searchLoading[line.id] && (
                              <div className="absolute z-[100] w-full mt-2 bg-white p-10 border border-slate-200 shadow-2xl rounded-2xl text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <Input
                            type="number"
                            min="1"
                            max={line.availableStock}
                            value={line.quantity || ''}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                'quantity',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`h-14 text-lg font-black text-center border-slate-100 rounded-2xl focus:ring-orange-500 bg-slate-50/50 group-hover:bg-white transition-all shadow-sm w-full tabular-nums ${line.quantity > line.availableStock ? 'text-red-500 border-red-300 ring-4 ring-red-50 bg-red-50/50' : ''}`}
                          />
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-3">
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
                              className="h-14 text-lg font-black text-right border-slate-100 rounded-2xl focus:ring-orange-500 bg-slate-50/50 group-hover:bg-white transition-all shadow-sm tabular-nums flex-1"
                            />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                              VNĐ
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-center">
                          <span className="text-xl font-black text-slate-900 tabular-nums bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-white transition-colors">
                            {(line.quantity * line.unitPrice).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-8">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={exportLines.length === 1}
                            onClick={() => removeLine(line.id)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all h-12 w-12 rounded-xl active:scale-90"
                          >
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="bg-slate-50/80 p-10 flex flex-col items-end gap-2 border-t border-slate-100">
                <div className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 mr-1">
                  Total Export Value
                </div>
                <div className="text-6xl font-black text-slate-900 font-['Fira_Sans'] flex items-baseline gap-4">
                  {subtotal.toLocaleString()}
                  <span className="text-2xl font-black text-slate-400 uppercase tracking-tight">
                    VNĐ
                  </span>
                </div>
                <div className="h-1.5 w-64 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-4 opacity-50 shadow-sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
