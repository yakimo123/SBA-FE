import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  Edit2,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import bulkOrderService from '../../services/bulkOrderService';
import { BulkOrder, BulkOrderStatus } from '../../types';

export default function BulkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BulkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [shippingFeeSuccess, setShippingFeeSuccess] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await bulkOrderService.getOrderById(id);
      setOrder(data);
      setShippingFee(data.shippingFee || 0);
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleUpdateStatus = async (status: BulkOrderStatus, note?: string) => {
    if (!id) return;
    setIsUpdatingStatus(true);
    try {
      await bulkOrderService.updateStatus(id, status, note);
      await loadOrder();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateShippingFee = async () => {
    if (!id) return;
    try {
      await bulkOrderService.updateShippingFee(id, shippingFee);
      await loadOrder();
      setShippingFeeSuccess(true);
      setTimeout(() => setShippingFeeSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update shipping fee', err);
    }
  };

  const handleReviewCustomization = async (
    custId: number,
    status: 'APPROVED' | 'REJECTED',
    fee: number
  ) => {
    try {
      await bulkOrderService.reviewCustomization(
        custId,
        status,
        fee,
        'PER_UNIT'
      );
      await loadOrder();
    } catch (err) {
      console.error('Failed to review customization', err);
    }
  };

  if (loading)
    return (
      <div
        style={{
          padding: 32,
          background: '#fdfaf6',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
          Loading order details…
        </div>
      </div>
    );
  if (!order)
    return (
      <div style={{ padding: 32, background: '#fdfaf6', minHeight: '100vh' }}>
        Order not found.
      </div>
    );

  const canUpdateFees =
    order.status === 'PENDING_REVIEW' || order.status === 'CONFIRMED';

  const statusConfig: Partial<
    Record<BulkOrderStatus, { bg: string; textColor: string; label: string }>
  > = {
    PENDING_REVIEW: {
      bg: '#fffbeb',
      textColor: '#92400e',
      label: 'Pending Review',
    },
    CONFIRMED: { bg: '#f0fdf4', textColor: '#166534', label: 'Confirmed' },
    AWAITING_PAYMENT: {
      bg: '#eff6ff',
      textColor: '#1e40af',
      label: 'Awaiting Payment',
    },
    PAID: { bg: '#f0fdf4', textColor: '#166534', label: 'Paid' },
    PROCESSING: { bg: '#f3e8ff', textColor: '#6b21a8', label: 'Processing' },
    SHIPPED: { bg: '#ecfeff', textColor: '#0891b2', label: 'Shipped' },
    COMPLETED: { bg: '#f0fdf4', textColor: '#166534', label: 'Completed' },
    REJECTED: { bg: '#fef2f2', textColor: '#b91c1c', label: 'Rejected' },
    CANCELLED: { bg: '#f3f4f6', textColor: '#374151', label: 'Cancelled' },
  };

  const sc = statusConfig[order.status] ?? {
    bg: '#f3f4f6',
    textColor: '#374151',
    label: order.status,
  };

  const card: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: 24,
  };

  const cardTitle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const primaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '11px 16px',
    borderRadius: 10,
    background: '#7c3aed',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    cursor: 'pointer',
  };

  const dangerBtn: React.CSSProperties = {
    width: '100%',
    padding: '10px 16px',
    borderRadius: 10,
    background: '#fef2f2',
    color: '#b91c1c',
    fontWeight: 700,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid #fecaca',
    cursor: 'pointer',
  };

  const infoRow = (
    icon: React.ReactNode,
    label: string,
    value: string | undefined
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: '#f9fafb',
        borderRadius: 10,
        border: '1px solid #f3f4f6',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#fff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#6b7280',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1a1a1a',
            marginTop: 1,
          }}
        >
          {value || '—'}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 32, background: '#fdfaf6', minHeight: '100vh' }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#374151',
          }}
          onClick={() => navigate('/admin/orders/bulk')}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#1a1a1a',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Bulk Order #{order.bulkOrderId}
            </h1>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                background: sc.bg,
                color: sc.textColor,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {sc.label}
            </span>
            {order.hasPendingCustomization && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: '#fffbeb',
                  color: '#92400e',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: '1px solid #fde68a',
                }}
              >
                <AlertCircle size={12} /> Pending Fees
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 8,
              fontSize: '0.82rem',
              color: '#6b7280',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Users size={13} />
              {order.companyName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={13} />
              {new Date(order.createdAt).toLocaleString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <DollarSign size={13} />
              Final:{' '}
              <strong style={{ color: '#1a1a1a' }}>
                {new Intl.NumberFormat('vi-VN').format(order.finalPrice)}đ
              </strong>
            </span>
          </div>
          {order.adminNote && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 14px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 8,
                fontSize: '0.82rem',
                color: '#92400e',
                fontStyle: 'italic',
              }}
            >
              " {order.adminNote} "
            </div>
          )}
        </div>
      </div>

      {/* ── Main 3-column grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px 340px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* ════ COL 1: Products + Price breakdown ════ */}
        <div style={card}>
          <div style={cardTitle}>
            <Package size={16} /> Products in Order
          </div>

          <div>
            {order.details.map((detail) => (
              <div
                key={detail.bulkOrderDetailId}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: '1px dashed #e5e7eb',
                }}
              >
                {detail.productImage ? (
                  <img
                    src={detail.productImage}
                    alt={detail.productName}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Package size={22} color="#9ca3af" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#1a1a1a',
                      marginBottom: 4,
                    }}
                  >
                    {detail.productName}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      fontSize: '0.8rem',
                      color: '#374151',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span
                      style={{
                        background: '#f3f4f6',
                        padding: '2px 8px',
                        borderRadius: 5,
                        fontWeight: 700,
                      }}
                    >
                      ×{detail.quantity}
                    </span>
                    <span style={{ color: '#6b7280' }}>
                      {detail.tierLabel || 'Price'}:{' '}
                      {new Intl.NumberFormat('vi-VN').format(
                        detail.appliedTierPrice
                      )}
                      đ
                    </span>
                  </div>
                  {((detail.customizationFeeConfirmed ?? 0) > 0 ||
                    (detail.customizationFeePending ?? 0) > 0) && (
                    <div
                      style={{
                        marginTop: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {(detail.customizationFeeConfirmed ?? 0) > 0 && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CheckCircle size={10} /> Confirmed cust: +
                          {new Intl.NumberFormat('vi-VN').format(
                            detail.customizationFeeConfirmed!
                          )}
                          đ
                        </span>
                      )}
                      {(detail.customizationFeePending ?? 0) > 0 && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Clock size={10} /> Pending cust: +
                          {new Intl.NumberFormat('vi-VN').format(
                            detail.customizationFeePending!
                          )}
                          đ
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: '0.78rem',
                      color: '#6b7280',
                    }}
                  >
                    Line total:{' '}
                    <strong style={{ color: '#1a1a1a' }}>
                      {new Intl.NumberFormat('vi-VN').format(detail.lineTotal)}đ
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div
            style={{
              marginTop: 8,
              paddingTop: 16,
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {[
              {
                label: 'Base Price Total',
                value: order.basePriceTotal || 0,
                color: '#374151',
              },
              ...(order.tierDiscountTotal && order.tierDiscountTotal < 0
                ? [
                    {
                      label: 'Volume Savings',
                      value: order.tierDiscountTotal,
                      color: '#166534',
                    },
                  ]
                : []),
              {
                label: 'Subtotal (After Tiers)',
                value: order.subtotalAfterTier,
                color: '#374151',
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem',
                  color,
                }}
              >
                <span>{label}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {new Intl.NumberFormat('vi-VN').format(value)}đ
                </span>
              </div>
            ))}

            {(order.customizationFeeConfirmed ||
              order.customizationFeePending) && (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f5f3ff',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  borderLeft: '3px solid #7c3aed',
                }}
              >
                {order.customizationFeeConfirmed ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#4f46e5',
                    }}
                  >
                    <span>Customization (Approved)</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      +
                      {new Intl.NumberFormat('vi-VN').format(
                        order.customizationFeeConfirmed
                      )}
                      đ
                    </span>
                  </div>
                ) : null}
                {order.customizationFeePending ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#d97706',
                      fontStyle: 'italic',
                    }}
                  >
                    <span>Customization (Pending)</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      +
                      {new Intl.NumberFormat('vi-VN').format(
                        order.customizationFeePending
                      )}
                      đ
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: '#374151',
              }}
            >
              <span>
                Discount {order.voucherCode ? `(${order.voucherCode})` : ''}
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#dc2626',
                }}
              >
                -
                {new Intl.NumberFormat('vi-VN').format(
                  order.voucherDiscountAmount || 0
                )}
                đ
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: '#374151',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                Shipping <Truck size={13} />
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {new Intl.NumberFormat('vi-VN').format(order.shippingFee)}đ
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#1a1a1a',
                borderTop: '2px solid #e5e7eb',
                paddingTop: 12,
                marginTop: 4,
              }}
            >
              <span>Final Amount</span>
              <span style={{ fontFamily: 'monospace', color: '#7c3aed' }}>
                {new Intl.NumberFormat('vi-VN').format(order.finalPrice)}đ
              </span>
            </div>
          </div>
        </div>

        {/* ════ COL 2: Customer + Shipping info ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer info */}
          <div style={card}>
            <div style={cardTitle}>
              <Users size={16} /> Customer
            </div>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Company
              </div>
              <div
                style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}
              >
                {order.companyName}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {infoRow(<Users size={14} />, 'Full Name', order.userFullName)}
              {infoRow(<Mail size={14} />, 'Email', order.userEmail)}
              {infoRow(<Phone size={14} />, 'Phone', order.userPhone)}
            </div>
          </div>

          {/* Shipping info */}
          <div style={card}>
            <div style={cardTitle}>
              <Truck size={16} /> Shipping
            </div>

            {/* Delivery address */}
            <div
              style={{
                padding: '10px 14px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <MapPin size={13} color="#2563eb" />
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#1d4ed8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Delivery Address
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#1e3a5f',
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {order.shippingAddress || 'No address provided'}
              </div>
            </div>

            {/* Shipping fee updater */}
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                  display: 'block',
                }}
              >
                Shipping Fee
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: canUpdateFees ? '#fff' : '#f9fafb',
                    color: canUpdateFees ? '#1a1a1a' : '#9ca3af',
                  }}
                  value={shippingFee}
                  onChange={(e) =>
                    setShippingFee(parseInt(e.target.value) || 0)
                  }
                  disabled={!canUpdateFees}
                />
                <button
                  style={{
                    ...primaryBtn,
                    width: 42,
                    padding: 0,
                    flexShrink: 0,
                    opacity: canUpdateFees ? 1 : 0.4,
                    cursor: canUpdateFees ? 'pointer' : 'not-allowed',
                  }}
                  onClick={handleUpdateShippingFee}
                  disabled={!canUpdateFees}
                >
                  <Save size={16} />
                </button>
              </div>
              {shippingFeeSuccess && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#166534',
                  }}
                >
                  ✓ Saved successfully
                </div>
              )}
              {!canUpdateFees && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontStyle: 'italic',
                  }}
                >
                  Locked for this status.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ COL 3: Admin Actions + Customization ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Admin actions */}
          <div style={card}>
            <div style={cardTitle}>
              <AlertCircle size={16} /> Admin Actions
            </div>

            {/* Status badge */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: sc.bg,
                color: sc.textColor,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                }}
              >
                Current Status
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {sc.label}
              </div>
            </div>

            {order.status === 'REJECTED' && order.cancelReason && (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#b91c1c',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  Rejection Reason
                </div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#b91c1c',
                    fontStyle: 'italic',
                  }}
                >
                  "{order.cancelReason}"
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.status === 'PENDING_REVIEW' && (
                <>
                  <button
                    style={{
                      ...primaryBtn,
                      opacity: isUpdatingStatus ? 0.6 : 1,
                    }}
                    onClick={() => handleUpdateStatus('CONFIRMED')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle size={16} /> Confirm & Notify Pricing
                  </button>
                  <button
                    style={{
                      ...dangerBtn,
                      opacity: isUpdatingStatus ? 0.6 : 1,
                    }}
                    onClick={() => {
                      setShowRejectModal(true);
                      setRejectReason('');
                    }}
                    disabled={isUpdatingStatus}
                  >
                    <XCircle size={16} /> Reject Order
                  </button>
                </>
              )}
              {order.status === 'CONFIRMED' && (
                <button
                  style={{ ...primaryBtn, opacity: isUpdatingStatus ? 0.6 : 1 }}
                  onClick={() => handleUpdateStatus('AWAITING_PAYMENT')}
                  disabled={isUpdatingStatus}
                >
                  <DollarSign size={16} /> Move to Payment Phase
                </button>
              )}
              {(order.status === 'PAID' || order.status === 'PROCESSING') && (
                <button
                  style={{ ...primaryBtn, opacity: isUpdatingStatus ? 0.6 : 1 }}
                  onClick={() =>
                    handleUpdateStatus(
                      order.status === 'PAID' ? 'PROCESSING' : 'SHIPPED'
                    )
                  }
                  disabled={isUpdatingStatus}
                >
                  <Truck size={16} />{' '}
                  {order.status === 'PAID'
                    ? 'Start Processing'
                    : 'Mark as Shipped'}
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button
                  style={{ ...primaryBtn, opacity: isUpdatingStatus ? 0.6 : 1 }}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={isUpdatingStatus}
                >
                  <CheckCircle size={16} /> Mark Completed
                </button>
              )}
            </div>
          </div>

          {/* Customization requests */}
          <div style={card}>
            <div style={cardTitle}>
              <Edit2 size={16} /> Customization Requests
            </div>

            {order.details.every((d) => d.customizations.length === 0) ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                }}
              >
                No customization requests.
              </div>
            ) : (
              order.details.map((detail) =>
                detail.customizations.map((cust) => (
                  <div
                    key={cust.customizationId}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 12,
                    }}
                  >
                    {/* Header row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: '#374151',
                        }}
                      >
                        {cust.type}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 20,
                          background:
                            cust.status === 'APPROVED'
                              ? '#f0fdf4'
                              : cust.status === 'REJECTED'
                                ? '#fef2f2'
                                : '#fffbeb',
                          color:
                            cust.status === 'APPROVED'
                              ? '#166534'
                              : cust.status === 'REJECTED'
                                ? '#b91c1c'
                                : '#92400e',
                        }}
                      >
                        {cust.status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        marginBottom: 6,
                      }}
                    >
                      Item: {detail.productName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: '#374151',
                        background: '#f9fafb',
                        padding: '8px 10px',
                        borderRadius: 8,
                        marginBottom: 10,
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                      }}
                    >
                      "{cust.note}"
                    </div>

                    {canUpdateFees && (
                      <>
                        <label
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 6,
                            display: 'block',
                          }}
                        >
                          Extra Fee per Unit (VNĐ)
                        </label>
                        <input
                          type="number"
                          id={`fee-${cust.customizationId}`}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: '#1a1a1a',
                            marginBottom: 10,
                            boxSizing: 'border-box',
                            outline: 'none',
                          }}
                          defaultValue={cust.extraFee || 0}
                        />
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 8,
                          }}
                        >
                          <button
                            style={{
                              height: 36,
                              borderRadius: 8,
                              background: '#dcfce7',
                              color: '#166534',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              border: '1px solid #bbf7d0',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const input = document.getElementById(
                                `fee-${cust.customizationId}`
                              ) as HTMLInputElement;
                              handleReviewCustomization(
                                cust.customizationId!,
                                'APPROVED',
                                parseInt(input?.value || '0') || 0
                              );
                            }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            style={{
                              height: 36,
                              borderRadius: 8,
                              background: '#fef2f2',
                              color: '#b91c1c',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              border: '1px solid #fecaca',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              handleReviewCustomization(
                                cust.customizationId!,
                                'REJECTED',
                                0
                              )
                            }
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </>
                    )}

                    {cust.status === 'APPROVED' && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: '#f0fdf4',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#166534',
                          textAlign: 'center',
                        }}
                      >
                        Applied Fee:{' '}
                        {new Intl.NumberFormat('vi-VN').format(cust.extraFee)}
                        đ/unit
                      </div>
                    )}

                    {!canUpdateFees && cust.status === 'PENDING' && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}
                      >
                        Locked for this status.
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
      {/* ── Reject Modal ── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50 to-white">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <XCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Từ chối đơn hàng</h2>
              </div>
              <p className="text-sm text-slate-500">
                Lưu ý: Hành động này sẽ từ chối đơn hàng sỉ này. Vui lòng nhập lý do để khách hàng nắm rõ thông tin.
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Vd: Hiện tại xưởng đã hết nguyên liệu cho mẫu này, Sản phẩm đã ngừng sản xuất..."
                rows={4}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 px-4 text-sm font-medium outline-none transition-all focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                autoFocus
              />
            </div>

            <div className="flex gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setShowRejectModal(false)}
                disabled={isUpdatingStatus}
              >
                Hủy bỏ
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 py-2.5 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={async () => {
                  if (!rejectReason.trim()) return;
                  await handleUpdateStatus('REJECTED', rejectReason);
                  setShowRejectModal(false);
                }}
                disabled={isUpdatingStatus || !rejectReason.trim()}
              >
                {isUpdatingStatus ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Xác nhận từ chối'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
