import { format } from 'date-fns';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
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

import { KPICard } from '../../components/admin/KPICard';
import { useDashboard } from '../../hooks/useDashboard';

export function Dashboard() {
  const {
    kpis,
    revenueData,
    orderStatusData,
    topProductsData,
    customerGrowthData,
    recentOrders,
    isLoading,
    error,
    refreshData,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600 border-t-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="rounded-lg bg-red-50 p-6 text-center shadow-md">
          <h3 className="mb-2 text-xl font-semibold text-red-800">
            Failed to load dashboard data
          </h3>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={refreshData}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback defaults if API data is missing structure
  const formattedRevenue = kpis?.totalRevenue?.value
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(kpis.totalRevenue.value)
    : '₫0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            Dashboard
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <button
          onClick={refreshData}
          className="rounded-md bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formattedRevenue}
          change={kpis?.totalRevenue?.change || 0}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Orders Today"
          value={kpis?.ordersToday?.value || 0}
          change={kpis?.ordersToday?.change || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Active Products"
          value={kpis?.activeProducts?.value || 0}
          change={kpis?.activeProducts?.change || 0}
          icon={Package}
          color="purple"
        />
        <KPICard
          title="Total Customers"
          value={kpis?.totalCustomers?.value || 0}
          change={kpis?.totalCustomers?.change || 0}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Revenue Trend (30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {revenueData?.length > 0 ? (
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis
                  dataKey="day"
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                />
                <YAxis
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                  tickFormatter={(value) => `₫${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(value)
                  }
                  contentStyle={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #C084FC',
                    borderRadius: '8px',
                    fontFamily: 'Fira Sans',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#8884d8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #C084FC',
                    borderRadius: '8px',
                    fontFamily: 'Fira Sans',
                  }}
                />
              </PieChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No order status data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Top Products (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {topProductsData?.length > 0 ? (
              <BarChart
                data={topProductsData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis
                  type="number"
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                />
                <YAxis
                  dataKey="product"
                  type="category"
                  width={140}
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #C084FC',
                    borderRadius: '8px',
                    fontFamily: 'Fira Sans',
                  }}
                />
                <Bar dataKey="sales" fill="#F97316" radius={[0, 8, 8, 0]} />
              </BarChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No product data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Customer Growth (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis
                  dataKey="month"
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                />
                <YAxis
                  stroke="#9333EA"
                  style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #C084FC',
                    borderRadius: '8px',
                    fontFamily: 'Fira Sans',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCustomers)"
                />
              </AreaChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No customer data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
          Recent Orders
        </h3>
        <div className="overflow-x-auto">
          {recentOrders?.length > 0 ? (
            <table className="w-full font-['Fira_Sans']">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {recentOrders.map((order: any) => {
                  let formattedDate = order.date;
                  try {
                    formattedDate = format(
                      new Date(order.date),
                      'dd/MM/yyyy HH:mm'
                    );
                  } catch (_e) {
                    // Fallback to raw if unparseable
                  }

                  return (
                    <tr
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-purple-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-purple-600">
                        {order.orderCode || order.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₫{order.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'Processing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No recent orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
