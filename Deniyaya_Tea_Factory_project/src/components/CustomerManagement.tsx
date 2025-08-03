import React, { useState } from 'react';
import { useTeaShop } from '../context/TeaShopContext';
import { Customer } from '../types';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';

const CustomerManagement: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, searchCustomers } = useTeaShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      setEditingCustomer(null);
    } else {
      addCustomer(formData);
    }
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setEditingCustomer(customer);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage your customer database and relationships</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                  <p className="text-sm text-gray-600">Customer ID: {customer.id}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-start space-x-2 text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="flex-1">{customer.address}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Orders:</span>
                <span className="font-medium text-gray-900">{customer.totalOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Spent:</span>
                <span className="font-medium text-gray-900">LKR {customer.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Order:</span>
                <span className="font-medium text-gray-900">
                  {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleEdit(customer)}
                className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => deleteCustomer(customer.id)}
                className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first customer'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Add Your First Customer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;