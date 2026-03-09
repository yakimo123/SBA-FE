import {
  Calendar,
  CheckCircle,
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
      quantity: 0,
      unitPrice: 0,
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
    setImportLines([
      ...importLines,
      {
        id: crypto.randomUUID(),
        productId: null,
        productName: '',
        quantity: 0,
        unitPrice: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (importLines.length > 1) {
      setImportLines(importLines.filter((line) => line.id !== id));
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
    field: keyof ImportLine,
    value: string | number | null
  ) => {
    setImportLines(
      importLines.map((line) => {
        if (line.id === id) {
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  const selectProduct = (lineId: string, product: Product) => {
    setImportLines(
      importLines.map((line) => {
        if (line.id === lineId) {
          return {
            ...line,
            productId: product.productId,
            productName: product.productName,
            unitPrice: product.price || 0,
          };
        }
        return line;
      })
    );
    setSearchResults((prev) => ({ ...prev, [lineId]: [] }));
  };

  const subtotal = useMemo(() => {
    return importLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
  }, [importLines]);

  const handleSubmit = async () => {
    if (!branchId) {
      alert('Please select a branch');
      return;
    }
    const validLines = importLines.filter(
      (l) => l.productId !== null && l.quantity > 0
    );
    if (validLines.length === 0) {
      alert('Please add at least one valid product');
      return;
    }

    setIsSubmitting(true);
    try {
      await warehouseService.importStock({
        branchId: Number(branchId),
        note: notes,
        createdDate: new Date(importDate).toISOString(),
        items: validLines.map((l) => ({
          productId: l.productId!,
          quantity: l.quantity,
          price: l.unitPrice,
        })),
      });
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to submit stock import');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-in zoom-in duration-300">
        <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden rounded-3xl text-lg">
          <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardContent className="pt-8 pb-10 px-8 text-center bg-white">
            <h2 className="text-4xl font-black text-slate-800 mb-4 font-['Fira_Sans']">
              Import Successful!
            </h2>
            <p className="text-slate-500 font-bold mb-8 text-base">
              The stock has been accurately recorded and updated in our system.
            </p>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => navigate('/admin/inventory')}
                className="w-full bg-[#59168B] hover:bg-[#45126D] text-white font-black h-14 rounded-2xl text-lg shadow-lg hover:shadow-purple-200 transition-all"
              >
                Go to Inventory
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full font-bold h-14 rounded-2xl text-slate-600 border-slate-200 text-lg hover:bg-slate-50 transition-all"
              >
                New Import
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Fira_Sans'] pb-20 selection:bg-[#59168B]/10">
      <div className="max-w-[1400px] mx-auto space-y-10 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-['Fira_Sans'] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-[#59168B] to-slate-800">
              Stock Import
            </h1>
            <p className="text-lg text-slate-500 font-bold flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#59168B] animate-pulse" />
              Create a new stock entry for a specific branch.
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
              className="bg-gradient-to-r from-[#59168B] to-[#7B2CBF] hover:shadow-2xl hover:shadow-purple-200 text-white font-black px-10 rounded-2xl h-14 text-lg transition-all flex items-center gap-3 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  Complete Import
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 items-start">
          {/* General Information */}
          <Card className="xl:col-span-1 border-slate-200/60 shadow-xl rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40 sticky top-8">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#59168B]" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                  Storage Branch
                </Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger className="bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-[#59168B] font-bold text-slate-800 shadow-sm text-base hover:bg-slate-100 transition-colors">
                    <SelectValue placeholder="Select target branch" />
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
                  Entry Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <Input
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    className="pl-14 bg-slate-50 border-slate-100 h-14 rounded-2xl focus:ring-[#59168B] font-bold text-slate-800 shadow-sm text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">
                  Additional Notes
                </Label>
                <Textarea
                  placeholder="Optional details about this import shipment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-50 border-slate-100 min-h-[160px] rounded-2xl focus:ring-[#59168B] font-bold text-slate-800 shadow-sm p-5 text-base placeholder:text-slate-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Import Lines */}
          <Card className="xl:col-span-3 border-slate-200/60 shadow-xl rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6 px-8 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <Package className="h-5 w-5 text-[#59168B]" />
                Products to Import
              </CardTitle>
              <Button
                onClick={addLine}
                variant="ghost"
                size="sm"
                className="text-[#59168B] hover:text-[#45126D] hover:bg-purple-50 font-black text-sm gap-2 group px-4 h-10 rounded-xl"
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
                    {importLines.map((line) => (
                      <tr
                        key={line.id}
                        className="group hover:bg-slate-50/80 transition-all duration-300"
                      >
                        <td className="px-8 py-10">
                          <div className="space-y-4 relative">
                            <div className="relative isolate">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                              <Input
                                placeholder="Start typing SKU or Product Name..."
                                value={line.productName}
                                onChange={(e) => {
                                  updateLine(
                                    line.id,
                                    'productName',
                                    e.target.value
                                  );
                                  searchProducts(line.id, e.target.value);
                                }}
                                className="pl-12 h-16 text-lg font-black border-slate-100 rounded-2xl focus:ring-[#59168B] bg-slate-50/50 group-hover:bg-white transition-all shadow-sm"
                              />
                            </div>

                            {line.productId && (
                              <div className="flex items-center gap-3 mt-2 px-1 animate-in slide-in-from-left-2 duration-300">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                  Product ID:
                                </span>
                                <span className="text-[13px] font-extrabold text-[#59168B] flex items-center gap-1">
                                  <Package className="h-3.5 w-3.5" />
                                  {line.productId}
                                </span>
                                {importLines.find((l) => l.id === line.id)
                                  ?.productId &&
                                  branches.find(
                                    (b) => b.branchId.toString() === branchId
                                  ) && (
                                    <span className="text-[11px] font-bold text-slate-400 italic">
                                      • Recording to{' '}
                                      {
                                        branches.find(
                                          (b) =>
                                            b.branchId.toString() === branchId
                                        )?.branchName
                                      }
                                    </span>
                                  )}
                              </div>
                            )}

                            {/* Improved Search Results Dropdown */}
                            {searchResults[line.id] &&
                              searchResults[line.id].length > 0 && (
                                <div className="absolute z-[999] w-full min-w-[600px] mt-3 bg-white border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.25)] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
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
                                        className="w-full px-6 py-4 text-left hover:bg-[#59168B]/5 transition-all border-b border-slate-50 last:border-none flex items-center justify-between group/item"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover/item:bg-white transition-colors">
                                            <Package className="h-6 w-6 text-slate-400 group-hover/item:text-[#59168B]" />
                                          </div>
                                          <div>
                                            <div className="text-base font-black text-slate-800 group-hover/item:text-[#59168B]">
                                              {product.productName}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                ID: {product.productId}
                                              </span>
                                              {product.supplierName && (
                                                <span className="text-xs font-bold text-[#59168B]/60 italic font-['Fira_Sans']">
                                                  {product.supplierName}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-base font-black text-slate-900 tabular-nums">
                                            {product.price.toLocaleString()}
                                            <span className="text-[10px] ml-1 text-slate-400">
                                              VNĐ
                                            </span>
                                          </div>
                                          <div className="text-[10px] font-black text-[#59168B] uppercase tracking-tighter mt-1 opacity-0 group-hover/item:opacity-100 transform translate-x-2 group-hover/item:translate-x-0 transition-all">
                                            Select Product →
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {searchLoading[line.id] && (
                              <div className="absolute z-[999] w-full mt-3 bg-white p-12 border border-slate-200 shadow-2xl rounded-3xl text-center space-y-3">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-[#59168B]" />
                                <p className="text-base font-black text-slate-400 uppercase tracking-widest">
                                  Searching Catalog...
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-10">
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity || ''}
                            onChange={(e) =>
                              updateLine(
                                line.id,
                                'quantity',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-14 text-lg font-black text-center border-slate-100 rounded-2xl focus:ring-[#59168B] bg-slate-50/50 group-hover:bg-white transition-all shadow-sm w-full tabular-nums"
                          />
                        </td>
                        <td className="px-8 py-10">
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
                              className="h-14 text-lg font-black text-right border-slate-100 rounded-2xl focus:ring-[#59168B] bg-slate-50/50 group-hover:bg-white transition-all shadow-sm tabular-nums flex-1"
                            />
                            <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">
                              VNĐ
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-10 text-center">
                          <span className="text-xl font-black text-slate-900 tabular-nums bg-slate-100/50 px-5 py-2.5 rounded-xl group-hover:bg-white transition-colors">
                            {(line.quantity * line.unitPrice).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={importLines.length === 1}
                            onClick={() => removeLine(line.id)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all h-14 w-14 rounded-2xl active:scale-90"
                          >
                            <Trash2 className="h-7 w-7" />
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
                  Total Valuation
                </div>
                <div className="text-6xl font-black text-slate-900 font-['Fira_Sans'] flex items-baseline gap-4">
                  {subtotal.toLocaleString()}
                  <span className="text-2xl font-black text-slate-400 uppercase tracking-tight">
                    VNĐ
                  </span>
                </div>
                <div className="h-2 w-72 bg-gradient-to-r from-[#59168B] via-[#7B2CBF] to-[#59168B]/10 rounded-full mt-4 opacity-70 shadow-sm" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
