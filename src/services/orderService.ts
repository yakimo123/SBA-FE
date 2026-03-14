import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches OrderResponse from backend API docs
export interface OrderResponse {
    orderId: number;
    userId: number;
    userFullName: string;
    orderDate: string;
    totalAmount: number;
    discountAmount?: number;
    finalAmount?: number;
    orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
    shippingAddress: string;
    paymentMethod: string;
    paymentStatus: string;
    voucherCode: string | null;
    orderItems?: OrderItemResponse[];
}

export interface OrderItemResponse {
    orderDetailId: number;
    productId: number;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    branchName?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface CreateOrderRequest {
    shippingAddress: string;
    paymentMethod: string;
    voucherCode?: string;
    items: {
        productId: number;
        quantity: number;
        branchId?: number;
    }[];
}

export interface OrderListParams {
    userId?: number;
    status?: OrderStatus;
    page?: number;
    size?: number;
    sort?: string;
}

const ENDPOINTS = {
    ORDERS: '/api/v1/orders',
    ORDER_BY_ID: (id: string | number) => `/api/v1/orders/${id}`,
    UPDATE_STATUS: (id: string | number) => `/api/v1/orders/${id}/status`,
    APPLY_VOUCHER: (id: string | number) => `/api/v1/orders/${id}/voucher`,
    CANCEL: (id: string | number) => `/api/v1/orders/${id}/cancel`,
};

export const orderService = {
    /**
     * Place a new order
     */
    async createOrder(userId: number, data: CreateOrderRequest): Promise<OrderResponse> {
        const response = await api.post<ApiResponse<OrderResponse>>(ENDPOINTS.ORDERS, data, {
            params: { userId },
        });
        return response.data.data;
    },

    /**
     * Get paginated list of orders
     */
    async getOrders(params?: OrderListParams): Promise<PageResponse<OrderResponse>> {
        const response = await api.get<ApiResponse<PageResponse<OrderResponse>>>(ENDPOINTS.ORDERS, { params });
        return response.data.data;
    },

    /**
     * Get a single order by ID
     */
    async getOrderById(id: string | number): Promise<OrderResponse> {
        const response = await api.get<ApiResponse<OrderResponse>>(ENDPOINTS.ORDER_BY_ID(id));
        return response.data.data;
    },

    /**
     * Update order status (Admin)
     */
    async updateOrderStatus(id: string | number, status: OrderStatus): Promise<OrderResponse> {
        const response = await api.patch<ApiResponse<OrderResponse>>(ENDPOINTS.UPDATE_STATUS(id), null, {
            params: { status },
        });
        return response.data.data;
    },

    /**
     * Apply a voucher to an existing order
     */
    async applyVoucher(id: string | number, voucherCode: string): Promise<OrderResponse> {
        const response = await api.post<ApiResponse<OrderResponse>>(ENDPOINTS.APPLY_VOUCHER(id), null, {
            params: { voucherCode },
        });
        return response.data.data;
    },

    /**
     * Cancel an order
     */
    async cancelOrder(id: string | number): Promise<void> {
        await api.post<ApiResponse<null>>(ENDPOINTS.CANCEL(id));
    },
};

export default orderService;

