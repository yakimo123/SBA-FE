import {
    ApiResponse,
    Brand,
    BrandPage,
    CreateBrandRequest,
    UpdateBrandRequest,
} from '../types/product';
import api from './api';

const BASE = '/api/v1/brands';

export const brandService = {
    async createBrand(data: CreateBrandRequest): Promise<Brand> {
        const res = await api.post<ApiResponse<Brand>>(BASE, data);
        return res.data.data;
    },

    async getBrands(page = 0, size = 10, keyword?: string): Promise<BrandPage> {
        const params: Record<string, unknown> = { page, size };
        if (keyword) params.keyword = keyword;
        const res = await api.get<ApiResponse<BrandPage>>(BASE, { params });
        return res.data.data;
    },

    async getBrandById(id: number): Promise<Brand> {
        const res = await api.get<ApiResponse<Brand>>(`${BASE}/${id}`);
        return res.data.data;
    },

    async updateBrand(id: number, data: UpdateBrandRequest): Promise<Brand> {
        const res = await api.put<ApiResponse<Brand>>(`${BASE}/${id}`, data);
        return res.data.data;
    },

    async deleteBrand(id: number): Promise<void> {
        await api.delete(`${BASE}/${id}`);
    },
};

export default brandService;
