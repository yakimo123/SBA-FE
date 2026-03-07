import { ApiResponse } from '../types';
import api from './api';

// Matches MediaResponse from backend API docs
export interface MediaDTO {
  mediaId: number;
  productId: number;
  type: string;       // "IMAGE" or "VIDEO"
  url: string;
  sortOrder: number;
}

class MediaService {
  private readonly BASE_PATH = '/api/v1/media';

  /**
   * Get all media for a product
   */
  async getProductMedia(productId: number): Promise<ApiResponse<MediaDTO[]>> {
    const response = await api.get<ApiResponse<MediaDTO[]>>(
      `${this.BASE_PATH}/product/${productId}`
    );
    return response.data;
  }
}

const mediaService = new MediaService();
export default mediaService;
