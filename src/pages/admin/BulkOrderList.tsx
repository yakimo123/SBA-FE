import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bulkOrderService from '../../services/bulkOrderService';
import { BulkOrder, BulkOrderStatus } from '../../types';

const css = `
  .bol-root {
    padding: 32px;
    background: #f8f9fa;
    min-height: 100vh;
  }
  .bol-header {
    margin-bottom: 32px;
  }
  .bol-title {
    font-family: 'DM Serif Display', serif;
    font-size: 2.5rem;
    color: #1a1a1a;
    margin: 0;
  }
  .bol-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 8px 0 0;
  }

  .bol-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 2px;
  }
  .bol-tab {
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .bol-tab:hover {
    color: #1a1a1a;
    background: rgba(0,0,0,0.02);
  }
  .bol-tab.active {
    color: #7c3aed;
    border-bottom-color: #7c3aed;
  }

  .bol-filters-card {
    background: white;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    margin-bottom: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-end;
  }
  .bol-filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bol-filter-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .bol-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .bol-input-wrap svg {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: #9ca3af;
  }
  .bol-input {
    padding: 10px 12px 10px 36px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    outline: none;
    font-size: 0.9rem;
    width: 220px;
    color: #1a1a1a;
  }
  .bol-input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
  }

  .bol-table-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    overflow: hidden;
  }
  .bol-table {
    width: 100%;
    border-collapse: collapse;
  }
  .bol-table th {
    background: #fdfaf6;
    padding: 14px 20px;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    border-bottom: 1px solid #e5e7eb;
  }
  .bol-table td {
    padding: 18px 20px;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
    color: #374151;
  }
  .bol-table tr:hover td {
    background: #fdfaf6;
  }

  .bol-id {
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .bol-company {
    font-weight: 600;
    color: #1a1a1a;
    display: block;
  }
  .bol-user {
    font-size: 0.8rem;
    color: #9ca3af;
  }
  .bol-price {
    font-family: 'DM Mono', monospace;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .bol-status {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .bol-status-pending_review { background: #fef3c7; color: #92400e; }
  .bol-status-confirmed { background: #dcfce7; color: #166534; }
  .bol-status-awaiting_payment { background: #dbeafe; color: #1e40af; }
  .bol-status-paid { background: #dcfce7; color: #166534; }
  .bol-status-processing { background: #f3e8ff; color: #6b21a8; }
  .bol-status-shipped { background: #ecfeff; color: #0891b2; }
  .bol-status-completed { background: #dcfce7; color: #166534; }
  .bol-status-rejected { background: #fee2e2; color: #991b1b; }
  .bol-status-cancelled { background: #f3f4f6; color: #4b5563; }

  .bol-pagination {
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fdfaf6;
  }
  .bol-page-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    color: #374151;
    transition: all 0.15s;
  }
  .bol-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bol-page-btn:not(:disabled):hover { border-color: #7c3aed; color: #7c3aed; }
`;

enum TabType {
  ALL = 'ALL',
  PENDING = 'PENDING_REVIEW',
  PAYMENT = 'AWAITING_PAYMENT',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  FINISHED = 'COMPLETED',
  CANCELLED = 'CANCELLED_REJECTED',
}

export default function BulkOrderList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ALL);
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Filters
  const [companyId, setCompanyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const status =
        activeTab === TabType.ALL
          ? undefined
          : (activeTab as unknown as BulkOrderStatus);
      const res = await bulkOrderService.getOrders({
        status,
        companyId: companyId ? parseInt(companyId) : undefined,
        createdAtFrom: startDate
          ? new Date(startDate).toISOString()
          : undefined,
        createdAtTo: endDate ? new Date(endDate).toISOString() : undefined,
        page: currentPage,
        size: 10,
      });
      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error('Failed to load bulk orders', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, companyId, startDate, endDate, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="bol-root">
      <style>{css}</style>

      <div className="bol-header">
        <h1 className="bol-title">Bulk Orders</h1>
        <p className="bol-subtitle">
          Manage large-scale B2B orders and wholesale pricing
        </p>
      </div>

      <div className="bol-tabs">
        <div
          className={`bol-tab ${activeTab === TabType.ALL ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.ALL)}
        >
          All Orders
        </div>
        <div
          className={`bol-tab ${activeTab === TabType.PENDING ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.PENDING)}
        >
          Pending Review
        </div>
        <div
          className={`bol-tab ${activeTab === TabType.PAYMENT ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.PAYMENT)}
        >
          Awaiting Payment
        </div>
        <div
          className={`bol-tab ${activeTab === TabType.PROCESSING ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.PROCESSING)}
        >
          Processing
        </div>
        <div
          className={`bol-tab ${activeTab === TabType.SHIPPED ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.SHIPPED)}
        >
          Shipped
        </div>
        <div
          className={`bol-tab ${activeTab === TabType.FINISHED ? 'active' : ''}`}
          onClick={() => handleTabChange(TabType.FINISHED)}
        >
          Finished
        </div>
      </div>

      <div className="bol-filters-card">
        <div className="bol-filter-group">
          <label className="bol-filter-label">Search Company</label>
          <div className="bol-input-wrap">
            <Users />
            <input
              className="bol-input"
              placeholder="Company ID or Name..."
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
          </div>
        </div>

        <div className="bol-filter-group">
          <label className="bol-filter-label">From Date</label>
          <div className="bol-input-wrap">
            <Calendar />
            <input
              type="date"
              className="bol-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="bol-filter-group">
          <label className="bol-filter-label">To Date</label>
          <div className="bol-input-wrap">
            <Calendar />
            <input
              type="date"
              className="bol-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className="bol-page-btn"
          title="Refresh"
          onClick={loadOrders}
          style={{ width: 42, height: 42, color: '#7c3aed' }}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bol-table-card">
        <table className="bol-table">
          <thead>
            <tr>
              <th>Order Code</th>
              <th>Company</th>
              <th>Created At</th>
              <th>Items</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 48 }}>
                  <RefreshCw
                    size={24}
                    className="animate-spin"
                    style={{ color: '#9ca3af' }}
                  />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}
                >
                  No orders found matching criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.bulkOrderId}>
                  <td>
                    <span className="bol-id">#{order.bulkOrderId}</span>
                  </td>
                  <td>
                    <span className="bol-company">
                      {order.companyName || `Company ${order.companyId}`}
                    </span>
                    <span className="bol-user">User ID: {order.userId}</span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>
                      {order.details.length} Products
                    </span>
                  </td>
                  <td>
                    <span className="bol-price">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.finalPrice)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`bol-status bol-status-${order.status.toLowerCase()}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="bol-page-btn"
                      onClick={() =>
                        navigate(`/admin/orders/bulk/${order.bulkOrderId}`)
                      }
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="bol-pagination">
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="bol-page-btn"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="bol-page-btn"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
