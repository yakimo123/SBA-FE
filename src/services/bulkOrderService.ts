import {
  AddCustomizationRequest,
  ApiResponse,
  BulkOrder,
  BulkOrderListParams,
  BulkOrderStatus,
  CreateBulkOrderRequest,
  PageableResponse,
} from '../types';
import api from './api';

const BASE = '/api/v1/bulk-orders';

const bulkOrderService = {
  /** Lấy danh sách bulk orders (admin/customer) */
  getOrders: async (
    params: BulkOrderListParams = {}
  ): Promise<PageableResponse<BulkOrder>> => {
    const res = await api.get<ApiResponse<PageableResponse<BulkOrder>>>(BASE, {
      params: {
        userId: params.userId,
        companyId: params.companyId,
        status: params.status,
        createdAtFrom: params.createdAtFrom,
        createdAtTo: params.createdAtTo,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort,
      },
    });
    const data = res.data.data;
    if (data.page) {
      return {
        ...data,
        totalPages: data.page.totalPages,
        totalElements: data.page.totalElements,
        size: data.page.size,
        number: data.page.number,
      };
    }
    return data;
  },

  /** Tạo bulk order mới */
  createBulkOrder: async (
    data: CreateBulkOrderRequest,
    userId: number
  ): Promise<BulkOrder> => {
    const res = await api.post<ApiResponse<BulkOrder>>(
      `${BASE}?userId=${userId}`,
      data
    );
    return res.data.data;
  },

  /** Lấy chi tiết một bulk order */
  getOrderById: async (id: string | number): Promise<BulkOrder> => {
    const res = await api.get<ApiResponse<BulkOrder>>(`${BASE}/${id}`);
    return res.data.data;
  },

  /** Lấy price breakdown */
  getPriceBreakdown: async (id: string | number): Promise<BulkOrder> => {
    const res = await api.get<ApiResponse<BulkOrder>>(
      `${BASE}/${id}/price-breakdown`
    );
    return res.data.data;
  },

  /** Admin thay đổi trạng thái */
  updateStatus: async (
    id: string | number,
    status: BulkOrderStatus,
    note?: string
  ): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(
      `${BASE}/${id}/status`,
      null,
      { params: { status, note } }
    );
    return res.data.data;
  },

  /** Customer hủy đơn */
  cancelOrder: async (
    id: string | number,
    reason?: string
  ): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(
      `${BASE}/${id}/cancel`,
      reason ? { reason } : undefined
    );
    return res.data.data;
  },

  /** Thêm customization cho một detail item */
  addCustomization: async (
    detailId: number,
    data: AddCustomizationRequest
  ): Promise<BulkOrder> => {
    const res = await api.post<ApiResponse<BulkOrder>>(
      `${BASE}/details/${detailId}/customization`,
      data
    );
    return res.data.data;
  },

  /** Admin duyệt/từ chối customization và set phí */
  reviewCustomization: async (
    customizationId: number,
    status: 'APPROVED' | 'REJECTED',
    extraFee: number,
    feeType: 'PER_UNIT' | 'PER_ORDER'
  ): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(
      `${BASE}/customizations/${customizationId}/review`,
      null,
      { params: { status, extraFee, feeType } }
    );
    return res.data.data;
  },

  /** Admin cập nhật phí ship */
  updateShippingFee: async (
    id: string | number,
    shippingFee: number
  ): Promise<BulkOrder> => {
    const res = await api.patch<ApiResponse<BulkOrder>>(
      `${BASE}/${id}/shipping-fee`,
      null,
      { params: { shippingFee } }
    );
    return res.data.data;
  },
};

export default bulkOrderService;
