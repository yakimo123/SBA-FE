import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches VoucherResponse from backend API docs
export interface VoucherResponse {
    voucherId: number;
    voucherCode: string;
    description: string;
    discountValue: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    validFrom: string;
    validTo: string;
    usageLimit: number;
    isValid: boolean;
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
    ASSIGN: (voucherId: string | number, userId: string | number) => `/api/v1/vouchers/${voucherId}/assign/${userId}`,
};

export const voucherService = {
    /**
     * Get paginated list of vouchers
     */
    async getVouchers(params?: VoucherListParams): Promise<PageResponse<VoucherResponse>> {
        const response = await api.get<ApiResponse<PageResponse<VoucherResponse>>>(ENDPOINTS.VOUCHERS, { params });
        return response.data.data;
    },

    /**
     * Get voucher by ID
     */
    async getVoucherById(id: string | number): Promise<VoucherResponse> {
        const response = await api.get<ApiResponse<VoucherResponse>>(ENDPOINTS.VOUCHER_BY_ID(id));
        return response.data.data;
    },

    /**
     * Get voucher by code
     */
    async getVoucherByCode(code: string): Promise<VoucherResponse> {
        const response = await api.get<ApiResponse<VoucherResponse>>(ENDPOINTS.VOUCHER_BY_CODE(code));
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
     * Assign a voucher to a user
     */
    async assignVoucher(voucherId: string | number, userId: string | number): Promise<void> {
        await api.post<ApiResponse<null>>(ENDPOINTS.ASSIGN(voucherId, userId));
    },
};

export default voucherService;

