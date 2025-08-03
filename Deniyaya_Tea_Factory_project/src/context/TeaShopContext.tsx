import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tea, Customer, Order, DashboardStats } from '../types';
import { mockTeas, mockCustomers, mockOrders } from '../data/mockData';

interface TeaShopContextType {
  teas: Tea[];
  customers: Customer[];
  orders: Order[];
  addTea: (tea: Omit<Tea, 'id'>) => void;
  updateTea: (id: string, tea: Partial<Tea>) => void;
  deleteTea: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  getDashboardStats: () => DashboardStats;
  getLowStockTeas: () => Tea[];
  searchTeas: (query: string) => Tea[];
  searchCustomers: (query: string) => Customer[];
  searchOrders: (query: string) => Order[];
}

const TeaShopContext = createContext<TeaShopContextType | undefined>(undefined);

export const useTeaShop = () => {
  const context = useContext(TeaShopContext);
  if (!context) {
    throw new Error('useTeaShop must be used within a TeaShopProvider');
  }
  return context;
};

interface TeaShopProviderProps {
  children: ReactNode;
}

export const TeaShopProvider: React.FC<TeaShopProviderProps> = ({ children }) => {
  const [teas, setTeas] = useState<Tea[]>(mockTeas);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const addTea = (tea: Omit<Tea, 'id'>) => {
    const newTea: Tea = {
      ...tea,
      id: Date.now().toString()
    };
    setTeas(prev => [...prev, newTea]);
  };

  const updateTea = (id: string, updatedTea: Partial<Tea>) => {
    setTeas(prev => prev.map(tea => tea.id === id ? { ...tea, ...updatedTea } : tea));
  };

  const deleteTea = (id: string) => {
    setTeas(prev => prev.filter(tea => tea.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: ''
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updatedCustomer: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => customer.id === id ? { ...customer, ...updatedCustomer } : customer));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString()
    };
    setOrders(prev => [...prev, newOrder]);

    // Update customer stats
    const customer = customers.find(c => c.id === order.customerId);
    if (customer) {
      updateCustomer(order.customerId, {
        totalOrders: customer.totalOrders + 1,
        totalSpent: customer.totalSpent + order.totalAmount,
        lastOrderDate: order.orderDate
      });
    }

    // Update tea stock
    order.items.forEach(item => {
      const tea = teas.find(t => t.id === item.teaId);
      if (tea) {
        updateTea(item.teaId, {
          quantityInStock: tea.quantityInStock - item.quantity
        });
      }
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const getDashboardStats = (): DashboardStats => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const lowStockItems = teas.filter(tea => tea.quantityInStock < 10).length;
    const totalCustomers = customers.length;

    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dailyRevenue = orders
      .filter(order => order.orderDate >= today)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const weeklyRevenue = orders
      .filter(order => order.orderDate >= thisWeek)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const monthlyRevenue = orders
      .filter(order => order.orderDate >= thisMonth)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalRevenue,
      totalOrders,
      lowStockItems,
      totalCustomers,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue
    };
  };

  const getLowStockTeas = (): Tea[] => {
    return teas.filter(tea => tea.quantityInStock < 10);
  };

  const searchTeas = (query: string): Tea[] => {
    return teas.filter(tea =>
      tea.name.toLowerCase().includes(query.toLowerCase()) ||
      tea.type.toLowerCase().includes(query.toLowerCase()) ||
      tea.origin.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchCustomers = (query: string): Customer[] => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone.includes(query)
    );
  };

  const searchOrders = (query: string): Order[] => {
    return orders.filter(order =>
      order.customerName.toLowerCase().includes(query.toLowerCase()) ||
      order.id.includes(query) ||
      order.status.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value = {
    teas,
    customers,
    orders,
    addTea,
    updateTea,
    deleteTea,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    getDashboardStats,
    getLowStockTeas,
    searchTeas,
    searchCustomers,
    searchOrders
  };

  return (
    <TeaShopContext.Provider value={value}>
      {children}
    </TeaShopContext.Provider>
  );
};