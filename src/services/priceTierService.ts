import { ApiResponse, BulkPriceTier, PageableResponse } from '../types';
import api from './api';

const BASE = '/api/v1/admin/price-tiers';

export const priceTierService = {
  /** Lấy danh sách price tiers của một sản phẩm */
  getTiersByProductId: async (productId: number): Promise<BulkPriceTier[]> => {
    const res = await api.get<ApiResponse<BulkPriceTier[]>>(BASE, {
      params: { productId },
    });
    return res.data.data;
  },

  /** Tạo price tier mới */
  createTier: async (data: {
    productId: number;
    minQty: number;
    maxQty?: number | null;
    unitPrice: number;
  }): Promise<BulkPriceTier> => {
    const res = await api.post<ApiResponse<BulkPriceTier>>(BASE, data);
    return res.data.data;
  },

  /** Cập nhật price tier */
  updateTier: async (
    id: number,
    data: Partial<{
      minQty: number;
      maxQty: number | null;
      unitPrice: number;
      isActive: boolean;
    }>
  ): Promise<BulkPriceTier> => {
    const res = await api.patch<ApiResponse<BulkPriceTier>>(
      `${BASE}/${id}`,
      data
    );
    return res.data.data;
  },

  /** Xóa price tier (Soft-delete) */
  deleteTier: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

export default priceTierService;
