import { FileType } from '../constants/FILE_TYPES';
import {
  ApiResponse,
  CreateMediaRequest,
  Media,
  UpdateMediaRequest,
  UploadUrlResponse,
} from '../types/product';
import { compressImage, sanitizeFileName } from '../utils/fileUtils';
import api from './api';

const BASE = '/api/v1/media';
const FILES_BASE = '/api/v1/files';

export const mediaService = {
  async uploadMedia(data: CreateMediaRequest): Promise<Media> {
    const res = await api.post<ApiResponse<Media>>(BASE, data);
    return res.data.data;
  },

  async getProductMedia(productId: number): Promise<Media[]> {
    const res = await api.get<ApiResponse<Media[]>>(
      `${BASE}/product/${productId}`
    );
    return res.data.data;
  },

  async getMediaById(id: number): Promise<Media> {
    const res = await api.get<ApiResponse<Media>>(`${BASE}/${id}`);
    return res.data.data;
  },

  async updateMedia(id: number, data: UpdateMediaRequest): Promise<Media> {
    const res = await api.put<ApiResponse<Media>>(`${BASE}/${id}`, data);
    return res.data.data;
  },

  async updateSortOrder(id: number, sortOrder: number): Promise<Media> {
    const res = await api.patch<ApiResponse<Media>>(
      `${BASE}/${id}/sort-order`,
      null,
      { params: { sortOrder } }
    );
    return res.data.data;
  },

  async deleteMedia(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },

  async getUploadUrl(
    fileName: string,
    fileType: FileType
  ): Promise<UploadUrlResponse> {
    const res = await api.get<ApiResponse<UploadUrlResponse>>(
      `${FILES_BASE}/upload-url`,
      {
        params: { fileName, fileType },
      }
    );
    return res.data.data;
  },

  async uploadFile(file: File, fileType: FileType): Promise<string> {
    // Step 0: Compress image if applicable
    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    }

    // Step 1: Get presigned URL
    const safeFileName = sanitizeFileName(fileToUpload.name);
    const response = await mediaService.getUploadUrl(safeFileName, fileType);

    if (!response || !response.uploadUrl || !response.publicUrl) {
      throw new Error(
        'Upload URL or Public URL is missing from server response'
      );
    }

    const { uploadUrl, publicUrl } = response;

    // Step 2: Upload binary data
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileToUpload,
      headers: {
        'Content-Type': fileToUpload.type,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('S3 Upload Error:', errorText);
      throw new Error(`Upload failed with status ${res.status}`);
    }

    // Step 3: Return public URL
    return publicUrl;
  },
};

export default mediaService;
