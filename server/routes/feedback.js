const express = require('express');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all feedback
router.get('/', async (req, res) => {
    try {
        const { customerId, rating } = req.query;
        let sql = `
            SELECT 
                cf.*,
                c.name as customer_name,
                c.email as customer_email
            FROM customer_feedback cf
            JOIN customers c ON cf.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (customerId) {
            sql += ' AND cf.customer_id = ?';
            params.push(customerId);
        }

        if (rating) {
            sql += ' AND cf.rating = ?';
            params.push(rating);
        }

        sql += ' ORDER BY cf.created_at DESC';

        const feedback = await database.all(sql, params);
        res.json(feedback);
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new feedback
router.post('/', async (req, res) => {
    try {
        const { customerId, orderId, rating, comment } = req.body;

        if (!customerId || !rating) {
            return res.status(400).json({ error: 'Customer ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Verify customer exists
        const customer = await database.get('SELECT id FROM customers WHERE id = ?', [customerId]);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Verify order exists if provided
        if (orderId) {
            const order = await database.get('SELECT id FROM orders WHERE id = ? AND customer_id = ?', [orderId, customerId]);
            if (!order) {
                return res.status(404).json({ error: 'Order not found or does not belong to customer' });
            }
        }

        const result = await database.run(
            'INSERT INTO customer_feedback (customer_id, order_id, rating, comment) VALUES (?, ?, ?, ?)',
            [customerId, orderId, rating, comment]
        );

        const newFeedback = {
            id: result.id,
            customerId,
            orderId,
            rating,
            comment,
            created_at: new Date().toISOString()
        };

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get feedback by ID
router.get('/:id', async (req, res) => {
    try {
        const feedback = await database.get(`
            SELECT 
                cf.*,
                c.name as customer_name,
                c.email as customer_email
            FROM customer_feedback cf
            JOIN customers c ON cf.customer_id = c.id
            WHERE cf.id = ?
        `, [req.params.id]);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update feedback
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const result = await database.run(
            'UPDATE customer_feedback SET rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE id = ?',
            [rating, comment, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        const updatedFeedback = await database.get(`
            SELECT 
                cf.*,
                c.name as customer_name,
                c.email as customer_email
            FROM customer_feedback cf
            JOIN customers c ON cf.customer_id = c.id
            WHERE cf.id = ?
        `, [req.params.id]);

        res.json(updatedFeedback);
    } catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete feedback
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await database.run('DELETE FROM customer_feedback WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get feedback statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await database.get(`
            SELECT 
                COUNT(*) as total_feedback,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
            FROM customer_feedback
        `);

        res.json(stats);
    } catch (error) {
        console.error('Get feedback stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;