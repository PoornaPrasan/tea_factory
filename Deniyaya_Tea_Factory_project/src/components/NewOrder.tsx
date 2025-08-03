import React, { useState } from 'react';
import { useTeaShop } from '../context/TeaShopContext';
import { OrderItem, Tea, Customer } from '../types';
import { Plus, Minus, ShoppingCart, X, Search, User, Leaf } from 'lucide-react';

const NewOrder: React.FC = () => {
  const { teas, customers, addOrder } = useTeaShop();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTea, setSearchTea] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [notes, setNotes] = useState('');

  const filteredTeas = searchTea 
    ? teas.filter(tea => 
        tea.name.toLowerCase().includes(searchTea.toLowerCase()) ||
        tea.type.toLowerCase().includes(searchTea.toLowerCase())
      )
    : teas;

  const filteredCustomers = searchCustomer
    ? customers.filter(customer =>
        customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
        customer.phone.includes(searchCustomer)
      )
    : customers;

  const addToOrder = (tea: Tea) => {
    const existingItem = orderItems.find(item => item.teaId === tea.id);
    if (existingItem) {
      setOrderItems(prev => 
        prev.map(item => 
          item.teaId === tea.id 
            ? { ...item, quantity: item.quantity + 0.5, total: (item.quantity + 0.5) * item.pricePerKg }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        teaId: tea.id,
        teaName: tea.name,
        quantity: 0.5,
        pricePerKg: tea.pricePerKg,
        total: 0.5 * tea.pricePerKg
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (teaId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(teaId);
      return;
    }
    setOrderItems(prev =>
      prev.map(item =>
        item.teaId === teaId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.pricePerKg }
          : item
      )
    );
  };

  const removeFromOrder = (teaId: string) => {
    setOrderItems(prev => prev.filter(item => item.teaId !== teaId));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmitOrder = () => {
    if (!selectedCustomer || orderItems.length === 0) return;

    const newOrder = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: orderItems,
      totalAmount: getTotalAmount(),
      status: 'Pending' as const,
      orderDate: new Date().toISOString().split('T')[0],
      notes: notes || undefined
    };

    addOrder(newOrder);
    
    // Reset form
    setSelectedCustomer(null);
    setOrderItems([]);
    setNotes('');
    setSearchTea('');
    setSearchCustomer('');
    
    alert('Order created successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-600">Add a new order for your customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Customer</h3>
          
          {selectedCustomer ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tea Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Tea Products</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search teas..."
              value={searchTea}
              onChange={(e) => setSearchTea(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredTeas.map(tea => (
              <div key={tea.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{tea.name}</p>
                    <p className="text-sm text-gray-600">{tea.type}</p>
                    <p className="text-sm font-medium text-green-600">LKR {tea.pricePerKg.toLocaleString()}/kg</p>
                  </div>
                  <button
                    onClick={() => addToOrder(tea)}
                    disabled={tea.quantityInStock === 0}
                    className={`p-2 rounded-lg ${
                      tea.quantityInStock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } transition-colors duration-200`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">Stock: {tea.quantityInStock} kg</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          
          {orderItems.length > 0 ? (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-3">
                {orderItems.map(item => (
                  <div key={item.teaId} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.teaName}</p>
                        <p className="text-sm text-gray-600">LKR {item.pricePerKg.toLocaleString()}/kg</p>
                      </div>
                      <button
                        onClick={() => removeFromOrder(item.teaId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.teaId, item.quantity - 0.5)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium">{item.quantity} kg</span>
                        <button
                          onClick={() => updateQuantity(item.teaId, item.quantity + 0.5)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">LKR {item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
                  <span>Total:</span>
                  <span>LKR {getTotalAmount().toLocaleString()}</span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions or notes..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={!selectedCustomer || orderItems.length === 0}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    selectedCustomer && orderItems.length > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Create Order</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Add tea products to start building the order</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrder;