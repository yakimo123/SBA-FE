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

