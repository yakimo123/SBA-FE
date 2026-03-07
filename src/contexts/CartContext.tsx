import { createContext, ReactNode, useContext, useState } from 'react';

import { CartItem } from '../types';
import { cartService } from '../services/cartService';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage on mount
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartService.getCart());

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const updated = cartService.addToCart(item);
    setCartItems([...updated]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cartService.updateQuantity(id, quantity);
    setCartItems([...updated]);
  };

  const removeFromCart = (id: string) => {
    const updated = cartService.removeFromCart(id);
    setCartItems([...updated]);
  };

  const clearCart = () => {
    cartService.clearCart();
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
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
