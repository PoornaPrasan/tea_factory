import { Tea, Customer, Order } from '../types';

export const mockTeas: Tea[] = [
  {
    id: '1',
    name: 'Ceylon Gold Premium',
    type: 'Black Tea',
    origin: 'Deniyaya Estate',
    pricePerKg: 2500,
    quantityInStock: 45,
    description: 'High-grown premium black tea with rich flavor and bright color',
    harvestDate: '2024-01-15',
    expiryDate: '2025-01-15',
    grade: 'PEKOE'
  },
  {
    id: '2',
    name: 'Mountain Mist Green',
    type: 'Green Tea',
    origin: 'Sinharaja Hills',
    pricePerKg: 3200,
    quantityInStock: 8,
    description: 'Delicate green tea with fresh, grassy notes',
    harvestDate: '2024-02-10',
    expiryDate: '2024-08-10',
    grade: 'GUNPOWDER'
  },
  {
    id: '3',
    name: 'Silver Tips White',
    type: 'White Tea',
    origin: 'Nuwara Eliya',
    pricePerKg: 8500,
    quantityInStock: 5,
    description: 'Rare white tea with subtle sweetness and silver tips',
    harvestDate: '2024-03-05',
    expiryDate: '2025-03-05',
    grade: 'SILVER TIPS'
  },
  {
    id: '4',
    name: 'Ayurvedic Wellness',
    type: 'Herbal Tea',
    origin: 'Local Herbs',
    pricePerKg: 1800,
    quantityInStock: 25,
    description: 'Traditional herbal blend with turmeric, ginger, and holy basil',
    harvestDate: '2024-01-20',
    expiryDate: '2024-07-20',
    grade: 'ORGANIC'
  },
  {
    id: '5',
    name: 'Royal Oolong',
    type: 'Oolong Tea',
    origin: 'Kandy Hills',
    pricePerKg: 4200,
    quantityInStock: 18,
    description: 'Semi-fermented tea with complex floral notes',
    harvestDate: '2024-02-28',
    expiryDate: '2024-08-28',
    grade: 'SPECIAL'
  },
  {
    id: '6',
    name: 'Estate Breakfast Blend',
    type: 'Black Tea',
    origin: 'Deniyaya Estate',
    pricePerKg: 1900,
    quantityInStock: 3,
    description: 'Strong breakfast tea perfect with milk',
    harvestDate: '2024-01-10',
    expiryDate: '2025-01-10',
    grade: 'BROKEN PEKOE'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Priya Jayawardena',
    email: 'priya.j@email.com',
    phone: '+94 77 123 4567',
    address: 'No. 25, Galle Road, Mirissa',
    totalOrders: 8,
    totalSpent: 45600,
    lastOrderDate: '2024-12-15'
  },
  {
    id: '2',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+94 71 987 6543',
    address: 'Beach Resort, Coconut Tree Hill Road',
    totalOrders: 3,
    totalSpent: 12800,
    lastOrderDate: '2024-12-10'
  },
  {
    id: '3',
    name: 'Kumari Perera',
    email: 'kumari.p@email.com',
    phone: '+94 75 456 7890',
    address: 'Temple Road, Weligama',
    totalOrders: 15,
    totalSpent: 89200,
    lastOrderDate: '2024-12-14'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Priya Jayawardena',
    items: [
      {
        teaId: '1',
        teaName: 'Ceylon Gold Premium',
        quantity: 2,
        pricePerKg: 2500,
        total: 5000
      },
      {
        teaId: '4',
        teaName: 'Ayurvedic Wellness',
        quantity: 1,
        pricePerKg: 1800,
        total: 1800
      }
    ],
    totalAmount: 6800,
    status: 'Delivered',
    orderDate: '2024-12-15',
    deliveryDate: '2024-12-16',
    notes: 'Customer prefers morning delivery'
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'David Wilson',
    items: [
      {
        teaId: '3',
        teaName: 'Silver Tips White',
        quantity: 0.5,
        pricePerKg: 8500,
        total: 4250
      }
    ],
    totalAmount: 4250,
    status: 'Packed',
    orderDate: '2024-12-14',
    notes: 'Gift packaging requested'
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Kumari Perera',
    items: [
      {
        teaId: '1',
        teaName: 'Ceylon Gold Premium',
        quantity: 5,
        pricePerKg: 2500,
        total: 12500
      },
      {
        teaId: '5',
        teaName: 'Royal Oolong',
        quantity: 2,
        pricePerKg: 4200,
        total: 8400
      }
    ],
    totalAmount: 20900,
    status: 'Confirmed',
    orderDate: '2024-12-13',
    notes: 'Bulk order for family business'
  }
];