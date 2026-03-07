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
  getKPIs: () => {
    return api.get<KPIStats>('/api/v1/admin/dashboard/kpis');
  },

  getRevenueTrend: (days: number = 30) => {
    return api.get<RevenueTrendItem[]>(
      '/api/v1/admin/dashboard/revenue-trend',
      {
        params: { days },
      }
    );
  },

  getOrderStatusStats: (startDate?: string, endDate?: string) => {
    return api.get<OrderStatusStatItem[]>(
      '/api/v1/admin/dashboard/order-status-stats',
      {
        params: { startDate, endDate },
      }
    );
  },

  getTopProducts: (limit: number = 8) => {
    return api.get<TopProductItem[]>('/api/v1/admin/dashboard/top-products', {
      params: { limit },
    });
  },

  getCustomerGrowth: (months: number = 6) => {
    return api.get<CustomerGrowthItem[]>(
      '/api/v1/admin/dashboard/customer-growth',
      {
        params: { months },
      }
    );
  },

  getRecentOrders: (limit: number = 5) => {
    return api.get<RecentOrderItem[]>('/api/v1/admin/dashboard/orders/recent', {
      params: { limit },
    });
  },
};
