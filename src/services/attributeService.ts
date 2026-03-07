import api from './api';
import {
    ApiResponse,
    Attribute,
    AttributePage,
    CreateProductAttributeRequest,
    ProductAttribute,
    UpdateProductAttributeRequest,
} from '../types/product';

const ATTR_BASE = '/api/v1/attributes';
const PROD_ATTR_BASE = '/api/v1/product-attributes';

// ─── Attribute (global) ───────────────────────────────────────────────────────
export const attributeService = {
    async createAttribute(attributeName: string): Promise<Attribute> {
        const res = await api.post<ApiResponse<Attribute>>(ATTR_BASE, null, {
            params: { attributeName },
        });
        return res.data.data;
    },

    async getAttributes(page = 0, size = 10, keyword?: string): Promise<AttributePage> {
        const params: Record<string, unknown> = { page, size };
        if (keyword) params.keyword = keyword;
        const res = await api.get<ApiResponse<AttributePage>>(ATTR_BASE, { params });
        return res.data.data;
    },

    async getAttributeById(id: number): Promise<Attribute> {
        const res = await api.get<ApiResponse<Attribute>>(`${ATTR_BASE}/${id}`);
        return res.data.data;
    },

    async updateAttribute(id: number, attributeName: string): Promise<Attribute> {
        const res = await api.put<ApiResponse<Attribute>>(`${ATTR_BASE}/${id}`, null, {
            params: { attributeName },
        });
        return res.data.data;
    },

    async deleteAttribute(id: number): Promise<void> {
        await api.delete(`${ATTR_BASE}/${id}`);
    },
};

// ─── Product Attribute ────────────────────────────────────────────────────────
export const productAttributeService = {
    async createProductAttribute(data: CreateProductAttributeRequest): Promise<ProductAttribute> {
        const res = await api.post<ApiResponse<ProductAttribute>>(PROD_ATTR_BASE, data);
        return res.data.data;
    },

    async getProductAttributes(productId: number): Promise<ProductAttribute[]> {
        const res = await api.get<ApiResponse<ProductAttribute[]>>(
            `${PROD_ATTR_BASE}/product/${productId}`
        );
        return res.data.data;
    },

    async getProductAttributeById(id: number): Promise<ProductAttribute> {
        const res = await api.get<ApiResponse<ProductAttribute>>(`${PROD_ATTR_BASE}/${id}`);
        return res.data.data;
    },

    async updateProductAttribute(
        id: number,
        data: UpdateProductAttributeRequest
    ): Promise<ProductAttribute> {
        const res = await api.put<ApiResponse<ProductAttribute>>(`${PROD_ATTR_BASE}/${id}`, data);
        return res.data.data;
    },

    async deleteProductAttribute(id: number): Promise<void> {
        await api.delete(`${PROD_ATTR_BASE}/${id}`);
    },
};

export default attributeService;
