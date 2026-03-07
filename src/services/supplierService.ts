import api from './api';
import { ApiResponse, PageResponse } from '../types/auth';

// Matches SupplierResponse from backend API docs
export interface SupplierResponse {
    supplierId: number;
    supplierName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    address: string;
}

export interface SupplierProductResponse {
    productId: number;
    productName: string;
    description: string;
    price: number;
    categoryId: number;
    categoryName: string;
    brandId: number;
    brandName: string;
    quantity: number;
    status: string;
    createdDate: string;
    supplierId: number;
    supplierName: string;
}

export interface SupplierListParams {
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string;
}

const ENDPOINTS = {
    SUPPLIERS: '/api/v1/suppliers',
    SUPPLIER_PRODUCTS: (supplierId: string | number) => `/api/v1/suppliers/${supplierId}/products`,
};

export const supplierService = {
    async getSuppliers(params?: SupplierListParams): Promise<PageResponse<SupplierResponse>> {
        const response = await api.get<ApiResponse<PageResponse<SupplierResponse>>>(ENDPOINTS.SUPPLIERS, { params });
        return response.data.data;
    },

    async getSupplierProducts(supplierId: string | number, params?: { page?: number; size?: number; sort?: string }): Promise<PageResponse<SupplierProductResponse>> {
        const response = await api.get<ApiResponse<PageResponse<SupplierProductResponse>>>(
            ENDPOINTS.SUPPLIER_PRODUCTS(supplierId),
            { params }
        );
        return response.data.data;
    },
};

export default supplierService;

