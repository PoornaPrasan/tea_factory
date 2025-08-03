import React, { useState } from 'react';
import { useTeaShop } from '../context/TeaShopContext';
import { Tea } from '../types';
import { Plus, Search, Edit, Trash2, Package, AlertCircle } from 'lucide-react';

const TeaInventory: React.FC = () => {
  const { teas, addTea, updateTea, deleteTea, searchTeas } = useTeaShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTea, setEditingTea] = useState<Tea | null>(null);
  const [formData, setFormData] = useState<Omit<Tea, 'id'>>({
    name: '',
    type: 'Black Tea',
    origin: '',
    pricePerKg: 0,
    quantityInStock: 0,
    description: '',
    harvestDate: '',
    expiryDate: '',
    grade: ''
  });

  const filteredTeas = searchQuery ? searchTeas(searchQuery) : teas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTea) {
      updateTea(editingTea.id, formData);
      setEditingTea(null);
    } else {
      addTea(formData);
    }
    setFormData({
      name: '',
      type: 'Black Tea',
      origin: '',
      pricePerKg: 0,
      quantityInStock: 0,
      description: '',
      harvestDate: '',
      expiryDate: '',
      grade: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (tea: Tea) => {
    setFormData(tea);
    setEditingTea(tea);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTea(null);
    setFormData({
      name: '',
      type: 'Black Tea',
      origin: '',
      pricePerKg: 0,
      quantityInStock: 0,
      description: '',
      harvestDate: '',
      expiryDate: '',
      grade: ''
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (quantity < 10) return { label: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tea Inventory</h1>
          <p className="text-gray-600">Manage your tea collection and stock levels</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Tea</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search teas by name, type, or origin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingTea ? 'Edit Tea Product' : 'Add New Tea Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tea Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tea Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Tea['type'] })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Black Tea">Black Tea</option>
                    <option value="Green Tea">Green Tea</option>
                    <option value="White Tea">White Tea</option>
                    <option value="Herbal Tea">Herbal Tea</option>
                    <option value="Oolong Tea">Oolong Tea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    required
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input
                    type="text"
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per KG (LKR)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock (KG)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  {editingTea ? 'Update Tea' : 'Add Tea'}
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

      {/* Tea Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeas.map(tea => {
          const stockStatus = getStockStatus(tea.quantityInStock);
          return (
            <div key={tea.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tea.name}</h3>
                    <p className="text-sm text-gray-600">{tea.type} • {tea.grade}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                    {stockStatus.label}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{tea.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Origin:</span>
                    <span className="font-medium">{tea.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price per KG:</span>
                    <span className="font-medium">LKR {tea.pricePerKg.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${tea.quantityInStock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {tea.quantityInStock} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Harvest:</span>
                    <span className="font-medium">{new Date(tea.harvestDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {tea.quantityInStock < 10 && (
                  <div className="mt-3 flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Low stock - reorder soon</span>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(tea)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteTea(tea.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeas.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tea products found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Start by adding your first tea product'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Add Your First Tea
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeaInventory;