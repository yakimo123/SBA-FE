import api from './api';

/**
 * Bulk Order Export Service
 * Handles export of order confirmation and invoice for bulk orders
 */
const BASE = '/api/v1/bulk-orders';

export interface FileWithType {
    blob: Blob;
    extension: string;
}

function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}

async function handleBase64XlsxResponse(promise: Promise<any>): Promise<FileWithType> {
    const res = await promise;
    // Dạng ApiResponse<String> với data là base64
    const base64 = res.data?.data;
    if (base64 && typeof base64 === 'string') {
        const blob = base64ToBlob(base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return { blob, extension: 'xlsx' };
    }
    // Nếu lỗi, trả về thông báo lỗi
    let errorText = '';
    try {
        errorText = res.data?.message || JSON.stringify(res.data) || 'Tải file thất bại (không phải base64 xlsx).';
    } catch {
        errorText = 'Tải file thất bại (không phải base64 xlsx).';
    }
    throw new Error(errorText);
}

const bulkOrderExportService = {
    /**
     * Get order confirmation file for a bulk order (xlsx base64)
     */
    async getOrderConfirmation(bulkOrderId: number | string): Promise<FileWithType> {
        return handleBase64XlsxResponse(
            api.get(`${BASE}/${bulkOrderId}/export/order-confirmation`)
        );
    },

    /**
     * Get invoice file for a bulk order (xlsx base64)
     */
    async getInvoice(bulkOrderId: number | string): Promise<FileWithType> {
        return handleBase64XlsxResponse(
            api.get(`${BASE}/${bulkOrderId}/export/invoice`)
        );
    },
};

export default bulkOrderExportService;
