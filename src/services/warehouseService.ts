import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

export interface WarehouseInventoryItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  brandName?: string;
  categoryName?: string;
  supplierName?: string;
  status?: string;
  createdDate?: string;
}

export interface StockImportRequest {
  branchId: number;
  note: string;
  createdDate: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface StockExportRequest {
  branchId: number;
  note: string;
  createdDate: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
}

export interface StockCheckResponse {
  productId: number;
  branchId: number;
  availableQuantity: number;
}

export interface InventoryParams {
  q?: string;
  branchId?: number;
  page?: number;
  size?: number;
}

const BASE = '/api/v1/warehouse';

export const warehouseService = {
  async getInventory(
    params: InventoryParams = {}
  ): Promise<PageResponse<WarehouseInventoryItem>> {
    const res = await api.get<
      ApiResponse<PageResponse<WarehouseInventoryItem>>
    >(`${BASE}/inventory`, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10, // Default size to 10
        q: params.q,
        branchId: params.branchId,
      },
    });

    const rawData = res.data.data;

    // Handle nested page info if present
    if (rawData.page) {
      return {
        ...rawData,
        totalPages: rawData.page.totalPages,
        totalElements: rawData.page.totalElements,
        size: rawData.page.size,
        number: rawData.page.number,
      };
    }

    return rawData;
  },

  async importStock(data: StockImportRequest): Promise<void> {
    await api.post<ApiResponse<void>>(`${BASE}/import`, data);
  },

  async exportStock(data: StockExportRequest): Promise<void> {
    await api.post<ApiResponse<void>>(`${BASE}/export`, data);
  },

  async checkStock(
    branchId: number,
    productId: number
  ): Promise<StockCheckResponse> {
    const res = await api.get<ApiResponse<StockCheckResponse>>(
      `${BASE}/stock-check`,
      {
        params: { branchId, productId },
      }
    );
    return res.data.data;
  },
};

export default warehouseService;
