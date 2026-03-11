import api from './api';
import { ApiResponse, PageableResponse, ProductResponse } from '../types';

const BASE = '/api/v1/products';

const productService = {
    search: async (
        keyword?: string,
        categoryId?: number,
        brandId?: number,
        page = 0,
        size = 20,
    ): Promise<PageableResponse<ProductResponse>> => {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (categoryId) params.append('categoryId', categoryId.toString());
        if (brandId) params.append('brandId', brandId.toString());
        params.append('page', page.toString());
        params.append('size', size.toString());

        const res = await api.get<ApiResponse<PageableResponse<ProductResponse>>>(
            `${BASE}?${params.toString()}`
        );
        return res.data.data;
    },

    getById: async (id: number): Promise<ProductResponse> => {
        const res = await api.get<ApiResponse<ProductResponse>>(`${BASE}/${id}`);
        return res.data.data;
    },
};

export default productService;
