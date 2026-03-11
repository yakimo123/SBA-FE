import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import bulkOrderService from '../services/bulkOrderService';
import { BulkOrderResponse, BulkOrderStatus, CreateBulkOrderRequest, CreateCustomizationRequest } from '../types';

interface BulkOrderContextType {
  orders: BulkOrderResponse[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (data: CreateBulkOrderRequest) => Promise<BulkOrderResponse>;
  cancelOrder: (orderId: number) => Promise<void>;
  updateStatus: (orderId: number, status: BulkOrderStatus) => Promise<void>;
  addCustomization: (detailId: number, data: CreateCustomizationRequest) => Promise<BulkOrderResponse>;
}

const BulkOrderContext = createContext<BulkOrderContextType | undefined>(undefined);

export function BulkOrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<BulkOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await bulkOrderService.search({ userId: user.userId, size: 100 });
      setOrders(data.content);
    } catch (err) {
      console.error('Failed to fetch bulk orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(async (data: CreateBulkOrderRequest): Promise<BulkOrderResponse> => {
    const result = await bulkOrderService.create(user!.userId, data);
    await fetchOrders();
    return result;
  }, [user, fetchOrders]);

  const cancelOrder = useCallback(async (orderId: number) => {
    await bulkOrderService.updateStatus(orderId, 'CANCELLED');
    await fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(async (orderId: number, status: BulkOrderStatus) => {
    await bulkOrderService.updateStatus(orderId, status);
    await fetchOrders();
  }, [fetchOrders]);

  const addCustomization = useCallback(async (detailId: number, data: CreateCustomizationRequest): Promise<BulkOrderResponse> => {
    const result = await bulkOrderService.addCustomization(detailId, data);
    await fetchOrders();
    return result;
  }, [fetchOrders]);

  return (
    <BulkOrderContext.Provider value={{ orders, loading, fetchOrders, createOrder, cancelOrder, updateStatus, addCustomization }}>
      {children}
    </BulkOrderContext.Provider>
  );
}

export function useBulkOrders() {
  const ctx = useContext(BulkOrderContext);
  if (!ctx) throw new Error('useBulkOrders must be used within BulkOrderProvider');
  return ctx;
}

