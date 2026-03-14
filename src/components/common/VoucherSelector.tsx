import { Search, Tag, Ticket, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../contexts/AuthContext';
import { VoucherResponse, voucherService } from '../../services/voucherService';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

interface VoucherSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (voucher: VoucherResponse) => void;
  subtotal: number;
}

export const VoucherSelector = ({
  open,
  onOpenChange,
  onSelect,
  subtotal,
}: VoucherSelectorProps) => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchMyVouchers = useCallback(async () => {
    if (!user?.userId) return;
    setIsLoading(true);
    try {
      const response = await voucherService.getMyVouchers({
        userId: user.userId,
        size: 50,
      });
      setVouchers(response.content);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (open && user?.userId) {
      fetchMyVouchers();
    }
  }, [open, user?.userId, fetchMyVouchers]);

  const filteredVouchers = vouchers.filter((v) => {
    const searchLower = search.toLowerCase();
    return (
      v.voucherCode.toLowerCase().includes(searchLower) ||
      v.description.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ticket className="w-6 h-6 text-red-600" />
            Chọn mã giảm giá
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm theo mã hoặc mô tả..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Đang tải...</div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              {search
                ? 'Không tìm thấy mã giảm giá phù hợp'
                : 'Bạn chưa có mã giảm giá nào'}
            </div>
          ) : (
            filteredVouchers.map((voucher) => {
              const isOrderValueValid = subtotal >= voucher.minOrderValue;
              const isUsed = voucher.userStatus === 'USED';
              const isSelectable = isOrderValueValid && !isUsed;

              return (
                <button
                  key={voucher.voucherId}
                  onClick={() => isSelectable && onSelect(voucher)}
                  disabled={!isSelectable}
                  className={`w-full flex items-stretch bg-white rounded-xl border overflow-hidden transition-all text-left group relative
                    ${
                      isSelectable
                        ? 'border-gray-200 hover:border-red-500 hover:shadow-md'
                        : 'border-gray-100 opacity-75'
                    }`}
                >
                  {/* Left Ticket Part */}
                  <div
                    className={`w-24 flex flex-col items-center justify-center shrink-0 border-r border-dashed relative
                    ${
                      isSelectable
                        ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {/* Semi-circles for ticket effect */}
                    <div className="absolute top-0 right-[-6px] w-3 h-3 bg-gray-50 rounded-full -translate-y-1/2" />
                    <div className="absolute bottom-0 right-[-6px] w-3 h-3 bg-gray-50 rounded-full translate-y-1/2" />

                    <Tag className="w-6 h-6 mb-1" />
                    <span className="text-sm font-bold">
                      {voucher.discountType === 'PERCENT'
                        ? `${voucher.discountValue}%`
                        : `${voucher.discountValue / 1000}k`}
                    </span>
                  </div>

                  {/* Right Content Part */}
                  <div
                    className={`flex-1 p-4 min-w-0 ${isUsed ? 'grayscale' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span
                        className={`font-bold truncate transition-colors ${
                          isSelectable
                            ? 'text-gray-900 group-hover:text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {voucher.voucherCode}
                      </span>
                      {isUsed && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          Đã sử dụng
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 mb-2 font-medium">
                      {voucher.description}
                    </p>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-[11px] font-medium ${isOrderValueValid ? 'text-gray-500' : 'text-red-500'}`}
                        >
                          Đơn tối thiểu{' '}
                          {voucher.minOrderValue.toLocaleString('vi-VN')}₫
                        </p>
                        {voucher.discountType === 'PERCENT' &&
                          voucher.maxDiscount > 0 && (
                            <p className="text-[11px] text-gray-400">
                              • Tối đa{' '}
                              {voucher.maxDiscount.toLocaleString('vi-VN')}₫
                            </p>
                          )}
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-gray-400">
                          HSD: {formatDate(voucher.validTo)}
                        </p>

                        {!isOrderValueValid && !isUsed && (
                          <p className="text-[10px] text-red-500 italic">
                            Thiếu{' '}
                            {(voucher.minOrderValue - subtotal).toLocaleString(
                              'vi-VN'
                            )}
                            ₫
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-4 bg-white border-t">
          <Button
            variant="ghost"
            className="w-full text-gray-500"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherSelector;
