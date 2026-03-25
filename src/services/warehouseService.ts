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

export interface StockTransactionItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface StockTransaction {
  id: number;
  type: 'IMPORT' | 'EXPORT' | 'RESERVED' | 'RELEASED';
  branchId: number;
  branchName: string;
  orderId: number | null;
  bulkOrderId: number | null;
  note: string;
  createdDate: string;
  items: StockTransactionItem[];
}

export interface StockTransactionParams {
  branchId?: number;
  type?: 'IMPORT' | 'EXPORT' | 'RESERVED' | 'RELEASED';
  orderId?: number;
  bulkOrderId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

const BASE = '/api/v1/warehouse';
const TXN_BASE = '/api/v1/stock-transactions';

export const warehouseService = {
  async getStockTransactions(
    params: StockTransactionParams = {}
  ): Promise<PageResponse<StockTransaction>> {
    const res = await api.get<ApiResponse<PageResponse<StockTransaction>>>(TXN_BASE, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'createdDate,desc',
        branchId: params.branchId,
        type: params.type,
        orderId: params.orderId,
        bulkOrderId: params.bulkOrderId,
      },
    });
    return res.data.data;
  },

  async exportOrderStock(
    orderId: number,
    data: { branchId: number; items: { productId: number; quantity: number }[] }
  ): Promise<void> {
    await api.post<ApiResponse<void>>(`${BASE}/orders/${orderId}/export`, data);
  },

  async exportBulkOrderStock(
    bulkOrderId: number,
    data: { branchId: number; items: { productId: number; quantity: number }[] }
  ): Promise<void> {
    await api.post<ApiResponse<void>>(
      `${BASE}/bulk-orders/${bulkOrderId}/export`,
      data
    );
  },

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
