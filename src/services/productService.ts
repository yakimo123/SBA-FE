import { ApiResponse, PageableResponse } from '../types';
import api from './api';

// Matches ProductResponse from backend API docs
export interface ProductDTO {
  productId: number;
  productName: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  quantity: number;
  status: string; // "ACTIVE" | "INACTIVE"
  createdDate: string;
  supplierId: number;
  supplierName: string;
}

export interface ProductListParams {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

class ProductService {
  private readonly BASE_PATH = '/api/v1/products';

  /**
   * Get all products with pagination and filters
   */
  async getProducts(
    params?: ProductListParams
  ): Promise<ApiResponse<PageableResponse<ProductDTO>>> {

    const response = await api.get<ApiResponse<PageableResponse<ProductDTO>>>(this.BASE_PATH, {
      params,
    });

    return response.data;
  }

  /**
   * Get a specific product by ID
   */
  async getProductById(id: number): Promise<ApiResponse<ProductDTO>> {
    const response = await api.get<ApiResponse<ProductDTO>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }
}

const productService = new ProductService();
export default productService;

