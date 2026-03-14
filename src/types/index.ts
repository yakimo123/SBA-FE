export type Page =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'login'
  | 'register'
  | 'account';

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
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
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
export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface CompanyRequest {
  companyName: string;
  taxCode: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateCompanyRequest {
  companyName: string;
  taxCode: string;
  email: string;
  phone: string;
  representativeName: string;
  representativePosition: string;
  userId: number;
  address?: string;
  foundingDate?: string; // YYYY-MM-DD
  businessType?: string;
  employeeCount?: number;
  industry?: string;
  logoUrl?: string;
}

export interface CompanyResponse {
  companyId: number;
  companyName: string;
  taxCode: string;
  email?: string;
  phone?: string;
  address?: string;
  representativeName?: string;
  representativePosition?: string;
  website?: string;
  foundingDate?: string;
  businessType?: string;
  employeeCount?: number;
  industry?: string;
  status: CompanyStatus;
  logoUrl?: string;
  approvedAt?: string;
}

// Shopping Cart API types
export interface CartItemResponse {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  items: CartItemResponse[];
  totalAmount: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
  // B2B / Bulk Order types
}

export type BulkOrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

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
  items: {
    productId: string | number;
    quantity: number;
    customization?: string;
  }[];
  voucherCode?: string;
  note?: string;
}

export interface AddCustomizationRequest {
  customization: string;
}

// Banner types
export type BannerPosition = 'MAIN' | 'RIGHT_TOP' | 'RIGHT_BOTTOM';

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  buttonText: string;
  buttonLink: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  backgroundColor: string;
  textColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  main: Banner[];
  rightTop: Banner[];
  rightBottom: Banner[];
}
