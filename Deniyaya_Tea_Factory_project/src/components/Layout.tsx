import React, { ReactNode } from 'react';
import { Leaf, BarChart3, Package, ShoppingCart, Users, PlusCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Tea Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'new-order', label: 'New Order', icon: PlusCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-amber-300" />
              <div>
                <h1 className="text-2xl font-bold">Deniyaya Tea Nest</h1>
                <p className="text-green-200 text-sm">Premium Ceylon Tea Shop • Mirissa, Sri Lanka</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-200">Welcome back!</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h2>
              <ul className="space-y-2">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onPageChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          currentPage === item.id
                            ? 'bg-green-100 text-green-800 border-l-4 border-green-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-green-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;