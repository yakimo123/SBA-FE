import { ApiResponse } from '../types/auth';
import api from './api';

export interface VNPayPaymentUrlResponse {
  paymentUrl: string;
  txnRef: string;
  orderId: number;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentTransactionResponse {
  id: number;
  txnRef: string;
  orderId: number;
  amount: number;
  bankCode: string;
  bankTranNo: string;
  cardType: string;
  responseCode: string;
  transactionNo: string;
  transactionStatus: string;
  payDate: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

const ENDPOINTS = {
  CREATE_PAYMENT: '/api/v1/payments/vnpay/create',
  RETURN: '/api/v1/payments/vnpay/return',
  TRANSACTIONS_BY_ORDER: (orderId: number) => `/api/v1/payments/orders/${orderId}`,
};

export const vnpayService = {
  async createPaymentUrl(orderId: number): Promise<VNPayPaymentUrlResponse> {
    const response = await api.post<ApiResponse<VNPayPaymentUrlResponse>>(
      ENDPOINTS.CREATE_PAYMENT,
      null,
      { params: { orderId } }
    );
    return response.data.data;
  },

  async processReturn(
    params: Record<string, string>
  ): Promise<PaymentTransactionResponse> {
    const response = await api.get<ApiResponse<PaymentTransactionResponse>>(
      ENDPOINTS.RETURN,
      { params }
    );
    return response.data.data;
  },

  async getTransactionsByOrder(
    orderId: number
  ): Promise<PaymentTransactionResponse[]> {
    const response = await api.get<ApiResponse<PaymentTransactionResponse[]>>(
      ENDPOINTS.TRANSACTIONS_BY_ORDER(orderId)
    );
    return response.data.data;
  },
};
