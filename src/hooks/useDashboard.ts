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
        kpisRes,
        revenueRes,
        orderStatusRes,
        topProductsRes,
        customerGrowthRes,
        recentOrdersRes,
      ] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRevenueTrend(30),
        dashboardService.getOrderStatusStats(),
        dashboardService.getTopProducts(8),
        dashboardService.getCustomerGrowth(6),
        dashboardService.getRecentOrders(5),
      ]);

      // Assigning data assuming API wraps success response in a standard structure
      // e.g. axios interceptors unpacking it, or standard { data: { data: ... } } response
      // For standard Axios setups (like assumed in your api.ts), data is often in res.data or res.data.data

      // Let's assume standard Axios response holding our structured ApiResponse object: { code, message, data }
      // The `api.get` typically unwraps the `axios` top-level data, returning our structured object.
      // Using generic logic here. If `api.get` already returns the actual data body, adjust accordingly.

      const kpisData = (kpisRes as any).data || kpisRes;
      const revenueInfo = (revenueRes as any).data || revenueRes;
      const orderStatusInfo = (orderStatusRes as any).data || orderStatusRes;
      const topProductsInfo = (topProductsRes as any).data || topProductsRes;
      const customerGrowthInfo =
        (customerGrowthRes as any).data || customerGrowthRes;
      const recentOrdersInfo = (recentOrdersRes as any).data || recentOrdersRes;

      setKpis(kpisData);
      setRevenueData(Array.isArray(revenueInfo) ? revenueInfo : []);

      // Process pie chart colors if API doesn't send them
      const colorMap: Record<string, string> = {
        Pending: '#F59E0B',
        Processing: '#3B82F6',
        Shipped: '#8B5CF6',
        Delivered: '#10B981',
        Cancelled: '#EF4444',
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
