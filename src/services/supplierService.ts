import api from './api';
import {
    ApiResponse,
    CreateSupplierRequest,
    Supplier,
    SupplierPage,
} from '../types/product';

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

const BASE = '/api/v1/suppliers';

export const supplierService = {
    async createSupplier(data: CreateSupplierRequest): Promise<Supplier> {
        const res = await api.post<ApiResponse<Supplier>>(BASE, data);
        return res.data.data;
    },

    async getSuppliers(page = 0, size = 100, keyword?: string): Promise<SupplierPage> {
        const params: Record<string, unknown> = { page, size };
        if (keyword) params.keyword = keyword;
        const res = await api.get<ApiResponse<SupplierPage>>(BASE, { params });
        return res.data.data;
    },

    async getSupplierById(id: number): Promise<Supplier> {
        const res = await api.get<ApiResponse<Supplier>>(`${BASE}/${id}`);
        return res.data.data;
    },

    async deleteSupplier(id: number): Promise<void> {
        await api.delete(`${BASE}/${id}`);
    },

    async getSupplierProducts(supplierId: string | number, params?: { page?: number; size?: number; sort?: string }): Promise<any> {
        const response = await api.get<ApiResponse<any>>(
            `${BASE}/${supplierId}/products`,
            { params }
        );
        return response.data.data;
    },
};

export default supplierService;
