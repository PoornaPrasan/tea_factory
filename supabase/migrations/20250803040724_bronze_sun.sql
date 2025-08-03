-- Seed data for Deniyaya Tea Nest

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@deniyayateanest.com', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'admin');

-- Insert sample tea products
INSERT OR IGNORE INTO teas (id, name, type, origin, price_per_kg, quantity_in_stock, description, harvest_date, expiry_date, grade) VALUES 
('1', 'Ceylon Gold Premium', 'Black Tea', 'Deniyaya Estate', 2500.00, 45.0, 'High-grown premium black tea with rich flavor and bright color', '2024-01-15', '2025-01-15', 'PEKOE'),
('2', 'Mountain Mist Green', 'Green Tea', 'Sinharaja Hills', 3200.00, 8.0, 'Delicate green tea with fresh, grassy notes', '2024-02-10', '2024-08-10', 'GUNPOWDER'),
('3', 'Silver Tips White', 'White Tea', 'Nuwara Eliya', 8500.00, 5.0, 'Rare white tea with subtle sweetness and silver tips', '2024-03-05', '2025-03-05', 'SILVER TIPS'),
('4', 'Ayurvedic Wellness', 'Herbal Tea', 'Local Herbs', 1800.00, 25.0, 'Traditional herbal blend with turmeric, ginger, and holy basil', '2024-01-20', '2024-07-20', 'ORGANIC'),
('5', 'Royal Oolong', 'Oolong Tea', 'Kandy Hills', 4200.00, 18.0, 'Semi-fermented tea with complex floral notes', '2024-02-28', '2024-08-28', 'SPECIAL'),
('6', 'Estate Breakfast Blend', 'Black Tea', 'Deniyaya Estate', 1900.00, 3.0, 'Strong breakfast tea perfect with milk', '2024-01-10', '2025-01-10', 'BROKEN PEKOE');

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, name, email, phone, address, total_orders, total_spent, last_order_date) VALUES 
('1', 'Priya Jayawardena', 'priya.j@email.com', '+94 77 123 4567', 'No. 25, Galle Road, Mirissa', 8, 45600.00, '2024-12-15'),
('2', 'David Wilson', 'david.wilson@email.com', '+94 71 987 6543', 'Beach Resort, Coconut Tree Hill Road', 3, 12800.00, '2024-12-10'),
('3', 'Kumari Perera', 'kumari.p@email.com', '+94 75 456 7890', 'Temple Road, Weligama', 15, 89200.00, '2024-12-14');

-- Insert sample orders
INSERT OR IGNORE INTO orders (id, customer_id, customer_name, total_amount, status, order_date, delivery_date, notes) VALUES 
('1', '1', 'Priya Jayawardena', 6800.00, 'Delivered', '2024-12-15', '2024-12-16', 'Customer prefers morning delivery'),
('2', '2', 'David Wilson', 4250.00, 'Packed', '2024-12-14', NULL, 'Gift packaging requested'),
('3', '3', 'Kumari Perera', 20900.00, 'Confirmed', '2024-12-13', NULL, 'Bulk order for family business');

-- Insert sample order items
INSERT OR IGNORE INTO order_items (order_id, tea_id, tea_name, quantity, price_per_kg, total) VALUES 
('1', '1', 'Ceylon Gold Premium', 2.0, 2500.00, 5000.00),
('1', '4', 'Ayurvedic Wellness', 1.0, 1800.00, 1800.00),
('2', '3', 'Silver Tips White', 0.5, 8500.00, 4250.00),
('3', '1', 'Ceylon Gold Premium', 5.0, 2500.00, 12500.00),
('3', '5', 'Royal Oolong', 2.0, 4200.00, 8400.00);

-- Insert sample customer feedback
INSERT OR IGNORE INTO customer_feedback (customer_id, order_id, rating, comment) VALUES 
('1', '1', 5, 'Excellent quality tea! The Ceylon Gold Premium is amazing.'),
('2', '2', 4, 'Beautiful packaging and great taste. Will order again.'),
('3', '3', 5, 'Perfect for our family business. Consistent quality and good pricing.');