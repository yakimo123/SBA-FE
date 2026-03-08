import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';

import { VoucherRequest, VoucherResponse } from '../../services/voucherService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Modal } from './Modal';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherRequest) => Promise<void>;
  initialData?: VoucherResponse | null;
  title: string;
}

const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];

export function VoucherFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: VoucherFormModalProps) {
  const [formData, setFormData] = useState<VoucherRequest>({
    voucherCode: '',
    description: '',
    discountValue: 0,
    discountType: 'PERCENT',
    minOrderValue: 0,
    maxDiscount: 0,
    validFrom: new Date().toISOString().slice(0, 16),
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    usageLimit: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        voucherCode: initialData.voucherCode,
        description: initialData.description,
        discountValue: initialData.discountValue,
        discountType: initialData.discountType,
        minOrderValue: initialData.minOrderValue,
        maxDiscount: initialData.maxDiscount,
        validFrom: initialData.validFrom.slice(0, 16),
        validTo: initialData.validTo.slice(0, 16),
        usageLimit: initialData.usageLimit,
      });
    } else {
      setFormData({
        voucherCode: '',
        description: '',
        discountValue: 0,
        discountType: 'PERCENT',
        minOrderValue: 0,
        maxDiscount: 0,
        validFrom: new Date().toISOString().slice(0, 16),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        usageLimit: 100,
      });
    }
    setFieldErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    try {
      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Error submitting voucher:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const mappedErrors: Record<string, string> = {};
        if (Array.isArray(errors)) {
          errors.forEach((err: any) => {
            mappedErrors[err.field] = err.message || err.defaultMessage;
          });
        } else {
          Object.keys(errors).forEach((key) => {
            mappedErrors[key] = errors[key];
          });
        }
        setFieldErrors(mappedErrors);
      } else {
        toast.error('Có lỗi xảy ra khi lưu voucher');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field: string) => {
    if (fieldErrors[field]) {
      return (
        <p className="mt-1 text-sm font-medium text-red-500">
          {fieldErrors[field]}
        </p>
      );
    }
    return null;
  };

  const addAmount = (field: keyof VoucherRequest, amount: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (Number(prev[field]) || 0) + amount,
    }));
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Voucher Code */}
          <div className="space-y-3">
            <Label
              htmlFor="voucherCode"
              className="text-base font-bold text-gray-700"
            >
              Mã Voucher
            </Label>
            <div className="relative">
              <Input
                id="voucherCode"
                className={`h-14 text-lg font-mono tracking-widest uppercase pl-4 ${fieldErrors.voucherCode ? 'border-red-500 ring-red-500' : 'border-purple-100 focus:border-purple-500'}`}
                value={formData.voucherCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    voucherCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="VÍ DỤ: KHUYENMAI2024"
                required
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 ml-1">
              <Info className="h-3 w-3" /> Mã định danh duy nhất cho voucher
              này.
            </p>
            {renderError('voucherCode')}
          </div>

          {/* Discount Type */}
          <div className="space-y-3">
            <Label
              htmlFor="discountType"
              className="text-base font-bold text-gray-700"
            >
              Loại hình giảm giá
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, discountType: 'PERCENT' })
                }
                className={`h-14 flex items-center justify-center rounded-xl border-2 font-bold transition-all ${
                  formData.discountType === 'PERCENT'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-purple-200'
                }`}
              >
                % Phần trăm
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, discountType: 'FIXED' })
                }
                className={`h-14 flex items-center justify-center rounded-xl border-2 font-bold transition-all ${
                  formData.discountType === 'FIXED'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-purple-200'
                }`}
              >
                ₫ Số tiền cố định
              </button>
            </div>
            {renderError('discountType')}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label
            htmlFor="description"
            className="text-base font-bold text-gray-700"
          >
            Mô tả chương trình
          </Label>
          <Input
            id="description"
            className={`h-14 text-base ${fieldErrors.description ? 'border-red-500 ring-red-500' : 'border-purple-100'}`}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Lễ hội mua sắm 2024 - Giảm ngay cho khách hàng mới..."
            required
          />
          {renderError('description')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Discount Value */}
          <div className="space-y-3">
            <Label
              htmlFor="discountValue"
              className="text-base font-bold text-gray-700"
            >
              {formData.discountType === 'PERCENT'
                ? 'Tỷ lệ giảm giá (%)'
                : 'Số tiền muốn giảm (₫)'}
            </Label>
            <div className="relative group">
              <Input
                id="discountValue"
                className={`h-14 text-xl font-bold pr-12 ${fieldErrors.discountValue ? 'border-red-500 ring-red-500' : 'border-purple-100'}`}
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: Number(e.target.value),
                  })
                }
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl text-purple-400 group-focus-within:text-purple-600">
                {formData.discountType === 'PERCENT' ? '%' : '₫'}
              </span>
            </div>
            {formData.discountType === 'FIXED' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => addAmount('discountValue', amt)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors border border-gray-200"
                  >
                    +{new Intl.NumberFormat('vi-VN').format(amt / 1000)}k
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 ml-1">
              {formData.discountType === 'PERCENT'
                ? 'Nhập từ 1 đến 100. Ví dụ: 15 để giảm 15%.'
                : 'Số tiền trừ trực tiếp vào hóa đơn. Ví dụ: 50.000'}
            </p>
            {renderError('discountValue')}
          </div>

          {/* Usage Limit */}
          <div className="space-y-3">
            <Label
              htmlFor="usageLimit"
              className="text-base font-bold text-gray-700"
            >
              Tổng lượt sử dụng
            </Label>
            <Input
              id="usageLimit"
              type="number"
              className={`h-14 text-xl font-bold ${fieldErrors.usageLimit ? 'border-red-500 ring-red-500' : 'border-purple-100'}`}
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: Number(e.target.value) })
              }
              required
            />
            <p className="text-xs text-gray-500 ml-1">
              Tổng số lần mã này có thể được dùng trên toàn hệ thống.
            </p>
            {renderError('usageLimit')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
          {/* Min Order Value */}
          <div className="space-y-3">
            <Label
              htmlFor="minOrderValue"
              className="text-base font-bold text-gray-700 text-orange-700"
            >
              Đơn hàng tối thiểu (₫)
            </Label>
            <div className="relative group">
              <Input
                id="minOrderValue"
                type="number"
                className={`h-14 text-xl font-bold pr-12 ${fieldErrors.minOrderValue ? 'border-red-500 ring-red-500' : 'border-orange-100 focus:border-orange-400 focus:ring-orange-100'}`}
                value={formData.minOrderValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderValue: Number(e.target.value),
                  })
                }
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl text-orange-300">
                ₫
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[100000, 200000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addAmount('minOrderValue', amt)}
                  className="px-3 py-1.5 rounded-lg bg-orange-50 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-colors border border-orange-100"
                >
                  +{new Intl.NumberFormat('vi-VN').format(amt / 1000)}k
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 ml-1 italic">
              Voucher chỉ hiển thị nếu đơn hàng ≥{' '}
              {formatVND(formData.minOrderValue)}
            </p>
            {renderError('minOrderValue')}
          </div>

          {/* Max Discount */}
          <div className="space-y-3 text-gray-400">
            <Label
              htmlFor="maxDiscount"
              className={`text-base font-bold ${formData.discountType === 'FIXED' ? 'text-gray-300' : 'text-purple-700'}`}
            >
              Giảm tối đa (₫)
            </Label>
            <div className="relative group">
              <Input
                id="maxDiscount"
                type="number"
                disabled={formData.discountType === 'FIXED'}
                className={`h-14 text-xl font-bold pr-12 ${
                  formData.discountType === 'FIXED'
                    ? 'bg-gray-50 border-gray-200'
                    : fieldErrors.maxDiscount
                      ? 'border-red-500 ring-red-500'
                      : 'border-purple-100'
                }`}
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscount: Number(e.target.value),
                  })
                }
                required={formData.discountType === 'PERCENT'}
              />
              <span
                className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xl ${formData.discountType === 'FIXED' ? 'text-gray-300' : 'text-purple-400'}`}
              >
                ₫
              </span>
            </div>
            {formData.discountType === 'PERCENT' && (
              <div className="flex flex-wrap gap-2 mt-2 font-['Fira_Sans']">
                {[20000, 50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => addAmount('maxDiscount', amt)}
                    className="px-3 py-1.5 rounded-lg bg-purple-50 text-xs font-bold text-purple-600 hover:bg-purple-100 transition-colors border border-purple-100"
                  >
                    +{new Intl.NumberFormat('vi-VN').format(amt / 1000)}k
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 ml-1">
              {formData.discountType === 'FIXED'
                ? 'Không cần thiết cho loại giảm cố định.'
                : 'Giới hạn số tiền giảm kể cả khi phần trăm tính ra cao hơn.'}
            </p>
            {renderError('maxDiscount')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
          {/* Valid From */}
          <div className="space-y-3">
            <Label
              htmlFor="validFrom"
              className="text-base font-bold text-gray-700"
            >
              Ngày bắt đầu
            </Label>
            <Input
              id="validFrom"
              type="datetime-local"
              className={`h-14 text-base border-purple-100 ${fieldErrors.validFrom ? 'border-red-500' : ''}`}
              value={formData.validFrom}
              onChange={(e) =>
                setFormData({ ...formData, validFrom: e.target.value })
              }
              required
            />
            {renderError('validFrom')}
          </div>

          {/* Valid To */}
          <div className="space-y-3">
            <Label
              htmlFor="validTo"
              className="text-base font-bold text-gray-700"
            >
              Ngày kết thúc
            </Label>
            <Input
              id="validTo"
              type="datetime-local"
              className={`h-14 text-base border-purple-100 ${fieldErrors.validTo ? 'border-red-500' : ''}`}
              value={formData.validTo}
              onChange={(e) =>
                setFormData({ ...formData, validTo: e.target.value })
              }
              required
            />
            {renderError('validTo')}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-14 px-8 text-lg font-semibold border-gray-200 hover:bg-gray-50"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 h-14 px-12 text-lg font-bold shadow-xl shadow-purple-100 active:scale-95 transition-all"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : initialData
                ? 'Cập nhật Voucher'
                : 'Xác nhận Tạo Voucher'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
