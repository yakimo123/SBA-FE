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

// B2B / Bulk Order types
export type BulkOrderStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface TierPrice {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  discountPercent: number;
}

export interface BulkOrderItem {
  productId: string | number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  tierPrice?: TierPrice;
  subtotal: number;
  customization?: string;
}

export interface BulkOrder {
  orderId: string;
  companyId: number;
  companyName: string;
  status: BulkOrderStatus;
  items: BulkOrderItem[];
  voucherCode?: string;
  voucherDiscount: number;
  subtotal: number;
  total: number;
  note?: string;
  customization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBulkOrderRequest {
  items: { productId: string | number; quantity: number; customization?: string }[];
  voucherCode?: string;
  note?: string;
}

export interface AddCustomizationRequest {
  customization: string;
}
