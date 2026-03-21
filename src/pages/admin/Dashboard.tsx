import { format } from 'date-fns';
import {
  DollarSign,
  LayoutDashboard,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useDashboard } from '../../hooks/useDashboard';

const css = `
  

  .db-root {
    --bg: #f3f4f6;
    --surface: #ffffff;
    --surface-2: #f9fafb;
    --border: #e5e7eb;
    --ink: #111827;
    --ink-2: #4b5563;
    --accent: #ee4d2d;
    --accent-soft: #fef2f2;
    --violet: #ee4d2d;
    --violet-soft: #fff1f0;
    --success: #2d7a4f;
    --success-soft: #edf7f2;
    --warning: #905a10;
    --danger: #b03030;
    --danger-soft: #fdf2f2;
    --shadow-sm: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    --shadow-lg: 0 12px 40px rgba(26,22,18,0.12), 0 4px 12px rgba(26,22,18,0.06);
    --radius: 10px;
    --radius-lg: 16px;
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 32px;
  }

  .db-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .db-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(255,106,0,0.35); flex-shrink: 0;
  }
  .db-icon-badge svg { color: white; width: 24px; height: 24px; }
  .db-title {
    font-family: 'Outfit', sans-serif; font-size: 2rem;
    font-weight: 400; color: var(--ink); line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .db-subtitle { font-size: 0.875rem; color: var(--ink-3); margin: 0; }
  .db-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, var(--accent) 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .db-refresh-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border: 1px solid var(--border);
    border-radius: var(--radius); background: var(--surface);
    font-family: 'Inter', sans-serif; font-size: 0.85rem;
    font-weight: 500; color: var(--ink-2); cursor: pointer;
    transition: all 0.15s;
  }
  .db-refresh-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

  .db-error {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 80px 20px; gap: 16px;
    background: var(--danger-soft); border: 1px solid #f8aba6;
    border-left: 3px solid var(--danger); border-radius: var(--radius);
    color: var(--danger); text-align: center;
  }
  .db-error-btn {
    padding: 9px 20px; border: none; border-radius: var(--radius);
    background: var(--danger); color: white;
    font-family: 'Inter', sans-serif; font-size: 0.88rem;
    font-weight: 600; cursor: pointer;
  }
  .db-error-btn:hover { opacity: 0.9; }

  .db-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 120px 0; gap: 16px;
  }
  .db-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--accent);
    animation: db-spin 0.7s linear infinite;
  }
  .db-loading-text { font-size: 0.875rem; color: var(--ink-3); }
  @keyframes db-spin { to { transform: rotate(360deg); } }

  .db-kpi-grid {
    display: grid; gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-bottom: 28px;
  }
  .db-kpi-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 20px 24px; transition: box-shadow 0.2s;
  }
  .db-kpi-card:hover { box-shadow: var(--shadow-lg); }
  .db-kpi-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .db-kpi-title { font-size: 0.82rem; font-weight: 500; color: var(--ink-3); }
  .db-kpi-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .db-kpi-icon.green { background: var(--success-soft); color: var(--success); }
  .db-kpi-icon.blue { background: #e8f4fd; color: #1a6fa8; }
  .db-kpi-icon.violet { background: var(--violet-soft); color: var(--violet); }
  .db-kpi-icon.orange { background: var(--accent-soft); color: var(--accent); }
  .db-kpi-value {
    font-family: 'Outfit', sans-serif; font-size: 1.5rem;
    font-weight: 600; color: var(--ink); margin-bottom: 6px;
  }
  .db-kpi-trend {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 0.75rem; font-weight: 600; padding: 2px 8px;
    border-radius: 20px;
  }
  .db-kpi-trend.up { background: var(--success-soft); color: var(--success); }
  .db-kpi-trend.down { background: var(--danger-soft); color: var(--danger); }
  .db-kpi-card::after {
    content: ''; display: block; height: 3px; margin-top: 16px;
    border-radius: 2px;
  }
  .db-kpi-card.green::after { background: var(--success); }
  .db-kpi-card.blue::after { background: #1a6fa8; }
  .db-kpi-card.violet::after { background: var(--violet); }
  .db-kpi-card.orange::after { background: var(--accent); }

  .db-chart-grid {
    display: grid; gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    margin-bottom: 28px;
  }
  .db-chart-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    padding: 24px; overflow: hidden;
  }
  .db-chart-title {
    font-family: 'Outfit', sans-serif; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--ink-3); margin: 0 0 20px;
  }

  .db-table-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
    overflow: hidden;
  }
  .db-table-header {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  .db-table-title {
    font-family: 'Outfit', sans-serif; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--ink-3); margin: 0;
  }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th {
    padding: 12px 24px; text-align: left;
    font-family: 'Outfit', sans-serif; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-3); background: var(--surface-2);
  }
  .db-table td {
    padding: 14px 24px; border-bottom: 1px solid var(--border);
    vertical-align: middle; transition: background 0.12s;
  }
  .db-table tbody tr:last-child td { border-bottom: none; }
  .db-table tbody tr:hover td { background: var(--accent-soft); }
  .db-id-text {
    font-family: 'Outfit', sans-serif; font-size: 0.8rem;
    color: var(--violet); font-weight: 500;
  }
  .db-price { font-family: 'Outfit', sans-serif; font-size: 0.88rem; font-weight: 500; }
  .db-status {
    display: inline-flex; padding: 3px 10px; border-radius: 20px;
    font-size: 0.73rem; font-weight: 600;
  }
  .db-status-delivered { background: var(--success-soft); color: var(--success); }
  .db-status-shipped { background: #e8f4fd; color: #1a6fa8; }
  .db-status-processing { background: var(--violet-soft); color: var(--violet); }
  .db-status-cancelled { background: var(--danger-soft); color: var(--danger); }
  .db-status-pending { background: #fef6eb; color: var(--warning); }
  .db-empty { padding: 48px 24px; text-align: center; color: var(--ink-3); font-size: 0.9rem; }

  .db-bulk-overview {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px; margin-bottom: 28px;
    box-shadow: var(--shadow-sm);
  }
  .db-bulk-title {
    font-family: 'Outfit', sans-serif; font-size: 1.25rem;
    margin: 0 0 20px; color: var(--ink);
  }
  .db-bulk-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    margin-bottom: 24px;
  }
  .db-bulk-stat-item {
    padding: 16px; border-radius: var(--radius);
    display: flex; flex-direction: column; gap: 4px;
  }
  .db-bulk-stat-label { font-size: 0.82rem; font-weight: 500; display: flex; align-items: center; gap: 6px; }
  .db-bulk-stat-value { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 600; }
  .db-bulk-footer {
    padding-top: 16px; border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .db-bulk-footer-text { font-size: 0.88rem; color: var(--ink-2); }
  .db-bulk-footer-value { font-family: 'Outfit', sans-serif; font-weight: 600; color: var(--ink); }
`;

export function Dashboard() {
  const {
    kpis,
    revenueData,
    orderStatusData,
    topProductsData,
    customerGrowthData,
    bulkOrderStats,
    recentOrders,
    isLoading,
    error,
    refreshData,
  } = useDashboard();

  const formattedRevenue =
    kpis?.totalRevenue?.value != null
      ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(kpis.totalRevenue.value)
      : '₫0';

  if (isLoading) {
    return (
      <div className="db-root">
        <style>{css}</style>
        <div className="db-loading">
          <div className="db-spinner" />
          <p className="db-loading-text">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-root">
        <style>{css}</style>
        <div className="db-error">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Failed to load dashboard data
          </h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          <button type="button" onClick={refreshData} className="db-error-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statusClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 'db-status-delivered';
    if (s.includes('shipped')) return 'db-status-shipped';
    if (s.includes('processing')) return 'db-status-processing';
    if (s.includes('cancelled')) return 'db-status-cancelled';
    return 'db-status-pending';
  };

  const chartColors = {
    accent: '#ef4444',
    violet: '#dc2626',
    success: '#2d7a4f',
    blue: '#1a6fa8',
    warning: '#905a10',
    danger: '#b03030',
  };

  return (
    <div className="db-root">
      <style>{css}</style>

      <div className="db-header">
        <div className="db-header-left">
          <div className="db-icon-badge">
            <LayoutDashboard />
          </div>
          <div>
            <h1 className="db-title">Dashboard</h1>
            <div className="db-divider" />
            <p className="db-subtitle" style={{ marginTop: 6 }}>
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={refreshData}
          className="db-refresh-btn"
        >
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {bulkOrderStats && (
        <div className="db-bulk-overview">
          <h2 className="db-bulk-title">Bulk Orders Overview</h2>
          <div className="db-bulk-stats">
            <div className="db-bulk-stat-item" style={{ background: '#fef6eb' }}>
              <span className="db-bulk-stat-label" style={{ color: '#905a10' }}>
                <span className="w-2 h-2 rounded-full bg-[#905a10]" />
                Chờ duyệt
              </span>
              <span className="db-bulk-stat-value" style={{ color: '#905a10' }}>
                {bulkOrderStats.pendingReview} đơn
              </span>
            </div>
            <div className="db-bulk-stat-item" style={{ background: '#fff1f0' }}>
              <span className="db-bulk-stat-label" style={{ color: '#1a6fa8' }}>
                <span className="w-2 h-2 rounded-full bg-[#1a6fa8]" />
                Chờ thanh toán
              </span>
              <span className="db-bulk-stat-value" style={{ color: '#1a6fa8' }}>
                {bulkOrderStats.awaitingPayment} đơn
              </span>
            </div>
            <div className="db-bulk-stat-item" style={{ background: '#ecfdf5' }}>
              <span className="db-bulk-stat-label" style={{ color: '#065f46' }}>
                <span className="w-2 h-2 rounded-full bg-[#065f46]" />
                Đang xử lý
              </span>
              <span className="db-bulk-stat-value" style={{ color: '#065f46' }}>
                {bulkOrderStats.processing} đơn
              </span>
            </div>
          </div>
          <div className="db-bulk-footer">
            <div className="db-bulk-footer-text">
              Tổng doanh thu tháng này:{' '}
              <span className="db-bulk-footer-value">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(bulkOrderStats.revenueThisMonth)}
              </span>
            </div>
            <div className="db-bulk-footer-text">
              Đơn mới hôm nay:{' '}
              <span className="db-bulk-footer-value">
                {bulkOrderStats.newOrdersToday}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="db-kpi-grid">
        <div className="db-kpi-card green">
          <div className="db-kpi-header">
            <span className="db-kpi-title">Total Revenue</span>
            <div className="db-kpi-icon green">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="db-kpi-value">{formattedRevenue}</div>
          {kpis?.totalRevenue?.change != null && (
            <span
              className={`db-kpi-trend ${
                kpis.totalRevenue.change >= 0 ? 'up' : 'down'
              }`}
            >
              {kpis.totalRevenue.change >= 0 ? '+' : ''}
              {kpis.totalRevenue.change}%
            </span>
          )}
        </div>
        <div className="db-kpi-card blue">
          <div className="db-kpi-header">
            <span className="db-kpi-title">Orders Today</span>
            <div className="db-kpi-icon blue">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="db-kpi-value">
            {kpis?.ordersToday?.value ?? 0}
          </div>
          {kpis?.ordersToday?.change != null && (
            <span
              className={`db-kpi-trend ${
                kpis.ordersToday.change >= 0 ? 'up' : 'down'
              }`}
            >
              {kpis.ordersToday.change >= 0 ? '+' : ''}
              {kpis.ordersToday.change}%
            </span>
          )}
        </div>
        <div className="db-kpi-card violet">
          <div className="db-kpi-header">
            <span className="db-kpi-title">Active Products</span>
            <div className="db-kpi-icon violet">
              <Package size={20} />
            </div>
          </div>
          <div className="db-kpi-value">
            {kpis?.activeProducts?.value ?? 0}
          </div>
          {kpis?.activeProducts?.change != null && (
            <span
              className={`db-kpi-trend ${
                kpis.activeProducts.change >= 0 ? 'up' : 'down'
              }`}
            >
              {kpis.activeProducts.change >= 0 ? '+' : ''}
              {kpis.activeProducts.change}%
            </span>
          )}
        </div>
        <div className="db-kpi-card orange">
          <div className="db-kpi-header">
            <span className="db-kpi-title">Total Customers</span>
            <div className="db-kpi-icon orange">
              <Users size={20} />
            </div>
          </div>
          <div className="db-kpi-value">
            {kpis?.totalCustomers?.value ?? 0}
          </div>
          {kpis?.totalCustomers?.change != null && (
            <span
              className={`db-kpi-trend ${
                kpis.totalCustomers.change >= 0 ? 'up' : 'down'
              }`}
            >
              {kpis.totalCustomers.change >= 0 ? '+' : ''}
              {kpis.totalCustomers.change}%
            </span>
          )}
        </div>
      </div>

      <div className="db-chart-grid">
        <div className="db-chart-card">
          <h3 className="db-chart-title">Revenue Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            {revenueData?.length > 0 ? (
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3da" />
                <XAxis
                  dataKey="day"
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <YAxis
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                  tickFormatter={(v) => `₫${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(value)
                  }
                  contentStyle={{
                    backgroundColor: '#faf9f7',
                    border: '1px solid #e8e3da',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <div className="db-empty">No revenue data available</div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="db-chart-card">
          <h3 className="db-chart-title">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            {orderStatusData?.length > 0 ? (
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry: { color?: string }, i: number) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={entry.color || chartColors.violet}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#faf9f7',
                    border: '1px solid #e8e3da',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                  }}
                />
              </PieChart>
            ) : (
              <div className="db-empty">No order status data available</div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="db-chart-card">
          <h3 className="db-chart-title">Top Products (This Month)</h3>
          <ResponsiveContainer width="100%" height={280}>
            {topProductsData?.length > 0 ? (
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3da" />
                <XAxis
                  type="number"
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <YAxis
                  dataKey="product"
                  type="category"
                  width={120}
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#faf9f7',
                    border: '1px solid #e8e3da',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill={chartColors.accent}
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            ) : (
              <div className="db-empty">No product data available</div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="db-chart-card">
          <h3 className="db-chart-title">Customer Growth (6 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            {customerGrowthData?.length > 0 ? (
              <AreaChart data={customerGrowthData}>
                <defs>
                  <linearGradient
                    id="colorCustomers"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={chartColors.violet}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColors.violet}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e3da" />
                <XAxis
                  dataKey="month"
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <YAxis
                  stroke="#9c9085"
                  style={{ fontFamily: 'Inter', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#faf9f7',
                    border: '1px solid #e8e3da',
                    borderRadius: 8,
                    fontFamily: 'Inter',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke={chartColors.violet}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCustomers)"
                />
              </AreaChart>
            ) : (
              <div className="db-empty">No customer data available</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="db-table-card">
        <div className="db-table-header">
          <h3 className="db-table-title">Recent Orders</h3>
        </div>
        {recentOrders?.length > 0 ? (
          <table className="db-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => {
                if (!order) return null;
                let formattedDate = order.date;
                try {
                  if (order.date) {
                    formattedDate = format(
                      new Date(order.date),
                      'dd/MM/yyyy HH:mm'
                    );
                  }
                } catch {
                  // fallback
                }
                return (
                  <tr key={order.orderCode || order.id || index}>
                    <td>
                      <span className="db-id-text">
                        {order.orderCode || order.id || '—'}
                      </span>
                    </td>
                    <td>{order.customer ?? '—'}</td>
                    <td>
                      <span className="db-price">
                        ₫{order.amount?.toLocaleString('vi-VN') ?? '0'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={statusClass(order.status ?? '')}
                      >
                        {order.status ?? '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
                      {formattedDate ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="db-empty">No recent orders found</div>
        )}
      </div>
    </div>
  );
}
