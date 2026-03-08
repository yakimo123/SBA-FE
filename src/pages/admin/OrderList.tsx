import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { orderService, OrderResponse, OrderStatus } from '../../services/orderService';

const PAGE_SIZE = 20;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .ol-root {
    --bg: #f5f3ef;
    --surface: #ffffff;
    --surface-2: #faf9f7;
    --border: #e8e3da;
    --border-strong: #c9bfad;
    --ink: #1a1612;
    --ink-2: #5c5347;
    --ink-3: #9c9085;
    --accent: #c9521a;
    --accent-soft: #fdf1eb;
    --accent-mid: #f4c4a8;
    --violet: #4a3f8f;
    --violet-soft: #eeecf8;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --warning: #905a10;
    --warning-soft: #fef6eb;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
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

  .ol-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .ol-header-left { display: flex; align-items: center; gap: 16px; }
  .ol-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent) 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .ol-icon-badge svg { color: white; width: 24px; height: 24px; }
  .ol-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .ol-count-pill {
    display: inline-flex; align-items: center;
    background: var(--violet-soft); color: var(--violet);
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .ol-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .ol-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }

  .ol-error {
    display: flex; align-items: center; gap: 10px;
    background: var(--danger-soft); border: 1px solid #f5c2c2;
    border-left: 3px solid var(--danger); color: var(--danger);
    border-radius: var(--radius); padding: 12px 16px;
    font-size: 0.875rem; margin-bottom: 20px;
  }

  .ol-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 0; gap: 16px;
  }
  .ol-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: ol-spin 0.7s linear infinite;
  }
  .ol-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes ol-spin { to { transform: rotate(360deg); } }

  .ol-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;
  }
  .ol-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .ol-search-wrap { position: relative; display: flex; align-items: center; }
  .ol-search-wrap svg {
    position: absolute; left: 10px; color: var(--ink-3);
    width: 14px; height: 14px; pointer-events: none;
  }
  .ol-search {
    padding: 7px 12px 7px 32px; border: 1px solid var(--border);
    border-radius: 8px; background: var(--surface);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--ink); outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ol-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .ol-table-meta { font-size: 0.8rem; color: var(--ink-3); }

  .ol-table { width: 100%; border-collapse: collapse; }
  .ol-table thead tr { border-bottom: 1px solid var(--border); }
  .ol-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .ol-table td {
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .ol-table tbody tr:last-child td { border-bottom: none; }
  .ol-table tbody tr:hover td { background: var(--accent-soft); }

  .ol-id-text {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    color: var(--ink-3); background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 5px;
    padding: 2px 7px; display: inline-block;
  }
  .ol-name-text { font-weight: 600; color: var(--ink); font-size: 0.88rem; }
  .ol-price {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 500; color: var(--ink); white-space: nowrap;
  }

  .ol-status-pending {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--warning-soft); color: var(--warning);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .ol-status-confirmed, .ol-status-processing {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--violet-soft); color: var(--violet);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .ol-status-shipped {
    display: inline-flex; align-items: center; gap: 5px;
    background: #e8f4fd; color: #1a6fa8;
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .ol-status-delivered {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--success-soft); color: var(--success);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .ol-status-cancelled, .ol-status-refunded {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--danger-soft); color: var(--danger);
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .ol-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .ol-actions { display: flex; gap: 6px; align-items: center; }
  .ol-btn-view {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-3); cursor: pointer; transition: all 0.15s;
  }
  .ol-btn-view:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }
  .ol-btn-print {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-3); cursor: pointer; transition: all 0.15s;
  }
  .ol-btn-print:hover { background: var(--surface-2); border-color: var(--ink-3); color: var(--ink); }

  .ol-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .ol-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--surface-2); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; color: var(--ink-3);
  }
  .ol-empty-text { font-size: 0.9rem; color: var(--ink-3); margin: 0; }

  .ol-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 20px 0 0;
  }
  .ol-page-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 14px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-2);
    cursor: pointer; transition: all 0.15s;
  }
  .ol-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .ol-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .ol-page-info {
    font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--ink-3); padding: 0 8px;
  }
`;

const statusConfig = (status: OrderStatus) => {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    PENDING:    { label: 'Pending',    className: 'ol-status-pending'    },
    CONFIRMED:  { label: 'Confirmed',  className: 'ol-status-confirmed'  },
    PROCESSING: { label: 'Processing', className: 'ol-status-processing'  },
    SHIPPED:    { label: 'Shipped',    className: 'ol-status-shipped'    },
    DELIVERED:  { label: 'Delivered',  className: 'ol-status-delivered'  },
    CANCELLED:  { label: 'Cancelled',  className: 'ol-status-cancelled'  },
    REFUNDED:   { label: 'Refunded',   className: 'ol-status-refunded'   },
  };
  return map[status] ?? { label: status, className: 'ol-status-pending' };
};

export function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setLoading(true);
    orderService
      .getOrders({ page, size: PAGE_SIZE, sort: 'orderDate,desc' })
      .then((data) => {
        setOrders(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? 0);
      })
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = orders.filter(
    (o) =>
      String(o.orderId).includes(search) ||
      (o.userFullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (o.paymentMethod ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ol-root">
      <style>{css}</style>

      <div className="ol-header">
        <div className="ol-header-left">
          <div className="ol-icon-badge">
            <ShoppingCart />
          </div>
          <div>
            <h1 className="ol-title">
              Orders
              {totalElements > 0 && (
                <span className="ol-count-pill">{totalElements}</span>
              )}
            </h1>
            <div className="ol-divider" />
            <p className="ol-subtitle" style={{ marginTop: 6 }}>
              Manage customer orders
            </p>
          </div>
        </div>
      </div>

      {error && <div className="ol-error">⚠ {error}</div>}

      <div className="ol-table-card">
        <div className="ol-table-toolbar">
          <div className="ol-search-wrap">
            <Search />
            <input
              className="ol-search"
              placeholder="Search orders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="ol-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="ol-loading">
            <div className="ol-spinner" />
            <p className="ol-loading-text">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ol-empty">
            <div className="ol-empty-icon">
              <ShoppingCart size={22} />
            </div>
            <p className="ol-empty-text">No orders found</p>
          </div>
        ) : (
          <table className="ol-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const s = statusConfig(order.orderStatus);
                return (
                  <tr key={order.orderId}>
                    <td>
                      <span className="ol-id-text">#{order.orderId}</span>
                    </td>
                    <td>
                      <span className="ol-name-text">{order.userFullName}</span>
                    </td>
                    <td>
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className="ol-price">
                        ₫{order.totalAmount.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td>
                      <span className={s.className}>
                        <span className="ol-status-dot" />
                        {s.label}
                      </span>
                    </td>
                    <td>{order.paymentMethod ?? '—'}</td>
                    <td>
                      <div className="ol-actions">
                        <button
                          type="button"
                          className="ol-btn-view"
                          title="View"
                          onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="ol-btn-print"
                          title="Print"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="ol-pagination">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="ol-page-btn"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="ol-page-info">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="ol-page-btn"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
