import {
  ApiResponse,
  BulkOrderResponse,
  BulkOrderStatus,
  CreateBulkOrderRequest,
  CreateCustomizationRequest,
  PageableResponse,
} from '../types';
import api from './api';

const BASE = '/api/v1/bulk-orders';

const bulkOrderService = {
  /** Tìm kiếm đơn hàng bulk với các bộ lọc */
  search: async (params: {
    userId?: number;
    companyId?: number;
    status?: BulkOrderStatus;
    createdAtFrom?: string;
    createdAtTo?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PageableResponse<BulkOrderResponse>> => {
    const query = new URLSearchParams();
    if (params.userId) query.append('userId', params.userId.toString());
    if (params.companyId) query.append('companyId', params.companyId.toString());
    if (params.status) query.append('status', params.status);
    if (params.createdAtFrom) query.append('createdAtFrom', params.createdAtFrom);
    if (params.createdAtTo) query.append('createdAtTo', params.createdAtTo);
    query.append('page', (params.page ?? 0).toString());
    query.append('size', (params.size ?? 20).toString());

    const res = await api.get<ApiResponse<PageableResponse<BulkOrderResponse>>>(
      `${BASE}?${query.toString()}`
    );
    return res.data.data;
  },

  /** Lấy chi tiết một đơn hàng */
  getById: async (id: number): Promise<BulkOrderResponse> => {
    const res = await api.get<ApiResponse<BulkOrderResponse>>(`${BASE}/${id}`);
    return res.data.data;
  },

  /** Lấy price breakdown */
  getPriceBreakdown: async (id: number): Promise<BulkOrderResponse> => {
    const res = await api.get<ApiResponse<BulkOrderResponse>>(`${BASE}/${id}/price-breakdown`);
    return res.data.data;
  },

  /** Tạo đơn hàng mới */
  create: async (userId: number, data: CreateBulkOrderRequest): Promise<BulkOrderResponse> => {
    const res = await api.post<ApiResponse<BulkOrderResponse>>(
      `${BASE}?userId=${userId}`,
      data
    );
    return res.data.data;
  },

  /** Cập nhật trạng thái đơn hàng (bao gồm hủy) */
  updateStatus: async (id: number, status: BulkOrderStatus): Promise<BulkOrderResponse> => {
    const res = await api.patch<ApiResponse<BulkOrderResponse>>(
      `${BASE}/${id}/status?status=${status}`
    );
    return res.data.data;
  },

  /** Thêm customization vào chi tiết đơn hàng */
  addCustomization: async (detailId: number, data: CreateCustomizationRequest): Promise<BulkOrderResponse> => {
    const res = await api.post<ApiResponse<BulkOrderResponse>>(
      `${BASE}/details/${detailId}/customization`,
      data
    );
    return res.data.data;
  },
};

export default bulkOrderService;
