import {
  ApiResponse,
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
    const res = await api.get<ApiResponse<ProductPage>>(BASE, { params: query });
    return res.data.data;
  },

  async getProductById(id: number): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`${BASE}/${id}`);
    return res.data.data;
  },

  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
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
};

export default productService;
