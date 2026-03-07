import {
    ApiResponse,
    Category,
    CategoryPage,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from '../types/product';
import api from './api';

const BASE = '/api/v1/categories';

export const categoryService = {
    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const res = await api.post<ApiResponse<Category>>(BASE, data);
        return res.data.data;
    },

    async getCategories(page = 0, size = 10, keyword?: string): Promise<CategoryPage> {
        const params: Record<string, unknown> = { page, size };
        if (keyword) params.keyword = keyword;
        const res = await api.get<ApiResponse<CategoryPage>>(BASE, { params });
        return res.data.data;
    },

    async getCategoryById(id: number): Promise<Category> {
        const res = await api.get<ApiResponse<Category>>(`${BASE}/${id}`);
        return res.data.data;
    },

    async updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
        const res = await api.put<ApiResponse<Category>>(`${BASE}/${id}`, data);
        return res.data.data;
    },

    async deleteCategory(id: number): Promise<void> {
        await api.delete(`${BASE}/${id}`);
    },
};

export default categoryService;
