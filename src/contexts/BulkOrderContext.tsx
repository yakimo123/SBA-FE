
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import bulkOrderService from '../services/bulkOrderService';
import { useAuth } from './AuthContext';
import { BulkOrder, BulkOrderItem, BulkOrderStatus, CreateBulkOrderRequest } from '../types';

interface BulkOrderContextType {
  orders: BulkOrder[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  addOrder: (items: BulkOrderItem[], voucherCode: string, note: string, companyId?: number) => Promise<BulkOrder | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateCustomization: (orderId: string, customization: string) => Promise<void>;
}


const BulkOrderContext = createContext<BulkOrderContextType | undefined>(undefined);


export function BulkOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bulkOrderService.getMyOrders();
      setOrders(res.content);
    } catch (e) {
      // handle error if needed
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const addOrder = useCallback(
    async (items: BulkOrderItem[], voucherCode: string, note: string, companyIdParam?: number) => {
      try {
        if (!user || user.userId === undefined || user.userId === null) {
          console.error('BulkOrderContext: user hoặc userId không xác định', user);
          throw new Error('Không xác định được userId');
        }
        let companyId = companyIdParam;
        if (companyId === undefined || companyId === null) {
          companyId = (user as any).companyId !== undefined ? (typeof (user as any).companyId === 'string' ? parseInt((user as any).companyId, 10) : (user as any).companyId) : undefined;
        }
        if (companyId === undefined || companyId === null) {
          console.error('BulkOrderContext: Không xác định được companyId (truyền vào hoặc từ user)', user);
          throw new Error('Không xác định được companyId');
        }
        const req: any = {
          companyId,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customization: i.customization,
          })),
          voucherCode: voucherCode || undefined,
          note: note || undefined,
        };
        const userIdNum = typeof user.userId === 'string' ? parseInt(user.userId, 10) : user.userId;
        const order = await bulkOrderService.createBulkOrder(req, userIdNum);
        await refreshOrders();
        return order;
      } catch (e) {
        console.error('BulkOrderContext: Lỗi khi tạo đơn hàng', e);
        return null;
      }
    },
    [refreshOrders, user]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      try {
        await bulkOrderService.cancelOrder(orderId);
        await refreshOrders();
      } catch (e) {
        // handle error
      }
    },
    [refreshOrders]
  );

  const updateCustomization = useCallback(
    async (orderId: string, customization: string) => {
      try {
        await bulkOrderService.addCustomization(orderId, { customization });
        await refreshOrders();
      } catch (e) {
        // handle error
      }
    },
    [refreshOrders]
  );

  return (
    <BulkOrderContext.Provider value={{ orders, loading, refreshOrders, addOrder, cancelOrder, updateCustomization }}>
      {children}
    </BulkOrderContext.Provider>
  );
}

export function useBulkOrders() {
  const ctx = useContext(BulkOrderContext);
  if (!ctx) throw new Error('useBulkOrders must be used within BulkOrderProvider');
  return ctx;
}

