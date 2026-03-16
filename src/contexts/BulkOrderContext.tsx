import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import bulkOrderService from '../services/bulkOrderService';
import { BulkOrder } from '../types';
import { useAuth } from './AuthContext';

interface BulkOrderContextType {
  orders: BulkOrder[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  cancelOrder: (orderId: number, reason?: string) => Promise<void>;
}

const BulkOrderContext = createContext<BulkOrderContextType | undefined>(
  undefined
);

export function BulkOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userId =
        typeof user.userId === 'string'
          ? parseInt(user.userId, 10)
          : user.userId;
      const companyId = user.companyId
        ? typeof user.companyId === 'string'
          ? parseInt(user.companyId as string, 10)
          : user.companyId
        : undefined;
      const res = await bulkOrderService.getOrders({
        userId,
        companyId,
        page: 0,
        size: 50,
      });
      setOrders(res.content);
    } catch {
      // handle error if needed
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const cancelOrder = useCallback(
    async (orderId: number, reason?: string) => {
      try {
        await bulkOrderService.cancelOrder(orderId, reason);
        await refreshOrders();
      } catch {
        // handle error
      }
    },
    [refreshOrders]
  );

  return (
    <BulkOrderContext.Provider
      value={{ orders, loading, refreshOrders, cancelOrder }}
    >
      {children}
    </BulkOrderContext.Provider>
  );
}

export function useBulkOrders() {
  const ctx = useContext(BulkOrderContext);
  if (!ctx)
    throw new Error('useBulkOrders must be used within BulkOrderProvider');
  return ctx;
}
