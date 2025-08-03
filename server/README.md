# Deniyaya Tea Nest - Backend API

A comprehensive Node.js backend API for managing a tea shop's operations, built with Express.js and SQLite.

## Features

### Core Functionality
- **Tea Inventory Management**: Add, edit, delete, and track tea products with detailed information
- **Customer Management**: Maintain customer records with order history and statistics
- **Order Processing**: Complete order lifecycle from creation to delivery
- **Dashboard Analytics**: Real-time business insights and key performance indicators

### Additional Features
- **Customer Feedback System**: Collect and manage customer reviews and ratings
- **Inventory Tracking**: Automatic stock updates and low-stock alerts
- **Sales Analytics**: Detailed reporting on sales trends and customer behavior
- **User Authentication**: Secure login system with role-based access control
- **Data Validation**: Comprehensive input validation and error handling

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Custom middleware
- **Logging**: Morgan

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user info

### Tea Management
- `GET /api/teas` - Get all teas (with search/filter)
- `GET /api/teas/:id` - Get tea by ID
- `POST /api/teas` - Create new tea
- `PUT /api/teas/:id` - Update tea
- `DELETE /api/teas/:id` - Delete tea
- `GET /api/teas/:id/transactions` - Get inventory transactions

### Customer Management
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/orders` - Get customer orders
- `GET /api/customers/:id/feedback` - Get customer feedback

### Order Management
- `GET /api/orders` - Get all orders (with filters)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/low-stock` - Get low stock items
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/analytics` - Get sales analytics

### Customer Feedback
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback/:id` - Get feedback by ID
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback
- `GET /api/feedback/stats/summary` - Get feedback statistics

## Database Schema

### Tables
- **users**: System users with authentication
- **teas**: Tea product catalog
- **customers**: Customer information and statistics
- **orders**: Order records
- **order_items**: Individual items within orders
- **inventory_transactions**: Stock movement tracking
- **customer_feedback**: Customer reviews and ratings

### Key Features
- Foreign key constraints for data integrity
- Automatic timestamp tracking
- Indexes for performance optimization
- Transaction support for complex operations

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security**: Additional security headers
- **SQL Injection Protection**: Parameterized queries

## Business Logic

### Inventory Management
- Automatic stock updates when orders are placed
- Low stock alerts (< 10 kg)
- Inventory transaction logging
- Stock restoration on order cancellation

### Customer Analytics
- Automatic calculation of total orders and spending
- Last order date tracking
- Customer lifetime value metrics

### Order Processing
- Stock validation before order creation
- Automatic customer statistics updates
- Order status tracking with delivery dates
- Complete order lifecycle management

## Error Handling

- Comprehensive error responses
- Transaction rollback on failures
- Graceful degradation
- Detailed logging for debugging

## Getting Started

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npm run init-db
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./database/tea_shop.db
CORS_ORIGIN=http://localhost:5173
```

## Default Admin Account

- **Username**: admin
- **Email**: admin@deniyayateanest.com
- **Password**: admin123

## Why These Technologies?

### SQLite
- **Simplicity**: Perfect for small to medium businesses
- **No Setup Required**: File-based database, no server needed
- **ACID Compliance**: Reliable transactions
- **Portability**: Easy to backup and migrate

### Express.js
- **Mature Ecosystem**: Extensive middleware and community support
- **Flexibility**: Unopinionated framework allowing custom architecture
- **Performance**: Fast and lightweight
- **Scalability**: Easy to scale horizontally

### JWT Authentication
- **Stateless**: No server-side session storage needed
- **Secure**: Industry-standard token format
- **Flexible**: Easy to implement role-based access

This backend provides a solid foundation for the Deniyaya Tea Nest management system, with room for future enhancements and scaling as the business grows.