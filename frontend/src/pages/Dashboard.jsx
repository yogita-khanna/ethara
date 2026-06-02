import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatStock, formatDate } from '../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`p-3 rounded-full ${colorClass} mr-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary
  });

  if (isLoading) return <div className="flex h-full items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading dashboard data</div>;

  const chartData = data?.orders_by_status 
    ? Object.entries(data.orders_by_status).map(([name, value]) => ({ name, value }))
    : [];
  
  const COLORS = ['#F59E0B', '#3B82F6', '#6366F1', '#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={data.total_products} icon={Package} colorClass="bg-blue-500" />
        <StatCard title="Total Customers" value={data.total_customers} icon={Users} colorClass="bg-green-500" />
        <StatCard title="Total Orders" value={data.total_orders} icon={ShoppingCart} colorClass="bg-purple-500" />
        <StatCard title="Total Revenue" value={formatCurrency(data.total_revenue)} icon={DollarSign} colorClass="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Low Stock Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.low_stock_products?.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No low stock items</td></tr>
                  ) : (
                    data.low_stock_products?.map((product) => (
                      <tr key={product.uid} className={product.quantity <= 5 ? "bg-red-50" : "bg-yellow-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity <= 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {product.quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recent_orders?.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No recent orders</td></tr>
                  ) : (
                    data.recent_orders?.map((order) => (
                      <tr key={order.uid}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.uid}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(order.total_amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow overflow-hidden h-96 flex flex-col">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Orders by Status</h2>
          </div>
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend className="capitalize" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
