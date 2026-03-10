import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

import { mockBulkOrders } from '../data/mockData';
import { BulkOrder, BulkOrderItem, BulkOrderStatus } from '../types';

interface BulkOrderContextType {
  orders: BulkOrder[];
  addOrder: (items: BulkOrderItem[], voucherCode: string, voucherDiscount: number, note: string, total: number, subtotal: number) => BulkOrder;
  cancelOrder: (orderId: string) => void;
  updateCustomization: (orderId: string, customization: string) => void;
}

const BulkOrderContext = createContext<BulkOrderContextType | undefined>(undefined);

let orderCounter = mockBulkOrders.length + 1;

export function BulkOrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<BulkOrder[]>(mockBulkOrders);

  const addOrder = useCallback((
    items: BulkOrderItem[],
    voucherCode: string,
    voucherDiscount: number,
    note: string,
    total: number,
    subtotal: number,
  ): BulkOrder => {
    const now = new Date().toISOString();
    const padded = String(orderCounter++).padStart(3, '0');
    const newOrder: BulkOrder = {
      orderId: `BO-2026-${padded}`,
      companyId: 1,
      companyName: 'Company',
      status: 'PENDING' as BulkOrderStatus,
      items,
      voucherCode: voucherCode || undefined,
      voucherDiscount,
      subtotal,
      total,
      note: note || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => o.orderId === orderId ? { ...o, status: 'CANCELLED' as BulkOrderStatus } : o)
    );
  }, []);

  const updateCustomization = useCallback((orderId: string, customization: string) => {
    setOrders((prev) =>
      prev.map((o) => o.orderId === orderId ? { ...o, customization } : o)
    );
  }, []);

  return (
    <BulkOrderContext.Provider value={{ orders, addOrder, cancelOrder, updateCustomization }}>
      {children}
    </BulkOrderContext.Provider>
  );
}

export function useBulkOrders() {
  const ctx = useContext(BulkOrderContext);
  if (!ctx) throw new Error('useBulkOrders must be used within BulkOrderProvider');
  return ctx;
}

