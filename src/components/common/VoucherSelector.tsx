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

  const isVoucherValid = (voucher: VoucherResponse) => {
    return subtotal >= voucher.minOrderValue;
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
              const isValid = isVoucherValid(voucher);
              return (
                <button
                  key={voucher.voucherId}
                  onClick={() => isValid && onSelect(voucher)}
                  disabled={!isValid}
                  className={`w-full flex items-start gap-3 p-4 bg-white rounded-xl border transition-all text-left group
                    ${
                      isValid
                        ? 'border-gray-200 hover:border-red-500 hover:shadow-md'
                        : 'opacity-60 grayscale cursor-not-allowed border-gray-100'
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 
                    ${isValid ? 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-bold text-gray-900 group-hover:text-red-600 truncate transition-colors">
                        {voucher.voucherCode}
                      </span>
                      <span className="font-bold text-red-600 whitespace-nowrap">
                        {voucher.discountType === 'PERCENT'
                          ? `${voucher.discountValue}%`
                          : `${voucher.discountValue.toLocaleString('vi-VN')}₫`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {voucher.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {voucher.minOrderValue > 0 && (
                        <p className="text-xs text-gray-400">
                          Đơn tối thiểu{' '}
                          {voucher.minOrderValue.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                      {!isValid && (
                        <p className="text-xs text-red-500 font-medium">
                          Chưa đủ điều kiện (Thiếu{' '}
                          {(voucher.minOrderValue - subtotal).toLocaleString(
                            'vi-VN'
                          )}
                          ₫)
                        </p>
                      )}
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
