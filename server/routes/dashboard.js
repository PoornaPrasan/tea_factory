const express = require('express');
const database = require('../config/database');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total revenue
        const revenueResult = await database.get(
            'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != "Cancelled"'
        );

        // Get total orders
        const ordersResult = await database.get(
            'SELECT COUNT(*) as total_orders FROM orders'
        );

        // Get low stock items
        const lowStockResult = await database.get(
            'SELECT COUNT(*) as low_stock_items FROM teas WHERE quantity_in_stock < 10'
        );

        // Get total customers
        const customersResult = await database.get(
            'SELECT COUNT(*) as total_customers FROM customers'
        );

        // Get daily revenue (today)
        const today = new Date().toISOString().split('T')[0];
        const dailyRevenueResult = await database.get(
            'SELECT COALESCE(SUM(total_amount), 0) as daily_revenue FROM orders WHERE order_date = ? AND status != "Cancelled"',
            [today]
        );

        // Get weekly revenue (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weeklyRevenueResult = await database.get(
            'SELECT COALESCE(SUM(total_amount), 0) as weekly_revenue FROM orders WHERE order_date >= ? AND status != "Cancelled"',
            [weekAgo]
        );

        // Get monthly revenue (last 30 days)
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const monthlyRevenueResult = await database.get(
            'SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue FROM orders WHERE order_date >= ? AND status != "Cancelled"',
            [monthAgo]
        );

        const stats = {
            totalRevenue: revenueResult.total_revenue,
            totalOrders: ordersResult.total_orders,
            lowStockItems: lowStockResult.low_stock_items,
            totalCustomers: customersResult.total_customers,
            dailyRevenue: dailyRevenueResult.daily_revenue,
            weeklyRevenue: weeklyRevenueResult.weekly_revenue,
            monthlyRevenue: monthlyRevenueResult.monthly_revenue
        };

        res.json(stats);
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get low stock teas
router.get('/low-stock', async (req, res) => {
    try {
        const lowStockTeas = await database.all(
            'SELECT * FROM teas WHERE quantity_in_stock < 10 ORDER BY quantity_in_stock ASC'
        );

        const transformedTeas = lowStockTeas.map(tea => ({
            id: tea.id,
            name: tea.name,
            type: tea.type,
            origin: tea.origin,
            pricePerKg: tea.price_per_kg,
            quantityInStock: tea.quantity_in_stock,
            description: tea.description,
            harvestDate: tea.harvest_date,
            expiryDate: tea.expiry_date,
            grade: tea.grade
        }));

        res.json(transformedTeas);
    } catch (error) {
        console.error('Get low stock teas error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent orders
router.get('/recent-orders', async (req, res) => {
    try {
        const limit = req.query.limit || 5;
        const recentOrders = await database.all(
            'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?',
            [limit]
        );

        // Get order items for each order
        const ordersWithItems = await Promise.all(recentOrders.map(async (order) => {
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
        console.error('Get recent orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sales analytics
router.get('/analytics', async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        
        let dateFormat, dateFilter;
        switch (period) {
            case 'week':
                dateFormat = '%Y-%m-%d';
                dateFilter = "date('now', '-7 days')";
                break;
            case 'month':
                dateFormat = '%Y-%m-%d';
                dateFilter = "date('now', '-30 days')";
                break;
            case 'year':
                dateFormat = '%Y-%m';
                dateFilter = "date('now', '-365 days')";
                break;
            default:
                dateFormat = '%Y-%m-%d';
                dateFilter = "date('now', '-30 days')";
        }

        // Sales by date
        const salesByDate = await database.all(`
            SELECT 
                strftime('${dateFormat}', order_date) as date,
                COUNT(*) as orders,
                SUM(total_amount) as revenue
            FROM orders 
            WHERE order_date >= ${dateFilter} AND status != 'Cancelled'
            GROUP BY strftime('${dateFormat}', order_date)
            ORDER BY date
        `);

        // Top selling teas
        const topTeas = await database.all(`
            SELECT 
                oi.tea_name,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.total) as total_revenue,
                COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.order_date >= ${dateFilter} AND o.status != 'Cancelled'
            GROUP BY oi.tea_id, oi.tea_name
            ORDER BY total_revenue DESC
            LIMIT 10
        `);

        // Customer analytics
        const customerAnalytics = await database.all(`
            SELECT 
                c.name,
                COUNT(o.id) as order_count,
                SUM(o.total_amount) as total_spent
            FROM customers c
            JOIN orders o ON c.id = o.customer_id
            WHERE o.order_date >= ${dateFilter} AND o.status != 'Cancelled'
            GROUP BY c.id, c.name
            ORDER BY total_spent DESC
            LIMIT 10
        `);

        res.json({
            salesByDate,
            topTeas,
            customerAnalytics
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;