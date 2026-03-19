import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Printer,
  Truck,
  User,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  OrderResponse,
  orderService,
  OrderStatus,
} from '../../services/orderService';

const ALL_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const TIMELINE_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .od-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --success: #2d7a4f;
    --warning: #905a10;
    --danger: #b03030;
    --violet: #4a3f8f;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .od-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; margin-bottom: 28px;
  }
  .od-back-btn {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-2); cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .od-back-btn:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .od-header-left { display: flex; align-items: center; gap: 16px; }
  .od-title {
    font-family: 'DM Serif Display', serif; font-size: 1.5rem;
    font-weight: 400; color: var(--ink); margin: 0 0 4px;
  }
  .od-id { font-family: 'DM Mono', monospace; font-size: 0.9rem; color: var(--ink-2); }
  .od-status {
    display: inline-flex; padding: 4px 12px; border-radius: 20px;
    font-size: 0.75rem; font-weight: 600; margin-left: 12px;
  }
  .od-status-pending { background: #fef6eb; color: var(--warning); }
  .od-status-confirmed, .od-status-processing { background: #eeecf8; color: var(--violet); }
  .od-status-shipped { background: #e8f4fd; color: #1a6fa8; }
  .od-status-delivered { background: #edf7f2; color: var(--success); }
  .od-status-cancelled, .od-status-refunded { background: #fdf2f2; color: var(--danger); }
  .od-header-actions { display: flex; gap: 10px; }
  .od-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif; font-size: 0.88rem;
    font-weight: 500; cursor: pointer; transition: all 0.15s;
  }
  .od-btn-outline {
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-2);
  }
  .od-btn-outline:hover { background: var(--surface-2); }
  .od-btn-primary {
    border: none; background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    color: white; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
  }
  .od-btn-primary:hover { transform: translateY(-1px); }

  .od-grid { display: grid; gap: 24px; grid-template-columns: 2fr 1fr; }
  @media (max-width: 900px) { .od-grid { grid-template-columns: 1fr; } }

  .od-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .od-card-header {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .od-card-title {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--ink-3); margin: 0;
  }
  .od-card-body { padding: 24px; }
  .od-timeline {
    position: relative; padding-left: 24px;
    border-left: 2px solid var(--border);
  }
  .od-timeline-step {
    position: relative; margin-bottom: 24px;
  }
  .od-timeline-step:last-child { margin-bottom: 0; }
  .od-timeline-dot {
    position: absolute; left: -29px; top: 0;
    width: 36px; height: 36px; border-radius: 50%;
    border: 4px solid var(--surface);
    display: flex; align-items: center; justify-content: center;
    color: white;
  }
  .od-timeline-dot.done { background: var(--success); }
  .od-timeline-dot.current { background: var(--accent); }
  .od-timeline-dot.pending { background: var(--border); }
  .od-timeline-dot.cancelled { background: var(--danger); }
  .od-timeline-label { font-weight: 600; font-size: 0.9rem; }

  .od-modal-overlay {
    position: fixed; inset: 0; background: rgba(26,22,18,0.45);
    backdrop-filter: blur(4px); display: flex; align-items: center;
    justify-content: center; z-index: 1000;
  }
  .od-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg); width: 100%; max-width: 360px;
    margin: 20px; padding: 24px;
  }
  .od-modal-title {
    font-family: 'DM Serif Display', serif; font-size: 1.2rem;
    margin: 0 0 16px;
  }
  .od-select {
    width: 100%; padding: 10px 14px;
    border: 1px solid var(--border); border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    margin-bottom: 20px; cursor: pointer;
  }
  .od-select:focus { outline: none; border-color: var(--accent); }
  .od-textarea {
    width: 100%; padding: 12px; border: 1px solid var(--border);
    border-radius: 9px; font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; margin-bottom: 20px; resize: vertical;
    min-height: 80px;
  }
  .od-textarea:focus { outline: none; border-color: var(--accent); }
  .od-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

  .od-loading, .od-error {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 20px; gap: 16px;
  }
  .od-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: od-spin 0.7s linear infinite;
  }
  @keyframes od-spin { to { transform: rotate(360deg); } }

  .od-item-table { width: 100%; border-collapse: collapse; }
  .od-item-table th {
    text-align: left; padding: 12px 16px; font-family: 'DM Mono', monospace;
    font-size: 0.7rem; color: var(--ink-3); text-transform: uppercase;
    border-bottom: 1px solid var(--border); background: var(--surface-2);
  }
  .od-item-table td { padding: 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .od-item-table tr:last-child td { border-bottom: none; }
  .od-item-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: var(--surface-2); }
  .od-item-name { font-weight: 600; font-size: 0.9rem; color: var(--ink); margin: 0; }
  .od-item-branch { font-size: 0.75rem; color: var(--ink-3); margin: 2px 0 0; }

  .od-pay-status {
    padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.02em;
  }
  .od-pay-paid { background: #edf7f2; color: var(--success); }
  .od-pay-unpaid { background: #fdf2f2; color: var(--danger); }
  .od-pay-pending { background: #fef6eb; color: var(--warning); }
`;

const statusClass = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    PENDING: 'od-status-pending',
    CONFIRMED: 'od-status-confirmed',
    PROCESSING: 'od-status-processing',
    SHIPPED: 'od-status-shipped',
    DELIVERED: 'od-status-delivered',
    CANCELLED: 'od-status-cancelled',
    REFUNDED: 'od-status-refunded',
  };
  return map[status] ?? 'od-status-pending';
};

const timelineDotClass = (s: OrderStatus, orderStatus: OrderStatus, isDone: boolean, isCurrent: boolean) => {
  if (s === 'CANCELLED' && orderStatus === 'CANCELLED') return 'cancelled';
  if (isCurrent) return 'current';
  if (isDone) return 'done';
  return 'pending';
};

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
  const [updating, setUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrderById(id)
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.orderStatus);
        setCancelReason(data.cancelReason || '');
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    
    if (selectedStatus === 'CANCELLED' && !cancelReason.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);

    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(
        order.orderId,
        selectedStatus,
        selectedStatus === 'CANCELLED' ? cancelReason : undefined
      );
      setOrder(updated);
      setShowStatusModal(false);
    } catch (err) {
      console.error(err);
      alert('Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="od-root">
        <style>{css}</style>
        <div className="od-loading">
          <div className="od-spinner" />
          <p style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>
            Loading order…
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="od-root">
        <style>{css}</style>
        <div className="od-error">
          <p style={{ color: 'var(--danger)', margin: 0 }}>
            {error ?? 'Order not found'}
          </p>
        </div>
      </div>
    );
  }

  const statusOrder = [
    ...TIMELINE_STEPS,
    'CANCELLED',
    'REFUNDED',
  ] as OrderStatus[];
  const currentIdx = statusOrder.indexOf(order.orderStatus);

  return (
    <div className="od-root">
      <style>{css}</style>

      <div className="od-header">
        <div className="od-header-left">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="od-back-btn"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              className="od-title"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Order #{order.orderId}
              <span className={`od-status ${statusClass(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </h1>
            <p className="od-id">
              Placed on {new Date(order.orderDate).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="od-header-actions">
          <button type="button" className="od-btn od-btn-outline">
            <Printer size={16} /> Print Invoice
          </button>
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            className="od-btn od-btn-primary"
          >
            Update Status
          </button>
        </div>
      </div>

      {showStatusModal && (
        <div
          className="od-modal-overlay"
          onClick={() => setShowStatusModal(false)}
        >
          <div className="od-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="od-modal-title">Update Order Status</h3>
            <select
              className="od-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {selectedStatus === 'CANCELLED' && (
              <>
                <textarea
                  className="od-textarea"
                  style={{ 
                    marginBottom: 8,
                    borderColor: showError ? 'var(--danger)' : 'var(--border)'
                  }}
                  placeholder="Nhập lý do hủy đơn hàng..."
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (showError) setShowError(false);
                  }}
                  required
                />
                {showError && (
                  <p style={{ 
                    color: 'var(--danger)', 
                    fontSize: '0.75rem', 
                    marginBottom: 16, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <AlertCircle size={14} /> Vui lòng nhập lý do hủy
                  </p>
                )}
              </>
            )}
            <div className="od-modal-actions">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="od-btn od-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className="od-btn od-btn-primary"
              >
                {updating ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="od-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Order Items</h2>
            </div>
            <div className="od-card-body" style={{ padding: 0 }}>
              <table className="od-item-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Branch</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item) => (
                    <tr key={item.orderDetailId}>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="od-item-img"
                            />
                          ) : (
                            <div className="od-item-img" />
                          )}
                          <div>
                            <p className="od-item-name">{item.productName}</p>
                            <p
                              className="od-item-branch"
                              style={{ fontSize: '0.7rem' }}
                            >
                              ID: {item.productId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}
                        >
                          {item.branchName ?? 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}
                        >
                          ₫{item.unitPrice.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          ₫{item.subtotal.toLocaleString('vi-VN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Order Summary</h2>
            </div>
            <div className="od-card-body">
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem',
                    color: 'var(--ink-2)',
                  }}
                >
                  <span>Subtotal</span>
                  <span>₫{order.totalAmount.toLocaleString('vi-VN')}</span>
                </div>

                {order.voucherCode && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem',
                      color: 'var(--ink-2)',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Discount</span>
                      <span
                        style={{
                          padding: '2px 6px',
                          background: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          borderRadius: 4,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {order.voucherCode}
                      </span>
                    </div>
                    <span style={{ color: 'var(--danger)' }}>
                      -₫{(order.discountAmount ?? 0).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--accent)' }}>
                    ₫
                    {(order.finalAmount ?? order.totalAmount).toLocaleString(
                      'vi-VN'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Order Timeline</h2>
            </div>
            <div className="od-card-body">
              {(order.orderStatus === 'CANCELLED' || order.orderStatus === 'REFUNDED') && order.cancelReason && (
                <div style={{ 
                  marginBottom: 20, 
                  padding: 12, 
                  background: '#fef2f2', 
                  border: '1px solid #fee2e2', 
                  borderRadius: 8,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--danger)' }}>
                      Lý do hủy đơn:
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                      {order.cancelReason}
                    </p>
                  </div>
                </div>
              )}
              <div className="od-timeline">
                {TIMELINE_STEPS.filter(s => {
                  // If cancelled, stop the timeline at CANCELLED
                  if (order.orderStatus === 'CANCELLED') {
                    // We only show CANCELLED and the steps that logically happened before it.
                    // But wait, the user wants "hiện cancle mới đúng".
                    // Let's just include CANCELLED in TIMELINE_STEPS (already done) 
                    // and hide DELIVERED if it's CANCELLED.
                    return s !== 'DELIVERED';
                  }
                  // If not cancelled, hide CANCELLED
                  return s !== 'CANCELLED';
                }).map((s) => {
                  const stepIdx = statusOrder.indexOf(s);
                  const isDone = order.orderStatus !== 'CANCELLED' && currentIdx >= stepIdx;
                  const isCurrent = order.orderStatus === s;
                  const isActuallyCancelled = order.orderStatus === 'CANCELLED' && s === 'CANCELLED';
                  
                  return (
                    <div key={s} className="od-timeline-step">
                      <div
                        className={`od-timeline-dot ${
                          timelineDotClass(s, order.orderStatus, isDone, isCurrent)
                        }`}
                      >
                        {s === 'SHIPPED' ? (
                          <Truck size={16} />
                        ) : s === 'DELIVERED' ? (
                          <CheckCircle size={16} />
                        ) : s === 'CANCELLED' ? (
                          <XCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <div
                        className="od-timeline-label"
                        style={{
                          color: (isDone || isCurrent || isActuallyCancelled) ? 'var(--ink)' : 'var(--ink-3)',
                        }}
                      >
                        {s}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Customer</h2>
            </div>
            <div className="od-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    {order.userFullName}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--ink-3)',
                    }}
                  >
                    User ID: {order.userId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Shipping Address</h2>
            </div>
            <div className="od-card-body">
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  fontSize: '0.9rem',
                  color: 'var(--ink-2)',
                }}
              >
                <MapPin
                  size={18}
                  style={{ flexShrink: 0, color: 'var(--ink-3)' }}
                />
                <p style={{ margin: 0 }}>{order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <div className="od-card">
            <div className="od-card-header">
              <h2 className="od-card-title">Payment Info</h2>
            </div>
            <div className="od-card-body">
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontWeight: 600,
                    }}
                  >
                    <CreditCard size={18} style={{ color: 'var(--ink-3)' }} />
                    {order.paymentMethod}
                  </div>
                  <span
                    className={`od-pay-status ${
                      order.paymentStatus?.toUpperCase() === 'PAID'
                        ? 'od-pay-paid'
                        : order.paymentStatus?.toUpperCase() === 'UNPAID'
                          ? 'od-pay-unpaid'
                          : 'od-pay-pending'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: 'var(--ink-3)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: 12,
                  }}
                >
                  Last updated at{' '}
                  {new Date(order.orderDate).toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
