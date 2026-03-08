import { useCallback, useEffect, useState } from 'react';

import {
  CustomerGrowthItem,
  dashboardService,
  KPIStats,
  OrderStatusStatItem,
  RecentOrderItem,
  RevenueTrendItem,
  TopProductItem,
} from '../services/dashboardService';

export function useDashboard() {
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueTrendItem[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusStatItem[]>(
    []
  );
  const [topProductsData, setTopProductsData] = useState<TopProductItem[]>([]);
  const [customerGrowthData, setCustomerGrowthData] = useState<
    CustomerGrowthItem[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Execute all requests concurrently using Promise.allSettled to ensure
      // failure of one doesn't stop others, or Promise.all if they must all succeed.
      // We will use Promise.all to fetch them simultaneously for optimization as requested.
      const [
        kpisData,
        revenueInfo,
        orderStatusInfo,
        topProductsInfo,
        customerGrowthInfo,
        recentOrdersInfo,
      ] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRevenueTrend(30),
        dashboardService.getOrderStatusStats(),
        dashboardService.getTopProducts(8),
        dashboardService.getCustomerGrowth(6),
        dashboardService.getRecentOrders(5),
      ]);

      setKpis(kpisData);
      setRevenueData(Array.isArray(revenueInfo) ? revenueInfo : []);

      // Process pie chart colors if API doesn't send them
      const colorMap: Record<string, string> = {
        Pending: '#F59E0B',
        PENDING: '#F59E0B',
        Processing: '#3B82F6',
        PROCESSING: '#3B82F6',
        Shipped: '#8B5CF6',
        SHIPPED: '#8B5CF6',
        Delivered: '#10B981',
        DELIVERED: '#10B981',
        Cancelled: '#EF4444',
        CANCELLED: '#EF4444',
      };

      const processedOrderStatusData = Array.isArray(orderStatusInfo)
        ? orderStatusInfo.map((item: OrderStatusStatItem) => ({
            ...item,
            color: colorMap[item.name as string] || '#8884d8',
          }))
        : [];

      setOrderStatusData(processedOrderStatusData);
      setTopProductsData(Array.isArray(topProductsInfo) ? topProductsInfo : []);
      setCustomerGrowthData(
        Array.isArray(customerGrowthInfo) ? customerGrowthInfo : []
      );
      setRecentOrders(Array.isArray(recentOrdersInfo) ? recentOrdersInfo : []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data', err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Error fetching dashboard data'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    kpis,
    revenueData,
    orderStatusData,
    topProductsData,
    customerGrowthData,
    recentOrders,
    isLoading,
    error,
    refreshData: fetchDashboardData,
  };
}
