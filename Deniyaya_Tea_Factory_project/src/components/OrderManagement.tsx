import React, { useState } from 'react';
import { useTeaShop } from '../context/TeaShopContext';
import { Search, Eye, Edit, Trash2, ShoppingCart, Calendar, User } from 'lucide-react';

const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, searchOrders, customers } = useTeaShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = searchQuery ? searchOrders(searchQuery) : orders;
  const finalOrders = statusFilter === 'all' 
    ? filteredOrders 
    : filteredOrders.filter(order => order.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-100 text-gray-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Packed': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedOrderDetails = selectedOrder ? orders.find(o => o.id === selectedOrder) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Track and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search orders by customer name or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Packed">Packed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {finalOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      LKR {order.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {finalOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'No orders have been placed yet'}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Order Details #{selectedOrderDetails.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Customer</label>
                  <p className="text-gray-900">{selectedOrderDetails.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order Date</label>
                  <p className="text-gray-900">{new Date(selectedOrderDetails.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrderDetails.status)}`}>
                    {selectedOrderDetails.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-gray-900 font-semibold">LKR {selectedOrderDetails.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              {selectedOrderDetails.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900">{selectedOrderDetails.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Order Items</label>
                <div className="space-y-2">
                  {selectedOrderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.teaName}</p>
                        <p className="text-sm text-gray-600">{item.quantity} kg × LKR {item.pricePerKg.toLocaleString()}/kg</p>
                      </div>
                      <p className="font-semibold text-gray-900">LKR {item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;