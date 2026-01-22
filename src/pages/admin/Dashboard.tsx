import {
  DollarSign,
  Package,
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

import { KPICard } from '../../components/admin/KPICard';

// Mock data
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  revenue: Math.floor(Math.random() * 10000) + 5000,
}));

const orderStatusData = [
  { name: 'Pending', value: 45, color: '#F59E0B' },
  { name: 'Processing', value: 120, color: '#3B82F6' },
  { name: 'Shipped', value: 80, color: '#8B5CF6' },
  { name: 'Delivered', value: 350, color: '#10B981' },
  { name: 'Cancelled', value: 25, color: '#EF4444' },
];

const topProductsData = [
  { product: 'iPhone 15 Pro', sales: 234 },
  { product: 'AirPods Pro', sales: 189 },
  { product: 'MacBook Air M2', sales: 156 },
  { product: 'iPad Air', sales: 143 },
  { product: 'Apple Watch', sales: 128 },
  { product: 'Magic Keyboard', sales: 98 },
  { product: 'USB-C Cable', sales: 87 },
  { product: 'MagSafe Charger', sales: 76 },
];

const customerGrowthData = Array.from({ length: 6 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
  customers: Math.floor(Math.random() * 500) + 1000 + i * 100,
}));

const recentOrders = [
  {
    id: 'ORD-2401',
    customer: 'Nguyễn Văn A',
    amount: 1234000,
    status: 'Delivered',
    date: '2024-01-22',
  },
  {
    id: 'ORD-2402',
    customer: 'Trần Thị B',
    amount: 567000,
    status: 'Shipped',
    date: '2024-01-22',
  },
  {
    id: 'ORD-2403',
    customer: 'Lê Văn C',
    amount: 890000,
    status: 'Processing',
    date: '2024-01-22',
  },
  {
    id: 'ORD-2404',
    customer: 'Phạm Thị D',
    amount: 2340000,
    status: 'Pending',
    date: '2024-01-21',
  },
  {
    id: 'ORD-2405',
    customer: 'Hoàng Văn E',
    amount: 456000,
    status: 'Delivered',
    date: '2024-01-21',
  },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
          Dashboard
        </h1>
        <p className="mt-1 font-['Fira_Sans'] text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value="₫45.2M"
          change={12.5}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Orders Today"
          value={234}
          change={8.3}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Active Products"
          value={1248}
          change={-2.1}
          icon={Package}
          color="purple"
        />
        <KPICard
          title="Total Customers"
          value={5698}
          change={15.2}
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
              />
              <Tooltip
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
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Orders by Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
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
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Top Products (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
              <XAxis
                type="number"
                stroke="#9333EA"
                style={{ fontFamily: 'Fira Sans', fontSize: 12 }}
              />
              <YAxis
                dataKey="product"
                type="category"
                width={120}
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
          </ResponsiveContainer>
        </div>

        {/* Customer Growth */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
            Customer Growth (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerGrowthData}>
              <defs>
                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
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
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 font-['Fira_Code'] text-lg font-semibold text-purple-900">
          Recent Orders
        </h3>
        <div className="overflow-x-auto">
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
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-purple-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-purple-600">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {order.customer}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    ₫{order.amount.toLocaleString()}
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
                              : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
