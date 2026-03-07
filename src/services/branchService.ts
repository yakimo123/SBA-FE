import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches BranchResponse from backend API
export interface BranchResponse {
    branchId: number;
    branchName: string;
    location: string;
    managerName: string;
    contactNumber: string;
}

export interface BranchListParams {
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string;
}

const ENDPOINTS = {
    BRANCHES: '/api/v1/branches',
    BRANCH_PRODUCT_STOCK: (branchId: string | number, productId: string | number) =>
        `/api/v1/branches/${branchId}/products/${productId}/stock`,
};

export const branchService = {
    async getBranches(params?: BranchListParams): Promise<PageResponse<BranchResponse>> {
        const response = await api.get<ApiResponse<PageResponse<BranchResponse>>>(ENDPOINTS.BRANCHES, { params });
        return response.data.data;
    },

    // Returns stock quantity as a number
    async getBranchProductStock(branchId: string | number, productId: string | number): Promise<number> {
        const response = await api.get<ApiResponse<number>>(
            ENDPOINTS.BRANCH_PRODUCT_STOCK(branchId, productId)
        );
        return response.data.data;
    },
};

export default branchService;

