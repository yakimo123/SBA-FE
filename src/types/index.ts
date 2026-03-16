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
export type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEED_DOCUMENTS';

export interface CompanyRequest {
  companyName: string;
  taxCode: string;
  email: string;
  phone: string;
  address?: string;
  representativeName?: string;
  representativePosition?: string;
  foundingDate?: string;
  businessType?: string;
  employeeCount?: number;
  industry?: string;
  logoUrl?: string;
  status?: CompanyStatus;
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
  createdAt?: string;
  userId?: number;
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
  | 'PENDING_REVIEW'
  | 'CONFIRMED'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface TierPrice {
  minQty: number;
  unitPrice: number;
}

export interface BulkPriceTier {
  bulkPriceTierId: number;
  productId: number;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  isActive: boolean;
  discountPercent: number;
  createdAt?: string;
}

export interface BulkOrderCustomization {
  customizationId?: number;
  type: string;
  note?: string;
  status?: string;
  extraFee: number;
  feeType?: string | null;
  totalFee?: number;
  adminNote?: string | null;
}

export interface BulkOrderDetail {
  bulkOrderDetailId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceSnapshot: number | null;
  discountSnapshot: number | null;
  appliedTierPrice: number;
  customizationFee?: number; // Old field, keeping for compatibility
  customizationFeeConfirmed?: number;
  customizationFeePending?: number;
  lineTotal: number;
  productImage?: string;
  basePrice?: number;
  tierLabel?: string | null;
  priceTiers?: TierPrice[];
  customizations: BulkOrderCustomization[];
}

/** Cart-local item used while building a bulk order */
export interface BulkOrderItem {
  productId: string | number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  /** Currently-active tier (local calculation) */
  activeTierPrice?: number;
  subtotal: number;
  customizations?: { type: string; note?: string }[];
}

export interface BulkOrder {
  bulkOrderId: number;
  userId: number;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  companyId: number;
  companyName: string;
  status: BulkOrderStatus;
  createdAt: string;
  updatedAt: string | null;
  subtotalAfterTier: number;
  voucherCode?: string | null;
  voucherType?: string | null;
  voucherDiscountAmount?: number;
  shippingFee: number;
  shippingFeeWaived: boolean;
  finalPrice: number;
  discountApplied: boolean;
  cancelReason?: string | null;
  adminNote?: string | null;
  basePriceTotal?: number;
  tierDiscountTotal?: number;
  customizationFeeConfirmed?: number;
  customizationFeePending?: number;
  hasPendingCustomization?: boolean;
  shippingAddress: string | null;
  details: BulkOrderDetail[];
}

export interface CreateBulkOrderRequest {
  voucherCode?: string;
  shippingAddress?: string;
  items: {
    productId: number;
    quantity: number;
    customizations?: {
      type: string;
      note?: string;
    }[];
  }[];
}

export interface AddCustomizationRequest {
  type: string;
  note?: string;
  extraFee: number;
}

export interface BulkOrderListParams {
  userId?: number;
  companyId?: number;
  status?: BulkOrderStatus;
  createdAtFrom?: string;
  createdAtTo?: string;
  page?: number;
  size?: number;
  sort?: string;
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
