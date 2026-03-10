import {
  AddCustomizationRequest,
  ApiResponse,
  BulkOrder,
  CreateBulkOrderRequest,
  TierPrice,
} from '../types';
import api from './api';

const BASE = '/api/v1/bulk-orders';

const bulkOrderService = {
  /** Lấy danh sách đơn hàng của company hiện tại */
  getMyOrders: async (page = 0, size = 20): Promise<{ content: BulkOrder[]; totalElements: number; totalPages: number }> => {
    const res = await api.get<ApiResponse<{ content: BulkOrder[]; totalElements: number; totalPages: number }>>(
      `${BASE}/my-orders`,
      { params: { page, size } }
    );
    return res.data.data;
  },

  /** Lấy chi tiết một đơn hàng */
  getOrderById: async (orderId: string): Promise<BulkOrder> => {
    const res = await api.get<ApiResponse<BulkOrder>>(`${BASE}/${orderId}`);
    return res.data.data;
  },

  /** Tạo đơn hàng mới */
  createBulkOrder: async (data: CreateBulkOrderRequest): Promise<BulkOrder> => {
    const res = await api.post<ApiResponse<BulkOrder>>(BASE, data);
    return res.data.data;
  },

  /** Hủy đơn hàng (chỉ khi PENDING) */
  cancelOrder: async (orderId: string): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(`${BASE}/${orderId}/cancel`);
    return res.data.data;
  },

  /** Thêm / sửa customization trên đơn PENDING */
  addCustomization: async (orderId: string, data: AddCustomizationRequest): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(`${BASE}/${orderId}/customization`, data);
    return res.data.data;
  },

  /** Áp dụng voucher */
  applyVoucher: async (orderId: string, voucherCode: string): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(`${BASE}/${orderId}/voucher`, { voucherCode });
    return res.data.data;
  },

  /** Lấy tier pricing theo productId */
  getTierPrices: async (productId: string | number): Promise<TierPrice[]> => {
    const res = await api.get<ApiResponse<TierPrice[]>>(`${BASE}/tier-prices`, {
      params: { productId },
    });
    return res.data.data;
  },
};

export default bulkOrderService;
