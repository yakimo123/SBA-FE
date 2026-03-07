import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import cartService from '../services/cartService';
import { CartItem, CartResponse } from '../types';
import { useAuth } from './AuthContext';

// Map productId → {image, category} for display fields not returned by the API
type ItemMeta = { image: string; category: string };

interface CartContextType {
  cartItems: CartItem[];
  cartData: CartResponse | null;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.userId ?? null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Persists image/category locally since the API doesn't return them
  const itemMetaRef = useRef<Record<number, ItemMeta>>({});

  const mapToCartItems = useCallback((data: CartResponse): CartItem[] => {
    return data.items.map((item) => ({
      id: item.productId.toString(),
      name: item.productName,
      price: Number(item.price),
      quantity: item.quantity,
      image: itemMetaRef.current[item.productId]?.image ?? '',
      category: itemMetaRef.current[item.productId]?.category ?? '',
    }));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      setCartData(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await cartService.getCart(userId);
      setCartData(res.data);
      setCartItems(mapToCartItems(res.data));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, mapToCartItems]);

  // Re-sync cart whenever the authenticated user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    const productId = Number(item.id);

    // Always persist display meta
    itemMetaRef.current[productId] = { image: item.image, category: item.category };

    if (!userId) {
      // Unauthenticated: fall back to local state
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      return;
    }

    try {
      const res = await cartService.addItem(userId, { productId, quantity: 1 });
      setCartData(res.data);
      setCartItems(mapToCartItems(res.data));
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!userId) {
      if (quantity <= 0) {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
      }
      return;
    }

    const productId = Number(id);
    try {
      if (quantity <= 0) {
        await cartService.removeItem(userId, productId);
        await refreshCart();
      } else {
        const res = await cartService.updateItemQuantity(userId, productId, quantity);
        setCartData(res.data);
        setCartItems(mapToCartItems(res.data));
      }
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!userId) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }

    try {
      await cartService.removeItem(userId, Number(id));
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  };

  const clearCart = async () => {
    if (!userId) {
      setCartItems([]);
      return;
    }

    try {
      await cartService.clearCart(userId);
      setCartItems([]);
      setCartData(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, cartData, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
