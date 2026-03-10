import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches VoucherResponse from backend API docs
export interface VoucherResponse {
  voucherId: number;
  voucherCode: string;
  description: string;
  discountValue: number;
  discountType: 'PERCENT' | 'FIXED';
  minOrderValue: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  isValid: boolean;
  userStatus?: 'AVAILABLE' | 'USED' | 'EXPIRED';
}

export interface VoucherRequest {
  voucherCode: string;
  description: string;
  discountValue: number;
  discountType: 'PERCENT' | 'FIXED';
  minOrderValue: number;
  maxDiscount: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
}

export interface VoucherListParams {
  keyword?: string;
  validOnly?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

const ENDPOINTS = {
  VOUCHERS: '/api/v1/vouchers',
  VOUCHER_BY_ID: (id: string | number) => `/api/v1/vouchers/${id}`,
  VOUCHER_BY_CODE: (code: string) => `/api/v1/vouchers/code/${code}`,
  VALIDATE: '/api/v1/vouchers/validate',
  VALIDATE_DETAILS: '/api/v1/vouchers/validate-details',
  ASSIGN: (voucherId: string | number, userId: string | number) =>
    `/api/v1/vouchers/${voucherId}/assign/${userId}`,
  ASSIGN_BULK: (voucherId: string | number) =>
    `/api/v1/vouchers/${voucherId}/assign`,
  MY_VOUCHERS: '/api/v1/vouchers/my-vouchers',
};

export const voucherService = {
  /**
   * Get paginated list of vouchers
   */
  async getVouchers(
    params?: VoucherListParams
  ): Promise<PageResponse<VoucherResponse>> {
    const response = await api.get<ApiResponse<PageResponse<VoucherResponse>>>(
      ENDPOINTS.VOUCHERS,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get voucher by ID
   */
  async getVoucherById(id: string | number): Promise<VoucherResponse> {
    const response = await api.get<ApiResponse<VoucherResponse>>(
      ENDPOINTS.VOUCHER_BY_ID(id)
    );
    return response.data.data;
  },

  /**
   * Create a new voucher (Admin)
   */
  async createVoucher(data: VoucherRequest): Promise<VoucherResponse> {
    const response = await api.post<ApiResponse<VoucherResponse>>(
      ENDPOINTS.VOUCHERS,
      data
    );
    return response.data.data;
  },

  /**
   * Update an existing voucher (Admin)
   */
  async updateVoucher(
    id: string | number,
    data: VoucherRequest
  ): Promise<VoucherResponse> {
    const response = await api.put<ApiResponse<VoucherResponse>>(
      ENDPOINTS.VOUCHER_BY_ID(id),
      data
    );
    return response.data.data;
  },

  /**
   * Delete a voucher (Admin)
   */
  async deleteVoucher(id: string | number): Promise<void> {
    await api.delete<ApiResponse<null>>(ENDPOINTS.VOUCHER_BY_ID(id));
  },

  /**
   * Get voucher by code
   */
  async getVoucherByCode(code: string): Promise<VoucherResponse> {
    const response = await api.get<ApiResponse<VoucherResponse>>(
      ENDPOINTS.VOUCHER_BY_CODE(code)
    );
    return response.data.data;
  },

  /**
   * Validate a voucher for a user
   */
  async validateVoucher(code: string, userId: number): Promise<boolean> {
    const response = await api.get<ApiResponse<boolean>>(ENDPOINTS.VALIDATE, {
      params: { code, userId },
    });
    return response.data.data;
  },

  /**
   * Validate and get voucher details
   */
  async validateAndGetVoucher(
    code: string,
    userId: number,
    orderTotal: number
  ): Promise<VoucherResponse> {
    const response = await api.get<ApiResponse<VoucherResponse>>(
      ENDPOINTS.VALIDATE_DETAILS,
      {
        params: { code, userId, orderTotal },
      }
    );
    return response.data.data;
  },

  /**
   * Assign a voucher to a single user
   */
  async assignVoucher(
    voucherId: string | number,
    userId: string | number
  ): Promise<void> {
    await api.post<ApiResponse<null>>(ENDPOINTS.ASSIGN(voucherId, userId));
  },

  /**
   * Assign a voucher to a list of users (Admin)
   */
  async assignVoucherBulk(
    voucherId: string | number,
    userIds: number[]
  ): Promise<void> {
    await api.post<ApiResponse<null>>(
      ENDPOINTS.ASSIGN_BULK(voucherId),
      userIds
    );
  },

  /**
   * Get my vouchers
   */
  async getMyVouchers(params: {
    userId: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<VoucherResponse>> {
    const response = await api.get<ApiResponse<PageResponse<VoucherResponse>>>(
      ENDPOINTS.MY_VOUCHERS,
      { params }
    );
    return response.data.data;
  },
};

export default voucherService;
