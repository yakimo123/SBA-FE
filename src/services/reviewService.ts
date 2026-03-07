import api from './api';
import { ApiResponse, PageResponse } from '../types/auth';

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
}

export interface ReviewListParams {
    productId?: number;
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
}

export interface CreateReviewRequest {
    productId: number;
    rating: number;
    comment: string;
}

const ENDPOINTS = {
    REVIEWS: '/api/v1/reviews',
    PRODUCT_RATING: (productId: string | number) => `/api/v1/reviews/product/${productId}/rating`,
};

export const reviewService = {
    // Returns average rating as a number (e.g. 4.5)
    async getProductRating(productId: string | number): Promise<number> {
        const response = await api.get<ApiResponse<number>>(ENDPOINTS.PRODUCT_RATING(productId));
        return response.data.data;
    },

    // Returns paginated list of reviews
    async getReviews(params?: ReviewListParams): Promise<PageResponse<ReviewResponse>> {
        const response = await api.get<ApiResponse<PageResponse<ReviewResponse>>>(ENDPOINTS.REVIEWS, { params });
        return response.data.data;
    },

    // Create a review for a product
    async createReview(userId: number, data: CreateReviewRequest): Promise<ReviewResponse> {
        const response = await api.post<ApiResponse<ReviewResponse>>(ENDPOINTS.REVIEWS, data, {
            params: { userId },
        });
        return response.data.data;
    },
};

export default reviewService;

