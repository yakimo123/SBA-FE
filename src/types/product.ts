import { PageableResponse } from './index';

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

// ─── CATEGORY ─────────────────────────────────────────────────────────────────
export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCategoryRequest {
  categoryName: string;
  description?: string;
  imageUrl?: string;
}

export type CategoryPage = PageableResponse<Category>;

// ─── BRAND ────────────────────────────────────────────────────────────────────
export interface Brand {
  brandId: number;
  brandName: string;
  country?: string;
  description?: string;
  logoUrl?: string;
  isPartner?: boolean;
}

export interface CreateBrandRequest {
  brandName: string;
  country?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateBrandRequest {
  brandName: string;
  country?: string;
  description?: string;
  logoUrl?: string;
}

export type BrandPage = PageableResponse<Brand>;

// ─── SUPPLIER ─────────────────────────────────────────────────────────────────
export interface Supplier {
  supplierId: number;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

export interface CreateSupplierRequest {
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

export type SupplierPage = PageableResponse<Supplier>;

// ─── PRODUCT ──────────────────────────────────────────────────────────────────
export type ProductStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK';

export interface Product {
  productId: number;
  productName: string;
  description?: string;
  descriptionDetails?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  soldCount?: number;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  supplierId?: number;
  supplierName?: string;
  quantity: number;
  status: ProductStatus;
  mainImage?: string;
  imageUrls?: string[];
}

export interface BulkPriceTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  discountPercent: number;
  isActive: boolean;
}

export interface CompanyProduct extends Product {
  priceTiers: BulkPriceTier[];
}

export interface CreateProductRequest {
  productName: string;
  description?: string;
  descriptionDetails?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryId?: number;
  brandId?: number;
  supplierId?: number;
  quantity?: number;
  status?: ProductStatus;
  imageUrls?: string[];
}

export interface UpdateProductRequest {
  productName: string;
  description?: string;
  descriptionDetails?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryId?: number;
  brandId?: number;
  supplierId?: number;
  quantity?: number;
  status?: ProductStatus;
  imageUrls?: string[];
}

export interface ProductFilterParams {
  keyword?: string;
  categoryId?: number;
  brandId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export type ProductPage = PageableResponse<Product>;

// ─── MEDIA ────────────────────────────────────────────────────────────────────
export type MediaType = 'IMAGE' | 'VIDEO';

export interface Media {
  mediaId: number;
  productId: number;
  type: MediaType;
  url: string;
  sortOrder?: number;
}

export interface CreateMediaRequest {
  productId: number;
  type: MediaType;
  url: string;
  sortOrder?: number;
}

export interface UpdateMediaRequest {
  productId: number;
  type: MediaType;
  url: string;
  sortOrder?: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

// ─── ATTRIBUTE ────────────────────────────────────────────────────────────────
export interface Attribute {
  attributeId: number;
  attributeName: string;
}

export type AttributePage = PageableResponse<Attribute>;

// ─── PRODUCT ATTRIBUTE ────────────────────────────────────────────────────────
export interface ProductAttribute {
  productAttributeId: number;
  productId: number;
  attributeId: number;
  attributeName?: string;
  value: string;
}

export interface CreateProductAttributeRequest {
  productId: number;
  attributeId: number;
  value: string;
}

export interface UpdateProductAttributeRequest {
  value: string;
}
