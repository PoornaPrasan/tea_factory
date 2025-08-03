const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateCustomer } = require('../middleware/validation');

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM customers WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY name';

        const customers = await database.all(sql, params);
        
        // Transform to match frontend format
        const transformedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            totalOrders: customer.total_orders,
            totalSpent: customer.total_spent,
            lastOrderDate: customer.last_order_date
        }));

        res.json(transformedCustomers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
    try {
        const customer = await database.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const transformedCustomer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            totalOrders: customer.total_orders,
            totalSpent: customer.total_spent,
            lastOrderDate: customer.last_order_date
        };

        res.json(transformedCustomer);
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new customer
router.post('/', authenticateToken, validateCustomer, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const id = uuidv4();

        // Check if email already exists
        const existingCustomer = await database.get('SELECT id FROM customers WHERE email = ?', [email]);
        if (existingCustomer) {
            return res.status(409).json({ error: 'Customer with this email already exists' });
        }

        await database.run(
            'INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, phone, address]
        );

        const newCustomer = {
            id,
            name,
            email,
            phone,
            address,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: ''
        };

        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update customer
router.put('/:id', authenticateToken, validateCustomer, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        
        // Check if email already exists for another customer
        const existingCustomer = await database.get('SELECT id FROM customers WHERE email = ? AND id != ?', [email, req.params.id]);
        if (existingCustomer) {
            return res.status(409).json({ error: 'Customer with this email already exists' });
        }

        const result = await database.run(
            'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [name, email, phone, address, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get updated customer data
        const updatedCustomer = await database.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        
        const transformedCustomer = {
            id: updatedCustomer.id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            address: updatedCustomer.address,
            totalOrders: updatedCustomer.total_orders,
            totalSpent: updatedCustomer.total_spent,
            lastOrderDate: updatedCustomer.last_order_date
        };

        res.json(transformedCustomer);
    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete customer
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Check if customer has orders
        const orders = await database.get('SELECT COUNT(*) as count FROM orders WHERE customer_id = ?', [req.params.id]);
        
        if (orders.count > 0) {
            return res.status(400).json({ error: 'Cannot delete customer with existing orders' });
        }

        const result = await database.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer orders
router.get('/:id/orders', async (req, res) => {
    try {
        const orders = await database.all(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC',
            [req.params.id]
        );

        // Get order items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await database.all(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );

            return {
                id: order.id,
                customerId: order.customer_id,
                customerName: order.customer_name,
                items: items.map(item => ({
                    teaId: item.tea_id,
                    teaName: item.tea_name,
                    quantity: item.quantity,
                    pricePerKg: item.price_per_kg,
                    total: item.total
                })),
                totalAmount: order.total_amount,
                status: order.status,
                orderDate: order.order_date,
                deliveryDate: order.delivery_date,
                notes: order.notes
            };
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer feedback
router.get('/:id/feedback', async (req, res) => {
    try {
        const feedback = await database.all(
            'SELECT * FROM customer_feedback WHERE customer_id = ? ORDER BY created_at DESC',
            [req.params.id]
        );

        res.json(feedback);
    } catch (error) {
        console.error('Get customer feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;