import { ApiResponse, Wishlist, WishlistItem } from '../types';
import api from './api';

/**
 * Wishlist Service
 * Handles all wishlist-related API calls
 */
class WishlistService {
  private readonly BASE_PATH = '/api/v1/wishlist';

  /**
   * Get user's wishlist
   * @param userId - User ID
   * @returns User's wishlist with all items
   */
  async getWishlist(userId: number): Promise<ApiResponse<Wishlist>> {
    const response = await api.get<ApiResponse<Wishlist>>(`${this.BASE_PATH}/${userId}`);
    return response.data;
  }

  /**
   * Add a product to wishlist
   * @param userId - User ID
   * @param productId - Product ID to add
   * @returns Created wishlist item
   */
  async addToWishlist(userId: number, productId: number): Promise<ApiResponse<WishlistItem>> {
    const response = await api.post<ApiResponse<WishlistItem>>(
      `${this.BASE_PATH}/${userId}/items/${productId}`
    );
    return response.data;
  }

  /**
   * Remove a product from wishlist
   * @param userId - User ID
   * @param productId - Product ID to remove
   * @returns Success response
   */
  async removeFromWishlist(userId: number, productId: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `${this.BASE_PATH}/${userId}/items/${productId}`
    );
    return response.data;
  }

  /**
   * Clear entire wishlist for a user
   * @param userId - User ID
   * @returns Success response
   */
  async clearWishlist(userId: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`${this.BASE_PATH}/${userId}`);
    return response.data;
  }

  /**
   * Check if a product is in user's wishlist
   * @param userId - User ID
   * @param productId - Product ID to check
   * @returns Boolean indicating if product is in wishlist
   */
  async checkProductInWishlist(userId: number, productId: number): Promise<ApiResponse<boolean>> {
    const response = await api.get<ApiResponse<boolean>>(
      `${this.BASE_PATH}/${userId}/items/${productId}/check`
    );
    return response.data;
  }
}

// Export singleton instance
const wishlistService = new WishlistService();
export default wishlistService;
