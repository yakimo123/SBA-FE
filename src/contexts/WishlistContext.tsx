import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import wishlistService from '../services/wishlistService';
import { WishlistItem } from '../types';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.userId ?? null;

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await wishlistService.getWishlist(userId);
      setWishlistItems(res.data?.items ?? []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = async (productId: number) => {
    if (!userId) return;
    try {
      await wishlistService.addToWishlist(userId, productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!userId) return;
    try {
      await wishlistService.removeFromWishlist(userId, productId);
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const clearWishlist = async () => {
    if (!userId) return;
    try {
      await wishlistService.clearWishlist(userId);
      setWishlistItems([]);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  const isInWishlist = useCallback(
    (productId: number) => wishlistItems.some((item) => item.productId === productId),
    [wishlistItems]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, isLoading, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
