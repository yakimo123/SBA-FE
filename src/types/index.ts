export type Page = 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'register' | 'account';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  points: number;
  address?: string;
}

// Review types
export interface Review {
  reviewId: number;
  userId: number;
  userFullName: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// Wishlist types
export interface WishlistItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  createdDate: string;
}

export interface Wishlist {
  wishlistId: number;
  userId: number;
  createdDate: string;
  items: WishlistItem[];
}

// Company types
export interface CompanyRequest {
  companyName: string;
  taxCode: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CompanyResponse {
  companyId: number;
  companyName: string;
  taxCode: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Product response from API
export interface ProductResponse {
  productId: number;
  productName: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  quantity: number;
  status: string;
  createdDate: string;
  supplierId: number;
  supplierName: string;
}

// B2B / Bulk Order types
export type BulkOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface BulkPriceTierResponse {
  bulkPriceTierId: number;
  minQty: number;
  unitPrice: number;
}

export interface OrderCustomizationResponse {
  customizationId: number;
  type: string;
  note: string;
  status: string;
  extraFee: number;
}

export interface BulkOrderDetailResponse {
  bulkOrderDetailId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceSnapshot: number;
  discountSnapshot: number;
  appliedTierPrice: number;
  customizationFee: number;
  lineTotal: number;
  priceTiers: BulkPriceTierResponse[];
  customizations: OrderCustomizationResponse[];
}

export interface BulkOrderResponse {
  bulkOrderId: number;
  userId: number;
  userFullName: string;
  companyId: number;
  companyName: string;
  createdAt: string;
  status: BulkOrderStatus;
  totalPrice: number;
  discountCode: string;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  discountApplied: boolean;
  details: BulkOrderDetailResponse[];
}

export interface BulkOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateBulkOrderRequest {
  companyId: number;
  voucherCode?: string;
  items: BulkOrderItemRequest[];
}

export interface CreateCustomizationRequest {
  type: string;
  note?: string;
  extraFee?: number;
}

export interface VoucherResponse {
  voucherId: number;
  voucherCode: string;
  description: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  validFrom: string;
  validTo: string;
  usageLimit: number;
  isValid: boolean;
}
