import { ApiResponse, CompanyRequest, CompanyResponse, PageableResponse } from '../types';
import api from './api';

export const companyService = {
    // Get company by ID
    getById: async (id: number): Promise<CompanyResponse> => {
        const response = await api.get<ApiResponse<CompanyResponse>>(`/api/v1/companies/${id}`);
        return response.data.data;
    },

    // Search companies with pagination
    search: async (keyword?: string, page = 0, size = 20): Promise<PageableResponse<CompanyResponse>> => {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        params.append('page', page.toString());
        params.append('size', size.toString());

        const response = await api.get<ApiResponse<PageableResponse<CompanyResponse>>>(
            `/api/v1/companies?${params.toString()}`
        );
        return response.data.data;
    },

    // Create new company
    create: async (data: CompanyRequest): Promise<CompanyResponse> => {
        const response = await api.post<ApiResponse<CompanyResponse>>('/api/v1/companies', data);
        return response.data.data;
    },

    // Update company
    update: async (id: number, data: CompanyRequest): Promise<CompanyResponse> => {
        const response = await api.put<ApiResponse<CompanyResponse>>(`/api/v1/companies/${id}`, data);
        return response.data.data;
    },

    // Delete company
    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/companies/${id}`);
    },
};
