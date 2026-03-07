import api from './api';
import { ApiResponse, PageResponse } from '../types/auth';

// Matches WarrantyResponse from backend API docs
export interface WarrantyDTO {
  warrantyId: number;
  productId: number;
  productName: string;
  warrantyPeriodMonths: number;
  warrantyTerms: string;
  startDate: string;
  endDate: string;
}

export interface WarrantyListParams {
  page?: number;
  size?: number;
  sort?: string;
}

const ENDPOINTS = {
  PRODUCT_WARRANTIES: (productId: string | number) => `/api/v1/warranties/product/${productId}`,
  WARRANTY_BY_ID: (id: string | number) => `/api/v1/warranties/${id}`,
  VALIDATE: (id: string | number) => `/api/v1/warranties/${id}/validate`,
};

export const warrantyService = {
  /**
   * Get warranties for a product (paginated)
   */
  async getProductWarranties(productId: string | number, params?: WarrantyListParams): Promise<PageResponse<WarrantyDTO>> {
    const response = await api.get<ApiResponse<PageResponse<WarrantyDTO>>>(
      ENDPOINTS.PRODUCT_WARRANTIES(productId),
      { params }
    );
    return response.data.data;
  },

  /**
   * Get warranty by ID
   */
  async getWarrantyById(id: string | number): Promise<WarrantyDTO> {
    const response = await api.get<ApiResponse<WarrantyDTO>>(ENDPOINTS.WARRANTY_BY_ID(id));
    return response.data.data;
  },

  /**
   * Validate if warranty is still active
   */
  async validateWarranty(id: string | number): Promise<boolean> {
    const response = await api.get<ApiResponse<boolean>>(ENDPOINTS.VALIDATE(id));
    return response.data.data;
  },
};

export default warrantyService;

