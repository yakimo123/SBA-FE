import { ApiResponse } from '../types/auth';
import api from './api';

export interface KPIStats {
  totalRevenue: { value: number; change: number };
  ordersToday: { value: number; change: number };
  activeProducts: { value: number; change: number };
  totalCustomers: { value: number; change: number };
}

export interface RevenueTrendItem {
  day: string;
  revenue: number;
}

export interface OrderStatusStatItem {
  name: string;
  value: number;
  color?: string;
}

export interface TopProductItem {
  product: string;
  sales: number;
}

export interface CustomerGrowthItem {
  month: string;
  customers: number;
}

export interface RecentOrderItem {
  id: string;
  orderCode?: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

export const dashboardService = {
  getKPIs: async () => {
    const response = await api.get<ApiResponse<KPIStats>>(
      '/api/v1/admin/dashboard/kpis'
    );
    return response.data.data;
  },

  getRevenueTrend: async (days: number = 30) => {
    const response = await api.get<ApiResponse<RevenueTrendItem[]>>(
      '/api/v1/admin/dashboard/revenue-trend',
      {
        params: { days },
      }
    );
    return response.data.data;
  },

  getOrderStatusStats: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<OrderStatusStatItem[]>>(
      '/api/v1/admin/dashboard/order-status-stats',
      {
        params: { startDate, endDate },
      }
    );
    return response.data.data;
  },

  getTopProducts: async (limit: number = 8) => {
    const response = await api.get<ApiResponse<TopProductItem[]>>(
      '/api/v1/admin/dashboard/top-products',
      {
        params: { limit },
      }
    );
    return response.data.data;
  },

  getCustomerGrowth: async (months: number = 6) => {
    const response = await api.get<ApiResponse<CustomerGrowthItem[]>>(
      '/api/v1/admin/dashboard/customer-growth',
      {
        params: { months },
      }
    );
    return response.data.data;
  },

  getRecentOrders: async (limit: number = 5) => {
    const response = await api.get<ApiResponse<RecentOrderItem[]>>(
      '/api/v1/admin/dashboard/orders/recent',
      {
        params: { limit },
      }
    );
    return response.data.data;
  },
};
