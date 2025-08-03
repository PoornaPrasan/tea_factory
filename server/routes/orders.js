const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
    try {
        const { search, status, startDate, endDate } = req.query;
        let sql = 'SELECT * FROM orders WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (customer_name LIKE ? OR id LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (startDate) {
            sql += ' AND order_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND order_date <= ?';
            params.push(endDate);
        }

        sql += ' ORDER BY order_date DESC, created_at DESC';

        const orders = await database.all(sql, params);

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
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await database.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = await database.all(
            'SELECT * FROM order_items WHERE order_id = ?',
            [order.id]
        );

        const transformedOrder = {
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

        res.json(transformedOrder);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new order
router.post('/', authenticateToken, validateOrder, async (req, res) => {
    try {
        const { customerId, customerName, items, totalAmount, orderDate, notes } = req.body;
        const orderId = uuidv4();

        await database.beginTransaction();

        try {
            // Create order
            await database.run(
                'INSERT INTO orders (id, customer_id, customer_name, total_amount, order_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, customerId, customerName, totalAmount, orderDate, notes]
            );

            // Create order items and update tea stock
            for (const item of items) {
                // Check if tea has enough stock
                const tea = await database.get('SELECT quantity_in_stock FROM teas WHERE id = ?', [item.teaId]);
                if (!tea) {
                    throw new Error(`Tea with ID ${item.teaId} not found`);
                }
                if (tea.quantity_in_stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.teaName}. Available: ${tea.quantity_in_stock} kg`);
                }

                // Insert order item
                await database.run(
                    'INSERT INTO order_items (order_id, tea_id, tea_name, quantity, price_per_kg, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [orderId, item.teaId, item.teaName, item.quantity, item.pricePerKg, item.total]
                );

                // Update tea stock
                await database.run(
                    'UPDATE teas SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
                    [item.quantity, item.teaId]
                );

                // Log inventory transaction
                await database.run(
                    'INSERT INTO inventory_transactions (tea_id, transaction_type, quantity_change, reference_id, notes) VALUES (?, ?, ?, ?, ?)',
                    [item.teaId, 'sale', -item.quantity, orderId, `Sale - Order ${orderId}`]
                );
            }

            // Update customer statistics
            await database.run(
                'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ?, last_order_date = ? WHERE id = ?',
                [totalAmount, orderDate, customerId]
            );

            await database.commit();

            // Return the created order
            const newOrder = {
                id: orderId,
                customerId,
                customerName,
                items,
                totalAmount,
                status: 'Pending',
                orderDate,
                notes
            };

            res.status(201).json(newOrder);
        } catch (error) {
            await database.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Delivered', 'Cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const deliveryDate = status === 'Delivered' ? new Date().toISOString().split('T')[0] : null;

        const result = await database.run(
            'UPDATE orders SET status = ?, delivery_date = ? WHERE id = ?',
            [status, deliveryDate, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order status updated successfully', status, deliveryDate });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update order
router.put('/:id', authenticateToken, validateOrder, async (req, res) => {
    try {
        const { customerId, customerName, items, totalAmount, orderDate, notes, status } = req.body;

        await database.beginTransaction();

        try {
            // Get current order to restore stock
            const currentOrder = await database.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
            if (!currentOrder) {
                throw new Error('Order not found');
            }

            // Get current order items to restore stock
            const currentItems = await database.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

            // Restore stock for current items
            for (const item of currentItems) {
                await database.run(
                    'UPDATE teas SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
                    [item.quantity, item.tea_id]
                );
            }

            // Delete current order items
            await database.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);

            // Update order
            await database.run(
                'UPDATE orders SET customer_id = ?, customer_name = ?, total_amount = ?, order_date = ?, notes = ?, status = ? WHERE id = ?',
                [customerId, customerName, totalAmount, orderDate, notes, status || currentOrder.status, req.params.id]
            );

            // Create new order items and update stock
            for (const item of items) {
                const tea = await database.get('SELECT quantity_in_stock FROM teas WHERE id = ?', [item.teaId]);
                if (!tea) {
                    throw new Error(`Tea with ID ${item.teaId} not found`);
                }
                if (tea.quantity_in_stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.teaName}. Available: ${tea.quantity_in_stock} kg`);
                }

                await database.run(
                    'INSERT INTO order_items (order_id, tea_id, tea_name, quantity, price_per_kg, total) VALUES (?, ?, ?, ?, ?, ?)',
                    [req.params.id, item.teaId, item.teaName, item.quantity, item.pricePerKg, item.total]
                );

                await database.run(
                    'UPDATE teas SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
                    [item.quantity, item.teaId]
                );
            }

            await database.commit();

            const updatedOrder = {
                id: req.params.id,
                customerId,
                customerName,
                items,
                totalAmount,
                status: status || currentOrder.status,
                orderDate,
                notes
            };

            res.json(updatedOrder);
        } catch (error) {
            await database.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Update order error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete order
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await database.beginTransaction();

        try {
            // Get order items to restore stock
            const orderItems = await database.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
            
            // Restore stock for each item
            for (const item of orderItems) {
                await database.run(
                    'UPDATE teas SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
                    [item.quantity, item.tea_id]
                );

                // Log inventory transaction
                await database.run(
                    'INSERT INTO inventory_transactions (tea_id, transaction_type, quantity_change, reference_id, notes) VALUES (?, ?, ?, ?, ?)',
                    [item.tea_id, 'return', item.quantity, req.params.id, `Return - Order ${req.params.id} deleted`]
                );
            }

            // Get order details for customer stats update
            const order = await database.get('SELECT customer_id, total_amount FROM orders WHERE id = ?', [req.params.id]);
            
            if (order) {
                // Update customer statistics
                await database.run(
                    'UPDATE customers SET total_orders = total_orders - 1, total_spent = total_spent - ? WHERE id = ?',
                    [order.total_amount, order.customer_id]
                );
            }

            // Delete order (cascade will delete order_items)
            const result = await database.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
            
            if (result.changes === 0) {
                throw new Error('Order not found');
            }

            await database.commit();
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            await database.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Delete order error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;