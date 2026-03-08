import { ApiResponse, PageResponse } from '../types/auth';
import api from './api';

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
}

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: {
    page?: number;
    size?: number;
    keyword?: string;
  }): Promise<PageResponse<UserResponse>> {
    const response = await api.get<ApiResponse<PageResponse<UserResponse>>>(
      '/api/v1/users',
      { params }
    );
    return response.data.data;
  },
};

export default userService;
