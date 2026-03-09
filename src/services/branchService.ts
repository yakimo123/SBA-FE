import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches StoreBranch from integration guide
export interface BranchResponse {
  branchId: number;
  branchName: string;
  location: string;
  address: string;
  contactNumber: string;
  workingHours: string;
  mapsUrl: string;
}

export interface CreateBranchRequest {
  branchName: string;
  location: string;
  managerName: string;
  contactNumber: string;
}

export interface UpdateBranchRequest {
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
  BRANCH_BY_ID: (id: string | number) => `/api/v1/branches/${id}`,
  BRANCH_PRODUCT_STOCK: (
    branchId: string | number,
    productId: string | number
  ) => `/api/v1/branches/${branchId}/products/${productId}/stock`,
};

export const branchService = {
  async getBranches(
    params?: BranchListParams
  ): Promise<PageResponse<BranchResponse>> {
    const response = await api.get<ApiResponse<PageResponse<BranchResponse>>>(
      ENDPOINTS.BRANCHES,
      { params }
    );
    return response.data.data;
  },

  async getAllBranches(): Promise<BranchResponse[]> {
    // We request a large size to simulate "all" since the backend moved to pagination
    const response = await this.getBranches({ size: 100 });
    return response.content || [];
  },

  async getBranchById(id: string | number): Promise<BranchResponse> {
    const response = await api.get<ApiResponse<BranchResponse>>(
      ENDPOINTS.BRANCH_BY_ID(id)
    );
    return response.data.data;
  },

  async createBranch(data: CreateBranchRequest): Promise<BranchResponse> {
    const response = await api.post<ApiResponse<BranchResponse>>(
      ENDPOINTS.BRANCHES,
      data
    );
    return response.data.data;
  },

  async updateBranch(
    id: string | number,
    data: UpdateBranchRequest
  ): Promise<BranchResponse> {
    const response = await api.put<ApiResponse<BranchResponse>>(
      ENDPOINTS.BRANCH_BY_ID(id),
      data
    );
    return response.data.data;
  },

  async deleteBranch(id: string | number): Promise<void> {
    await api.delete(ENDPOINTS.BRANCH_BY_ID(id));
  },

  // Returns stock quantity as a number
  async getBranchProductStock(
    branchId: string | number,
    productId: string | number
  ): Promise<number> {
    const response = await api.get<ApiResponse<number>>(
      ENDPOINTS.BRANCH_PRODUCT_STOCK(branchId, productId)
    );
    return response.data.data;
  },

  async updateBranchProductStock(
    branchId: string | number,
    productId: string | number,
    quantity: number
  ): Promise<void> {
    await api.patch(ENDPOINTS.BRANCH_PRODUCT_STOCK(branchId, productId), null, {
      params: { quantity },
    });
  },
};

export default branchService;
