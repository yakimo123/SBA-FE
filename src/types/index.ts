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
}

