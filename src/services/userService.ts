import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

export interface UserResponse {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  isActive: boolean;
  registrationDate: string;
  status: string;
  rewardPoint: number;
}

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: {
    page?: number;
    size?: number;
    keyword?: string;
    role?: string;
  }): Promise<PageResponse<UserResponse>> {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>(
      '/api/v1/users',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string | number): Promise<UserResponse> {
    const response = await api.get<ApiResponse<UserResponse>>(
      `/api/v1/users/${id}`
    );
    return response.data.data;
  },

  /**
   * Update user information by ID
   */
  async updateUser(
    id: string | number,
    data: {
      fullName?: string;
      phoneNumber?: string;
      address?: string;
      status?: string;
    }
  ): Promise<UserResponse> {
    const response = await api.put<ApiResponse<UserResponse>>(
      `/api/v1/users/${id}`,
      data
    );
    return response.data.data;
  },
};

export default userService;
