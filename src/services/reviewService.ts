import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

// Matches ReviewResponse from backend API
export interface ReviewResponse {
    reviewId: number;
    userId: number;
    userFullName: string;
    productId: number;
    productName: string;
    rating: number;
    comment: string;
    reviewDate: string;
    replyComment?: string;
    replyDate?: string;
    repliedByUserId?: number;
    repliedByFullName?: string;
}

export interface RatingStatsResponse {
    productId: number;
    averageRating: number;
    totalReviews: number;
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
}

export interface ReviewListParams {
    productId?: number;
    userId?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
}

export interface CreateReviewRequest {
    productId: number;
    rating: number;
    comment: string;
}

export interface UpdateReviewRequest {
    rating: number;
    comment: string;
}

export interface ReplyReviewRequest {
    replyComment: string;
}

const ENDPOINTS = {
    REVIEWS: '/api/v1/reviews',
    REVIEW_BY_ID: (id: number) => `/api/v1/reviews/${id}`,
    REVIEW_REPLY: (id: number) => `/api/v1/reviews/${id}/reply`,
    PRODUCT_RATING: (productId: string | number) => `/api/v1/reviews/product/${productId}/rating`,
    PRODUCT_RATING_STATS: (productId: string | number) => `/api/v1/reviews/product/${productId}/rating-stats`,
};

export const reviewService = {
    // Returns average rating as a number (e.g. 4.5)
    async getProductRating(productId: string | number): Promise<number> {
        const response = await api.get<ApiResponse<number>>(ENDPOINTS.PRODUCT_RATING(productId));
        return response.data.data;
    },

    // Returns rating statistics (breakdown by stars)
    async getRatingStats(productId: string | number): Promise<RatingStatsResponse> {
        const response = await api.get<ApiResponse<RatingStatsResponse>>(ENDPOINTS.PRODUCT_RATING_STATS(productId));
        return response.data.data;
    },

    // Returns paginated list of reviews
    async getReviews(params?: ReviewListParams): Promise<PageResponse<ReviewResponse>> {
        const response = await api.get<ApiResponse<PageResponse<ReviewResponse>>>(ENDPOINTS.REVIEWS, { params });
        return response.data.data;
    },

    // Get single review by ID
    async getReviewById(id: number): Promise<ReviewResponse> {
        const response = await api.get<ApiResponse<ReviewResponse>>(ENDPOINTS.REVIEW_BY_ID(id));
        return response.data.data;
    },

    // Create a review for a product
    async createReview(userId: number, data: CreateReviewRequest): Promise<ReviewResponse> {
        const response = await api.post<ApiResponse<ReviewResponse>>(ENDPOINTS.REVIEWS, data, {
            params: { userId },
        });
        return response.data.data;
    },

    // Update a review
    async updateReview(id: number, data: UpdateReviewRequest): Promise<ReviewResponse> {
        const response = await api.put<ApiResponse<ReviewResponse>>(ENDPOINTS.REVIEW_BY_ID(id), data);
        return response.data.data;
    },

    // Delete a review
    async deleteReview(id: number): Promise<void> {
        await api.delete(ENDPOINTS.REVIEW_BY_ID(id));
    },

    // Reply to a review (admin)
    async replyToReview(id: number, adminUserId: number, data: ReplyReviewRequest): Promise<ReviewResponse> {
        const response = await api.post<ApiResponse<ReviewResponse>>(ENDPOINTS.REVIEW_REPLY(id), data, {
            params: { adminUserId },
        });
        return response.data.data;
    },
};

export default reviewService;

