import { PageableResponse } from '../types';
import {
  ApiResponse,
  CompanyProduct,
  CreateProductRequest,
  Product,
  ProductFilterParams,
  ProductPage,
  UpdateProductRequest,
} from '../types/product';
import api from './api';

const BASE = '/api/v1/products';

export const productService = {
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const res = await api.post<ApiResponse<Product>>(BASE, data);
    return res.data.data;
  },

  async getProducts(params: ProductFilterParams = {}): Promise<ProductPage> {
    const query: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.keyword) query.keyword = params.keyword;
    if (params.categoryId) query.categoryId = params.categoryId;
    if (params.brandId) query.brandId = params.brandId;
    if (params.sort) query.sort = params.sort;
    const res = await api.get<ApiResponse<ProductPage>>(BASE, {
      params: query,
    });

    const data = res.data.data;
    // Flatten nested page object if it exists
    if (data.page) {
      return {
        ...data,
        totalPages: data.page.totalPages,
        totalElements: data.page.totalElements,
        size: data.page.size,
        number: data.page.number,
      };
    }
    return data;
  },

  async getProductById(id: number): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`${BASE}/${id}`);
    return res.data.data;
  },

  async updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<Product> {
    const res = await api.put<ApiResponse<Product>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },

  async updateStock(id: number, quantity: number): Promise<Product> {
    const res = await api.patch<ApiResponse<Product>>(
      `${BASE}/${id}/stock`,
      null,
      { params: { quantity } }
    );
    return res.data.data;
  },

  async searchProducts(
    q: string
  ): Promise<{ content: Product[]; totalElements: number }> {
    const res = await api.get<
      ApiResponse<{ content: Product[]; totalElements: number }>
    >(`${BASE}/search`, {
      params: { q },
    });
    return res.data.data;
  },

  async getCompanyProducts(
    params: ProductFilterParams = {}
  ): Promise<PageableResponse<CompanyProduct>> {
    const query: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.keyword) query.keyword = params.keyword;
    if (params.categoryId) query.categoryId = params.categoryId;
    if (params.brandId) query.brandId = params.brandId;
    if (params.sort) query.sort = params.sort;

    const res = await api.get<ApiResponse<PageableResponse<CompanyProduct>>>(
      `${BASE}/company/search`,
      { params: query }
    );
    const data = res.data.data;
    // Flatten nested page object if it exists
    if (data.page) {
      return {
        ...data,
        totalPages: data.page.totalPages,
        totalElements: data.page.totalElements,
        size: data.page.size,
        number: data.page.number,
      };
    }
    return data;
  },

  async getCompanyProductById(id: number): Promise<CompanyProduct> {
    const res = await api.get<ApiResponse<CompanyProduct>>(
      `${BASE}/company/${id}`
    );
    return res.data.data;
  },
};

export default productService;
