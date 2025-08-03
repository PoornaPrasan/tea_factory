import React from 'react';
import { useTeaShop } from '../context/TeaShopContext';
import { TrendingUp, ShoppingBag, Package, Users, AlertTriangle, Leaf } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { getDashboardStats, getLowStockTeas, orders, teas } = useTeaShop();
  const stats = getDashboardStats();
  const lowStockTeas = getLowStockTeas();
  const recentOrders = orders.slice(-5).reverse();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' && title.includes('Revenue') 
              ? `LKR ${value.toLocaleString()}`
              : value
            }
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color.replace('border-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Dashboard</h1>
        <p className="text-gray-600">Overview of your tea shop operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={TrendingUp}
          color="border-green-500"
          subtitle="All time earnings"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="border-blue-500"
          subtitle="Orders processed"
        />
        <StatCard
          title="Tea Varieties"
          value={teas.length}
          icon={Leaf}
          color="border-amber-500"
          subtitle="Products in catalog"
        />
        <StatCard
          title="Active Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="border-purple-500"
          subtitle="Registered customers"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Revenue</h3>
          <p className="text-3xl font-bold text-green-600">LKR {stats.dailyRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Today's earnings</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">LKR {stats.weeklyRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">LKR {stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          {lowStockTeas.length > 0 ? (
            <div className="space-y-3">
              {lowStockTeas.map(tea => (
                <div key={tea.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <p className="font-medium text-gray-800">{tea.name}</p>
                    <p className="text-sm text-gray-600">{tea.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{tea.quantityInStock} kg</p>
                    <p className="text-xs text-gray-500">Stock remaining</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600">All tea varieties are well stocked!</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">LKR {order.totalAmount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Packed' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No orders yet today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;