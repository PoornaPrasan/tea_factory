export interface Tea {
  id: string;
  name: string;
  type: 'Black Tea' | 'Green Tea' | 'White Tea' | 'Herbal Tea' | 'Oolong Tea';
  origin: string;
  pricePerKg: number;
  quantityInStock: number;
  description: string;
  harvestDate: string;
  expiryDate: string;
  grade: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface OrderItem {
  teaId: string;
  teaName: string;
  quantity: number;
  pricePerKg: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Delivered' | 'Cancelled';
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  lowStockItems: number;
  totalCustomers: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}