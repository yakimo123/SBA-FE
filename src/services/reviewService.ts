import {
  ApiResponse,
  CreateReviewRequest,
  PageableResponse,
  PaginationParams,
  Review,
  UpdateReviewRequest,
} from '../types';
import api from './api';

/**
 * Review Service
 * Handles all review-related API calls
 */
class ReviewService {
  private readonly BASE_PATH = '/api/v1/reviews';

  /**
   * Get all reviews with pagination
   * @param productId - Optional filter by product ID
   * @param userId - Optional filter by user ID
   * @param pagination - Pagination parameters
   * @returns Paginated list of reviews
   */
  async getReviews(
    productId?: number,
    userId?: number,
    pagination: PaginationParams = { page: 0, size: 10 }
  ): Promise<ApiResponse<PageableResponse<Review>>> {
    const params: Record<string, string | number | string[]> = {
      page: pagination.page,
      size: pagination.size,
    };

    if (productId !== undefined) {
      params.productId = productId;
    }

    if (userId !== undefined) {
      params.userId = userId;
    }

    if (pagination.sort && pagination.sort.length > 0) {
      params.sort = pagination.sort;
    }

    const response = await api.get<ApiResponse<PageableResponse<Review>>>(this.BASE_PATH, {
      params,
    });

    return response.data;
  }

  /**
   * Get a specific review by ID
   * @param id - Review ID
   * @returns Review details
   */
  async getReviewById(id: number): Promise<ApiResponse<Review>> {
    const response = await api.get<ApiResponse<Review>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Get average rating for a product
   * @param productId - Product ID
   * @returns Product rating data (returns empty data object)
   */
  async getProductRating(productId: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.get<ApiResponse<Record<string, never>>>(
      `${this.BASE_PATH}/product/${productId}/rating`
    );
    return response.data;
  }

  /**
   * Create a new review
   * @param userId - User ID creating the review
   * @param reviewData - Review data (productId, rating, comment)
   * @returns Created review
   */
  async createReview(userId: number, reviewData: CreateReviewRequest): Promise<ApiResponse<Review>> {
    const response = await api.post<ApiResponse<Review>>(this.BASE_PATH, reviewData, {
      params: { userId },
    });
    return response.data;
  }

  /**
   * Update an existing review
   * @param id - Review ID
   * @param reviewData - Updated review data (rating and/or comment)
   * @returns Updated review
   */
  async updateReview(id: number, reviewData: UpdateReviewRequest): Promise<ApiResponse<Review>> {
    const response = await api.put<ApiResponse<Review>>(`${this.BASE_PATH}/${id}`, reviewData);
    return response.data;
  }

  /**
   * Delete a review
   * @param id - Review ID
   * @returns Success response
   */
  async deleteReview(id: number): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }
}

// Export singleton instance
const reviewService = new ReviewService();
export default reviewService;
