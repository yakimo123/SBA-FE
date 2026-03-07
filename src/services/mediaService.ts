import api from './api';
import {
    ApiResponse,
    CreateMediaRequest,
    Media,
    UpdateMediaRequest,
} from '../types/product';

const BASE = '/api/v1/media';

export const mediaService = {
    async uploadMedia(data: CreateMediaRequest): Promise<Media> {
        const res = await api.post<ApiResponse<Media>>(BASE, data);
        return res.data.data;
    },

    async getProductMedia(productId: number): Promise<Media[]> {
        const res = await api.get<ApiResponse<Media[]>>(`${BASE}/product/${productId}`);
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
};

export default mediaService;
