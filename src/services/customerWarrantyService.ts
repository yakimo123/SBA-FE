import api from './api';

export interface CustomerWarrantyResponse {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  orderId: number | null;
  bulkOrderId: number | null;
  orderType: 'NORMAL' | 'BULK';
  quantity: number;
  warrantyMonths: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'VOIDED';
  daysRemaining: number;
  isExpired: boolean;
  notes: string | null;
}

export const customerWarrantyService = {
  getMyWarranties: async (): Promise<CustomerWarrantyResponse[]> => {
    const res = await api.get('/api/v1/warranties/customer/my');
    return res.data.data;
  },
  getMyActiveWarranties: async (): Promise<CustomerWarrantyResponse[]> => {
    const res = await api.get('/api/v1/warranties/customer/my/active');
    return res.data.data;
  },
};
