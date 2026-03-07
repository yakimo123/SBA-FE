import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches BulkOrderResponse from backend API
export interface BulkPriceTier {
    bulkPriceTierId: number;
    minQty: number;
    unitPrice: number;
}

export interface BulkOrderCustomization {
    customizationId: number;
    type: string; // e.g. "ENGRAVING"
    note: string;
    status: string; // e.g. "PENDING"
    extraFee: number;
}

export interface BulkOrderDetail {
    bulkOrderDetailId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPriceSnapshot: number;
    discountSnapshot: number;
    appliedTierPrice: number;
    customizationFee: number;
    lineTotal: number;
    priceTiers: BulkPriceTier[];
    customizations: BulkOrderCustomization[];
}

export interface BulkOrderResponse {
    bulkOrderId: number;
    userId: number;
    userFullName: string;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    totalPrice: number;
    details: BulkOrderDetail[];
}

export type BulkOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface CreateBulkOrderRequest {
    items: {
        productId: number;
        quantity: number;
    }[];
}

export interface AddCustomizationRequest {
    type: string;
    note: string;
    extraFee: number;
}

export interface BulkOrderListParams {
    userId?: number;
    status?: BulkOrderStatus;
    page?: number;
    size?: number;
    sort?: string;
}

const ENDPOINTS = {
    BULK_ORDERS: '/api/v1/bulk-orders',
    BULK_ORDER_BY_ID: (id: string | number) => `/api/v1/bulk-orders/${id}`,
    PRICE_BREAKDOWN: (id: string | number) => `/api/v1/bulk-orders/${id}/price-breakdown`,
    CUSTOMIZATION: (detailId: string | number) => `/api/v1/bulk-orders/details/${detailId}/customization`,
    UPDATE_STATUS: (id: string | number) => `/api/v1/bulk-orders/${id}/status`,
};

export const bulkOrderService = {
    async createBulkOrder(userId: number, data: CreateBulkOrderRequest): Promise<BulkOrderResponse> {
        const response = await api.post<ApiResponse<BulkOrderResponse>>(ENDPOINTS.BULK_ORDERS, data, {
            params: { userId },
        });
        return response.data.data;
    },

    async getBulkOrders(params?: BulkOrderListParams): Promise<PageResponse<BulkOrderResponse>> {
        const response = await api.get<ApiResponse<PageResponse<BulkOrderResponse>>>(ENDPOINTS.BULK_ORDERS, { params });
        return response.data.data;
    },

    async getBulkOrderById(id: string | number): Promise<BulkOrderResponse> {
        const response = await api.get<ApiResponse<BulkOrderResponse>>(ENDPOINTS.BULK_ORDER_BY_ID(id));
        return response.data.data;
    },

    async getPriceBreakdown(id: string | number): Promise<BulkOrderResponse> {
        const response = await api.get<ApiResponse<BulkOrderResponse>>(ENDPOINTS.PRICE_BREAKDOWN(id));
        return response.data.data;
    },

    async addCustomization(detailId: string | number, data: AddCustomizationRequest): Promise<BulkOrderResponse> {
        const response = await api.post<ApiResponse<BulkOrderResponse>>(ENDPOINTS.CUSTOMIZATION(detailId), data);
        return response.data.data;
    },

    async updateBulkOrderStatus(id: string | number, status: BulkOrderStatus): Promise<BulkOrderResponse> {
        const response = await api.patch<ApiResponse<BulkOrderResponse>>(ENDPOINTS.UPDATE_STATUS(id), null, {
            params: { status },
        });
        return response.data.data;
    },
};

export default bulkOrderService;

