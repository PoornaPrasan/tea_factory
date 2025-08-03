const express = require('express');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateTea } = require('../middleware/validation');

const router = express.Router();

// Get all teas
router.get('/', async (req, res) => {
    try {
        const { search, type, lowStock } = req.query;
        let sql = 'SELECT * FROM teas WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR origin LIKE ? OR grade LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        if (lowStock === 'true') {
            sql += ' AND quantity_in_stock < 10';
        }

        sql += ' ORDER BY name';

        const teas = await database.all(sql, params);
        
        // Transform to match frontend format
        const transformedTeas = teas.map(tea => ({
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
        console.error('Get teas error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get tea by ID
router.get('/:id', async (req, res) => {
    try {
        const tea = await database.get('SELECT * FROM teas WHERE id = ?', [req.params.id]);
        
        if (!tea) {
            return res.status(404).json({ error: 'Tea not found' });
        }

        const transformedTea = {
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
        };

        res.json(transformedTea);
    } catch (error) {
        console.error('Get tea error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new tea
router.post('/', authenticateToken, validateTea, async (req, res) => {
    try {
        const { name, type, origin, pricePerKg, quantityInStock, description, harvestDate, expiryDate, grade } = req.body;
        const id = uuidv4();

        await database.run(
            `INSERT INTO teas (id, name, type, origin, price_per_kg, quantity_in_stock, description, harvest_date, expiry_date, grade)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, type, origin, pricePerKg, quantityInStock, description, harvestDate, expiryDate, grade]
        );

        // Log inventory transaction
        await database.run(
            'INSERT INTO inventory_transactions (tea_id, transaction_type, quantity_change, notes) VALUES (?, ?, ?, ?)',
            [id, 'purchase', quantityInStock, 'Initial stock']
        );

        const newTea = {
            id,
            name,
            type,
            origin,
            pricePerKg,
            quantityInStock,
            description,
            harvestDate,
            expiryDate,
            grade
        };

        res.status(201).json(newTea);
    } catch (error) {
        console.error('Create tea error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update tea
router.put('/:id', authenticateToken, validateTea, async (req, res) => {
    try {
        const { name, type, origin, pricePerKg, quantityInStock, description, harvestDate, expiryDate, grade } = req.body;
        
        // Get current tea for stock comparison
        const currentTea = await database.get('SELECT quantity_in_stock FROM teas WHERE id = ?', [req.params.id]);
        
        if (!currentTea) {
            return res.status(404).json({ error: 'Tea not found' });
        }

        const result = await database.run(
            `UPDATE teas SET name = ?, type = ?, origin = ?, price_per_kg = ?, quantity_in_stock = ?, 
             description = ?, harvest_date = ?, expiry_date = ?, grade = ? WHERE id = ?`,
            [name, type, origin, pricePerKg, quantityInStock, description, harvestDate, expiryDate, grade, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tea not found' });
        }

        // Log inventory adjustment if stock changed
        const stockChange = quantityInStock - currentTea.quantity_in_stock;
        if (stockChange !== 0) {
            await database.run(
                'INSERT INTO inventory_transactions (tea_id, transaction_type, quantity_change, notes) VALUES (?, ?, ?, ?)',
                [req.params.id, 'adjustment', stockChange, 'Stock adjustment via update']
            );
        }

        const updatedTea = {
            id: req.params.id,
            name,
            type,
            origin,
            pricePerKg,
            quantityInStock,
            description,
            harvestDate,
            expiryDate,
            grade
        };

        res.json(updatedTea);
    } catch (error) {
        console.error('Update tea error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete tea
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await database.run('DELETE FROM teas WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Tea not found' });
        }

        res.json({ message: 'Tea deleted successfully' });
    } catch (error) {
        console.error('Delete tea error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get inventory transactions for a tea
router.get('/:id/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await database.all(
            'SELECT * FROM inventory_transactions WHERE tea_id = ? ORDER BY created_at DESC',
            [req.params.id]
        );

        res.json(transactions);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;