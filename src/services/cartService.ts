import { AddToCartRequest, ApiResponse, CartResponse } from '../types';
import api from './api';

const cartService = {
  /**
   * GET /api/v1/cart/{userId}
   * Fetch (or auto-create) the cart for the given user.
   */
  getCart: (userId: number) =>
    api
      .get<ApiResponse<CartResponse>>(`/api/v1/cart/${userId}`)
      .then((r) => r.data),

  /**
   * POST /api/v1/cart/{userId}/items
   * Add an item (or increment quantity if already in cart).
   */
  addItem: (userId: number, request: AddToCartRequest) =>
    api
      .post<ApiResponse<CartResponse>>(`/api/v1/cart/${userId}/items`, request)
      .then((r) => r.data),

  /**
   * PATCH /api/v1/cart/{userId}/items/{productId}?quantity={qty}
   * Set the exact quantity for a cart item.
   */
  updateItemQuantity: (userId: number, productId: number, quantity: number) =>
    api
      .patch<ApiResponse<CartResponse>>(
        `/api/v1/cart/${userId}/items/${productId}`,
        null,
        { params: { quantity } },
      )
      .then((r) => r.data),

  /**
   * DELETE /api/v1/cart/{userId}/items/{productId}
   * Remove a single item from the cart.
   */
  removeItem: (userId: number, productId: number) =>
    api
      .delete<ApiResponse<void>>(`/api/v1/cart/${userId}/items/${productId}`)
      .then((r) => r.data),

  /**
   * DELETE /api/v1/cart/{userId}
   * Remove all items from the cart.
   */
  clearCart: (userId: number) =>
    api
      .delete<ApiResponse<void>>(`/api/v1/cart/${userId}`)
      .then((r) => r.data),
};

export default cartService;
