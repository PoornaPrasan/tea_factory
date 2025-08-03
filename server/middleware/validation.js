const validateTea = (req, res, next) => {
    const { name, type, origin, pricePerKg, quantityInStock, description, harvestDate, expiryDate, grade } = req.body;
    
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }
    
    const validTypes = ['Black Tea', 'Green Tea', 'White Tea', 'Herbal Tea', 'Oolong Tea'];
    if (!type || !validTypes.includes(type)) {
        errors.push('Type must be one of: ' + validTypes.join(', '));
    }
    
    if (!origin || typeof origin !== 'string' || origin.trim().length === 0) {
        errors.push('Origin is required and must be a non-empty string');
    }
    
    if (pricePerKg === undefined || pricePerKg === null || isNaN(pricePerKg) || pricePerKg < 0) {
        errors.push('Price per kg must be a non-negative number');
    }
    
    if (quantityInStock === undefined || quantityInStock === null || isNaN(quantityInStock) || quantityInStock < 0) {
        errors.push('Quantity in stock must be a non-negative number');
    }
    
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    }
    
    if (!harvestDate || !isValidDate(harvestDate)) {
        errors.push('Harvest date is required and must be a valid date (YYYY-MM-DD)');
    }
    
    if (!expiryDate || !isValidDate(expiryDate)) {
        errors.push('Expiry date is required and must be a valid date (YYYY-MM-DD)');
    }
    
    if (!grade || typeof grade !== 'string' || grade.trim().length === 0) {
        errors.push('Grade is required and must be a non-empty string');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
};

const validateCustomer = (req, res, next) => {
    const { name, email, phone, address } = req.body;
    
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push('Valid email is required');
    }
    
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        errors.push('Phone is required and must be a non-empty string');
    }
    
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        errors.push('Address is required and must be a non-empty string');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
};

const validateOrder = (req, res, next) => {
    const { customerId, customerName, items, totalAmount, orderDate } = req.body;
    
    const errors = [];
    
    if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
        errors.push('Customer ID is required');
    }
    
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
        errors.push('Customer name is required');
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('Items array is required and must not be empty');
    } else {
        items.forEach((item, index) => {
            if (!item.teaId || !item.teaName || !item.quantity || !item.pricePerKg || !item.total) {
                errors.push(`Item ${index + 1} is missing required fields`);
            }
            if (isNaN(item.quantity) || item.quantity <= 0) {
                errors.push(`Item ${index + 1} quantity must be a positive number`);
            }
            if (isNaN(item.pricePerKg) || item.pricePerKg <= 0) {
                errors.push(`Item ${index + 1} price per kg must be a positive number`);
            }
            if (isNaN(item.total) || item.total <= 0) {
                errors.push(`Item ${index + 1} total must be a positive number`);
            }
        });
    }
    
    if (totalAmount === undefined || totalAmount === null || isNaN(totalAmount) || totalAmount <= 0) {
        errors.push('Total amount must be a positive number');
    }
    
    if (!orderDate || !isValidDate(orderDate)) {
        errors.push('Order date is required and must be a valid date (YYYY-MM-DD)');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
};

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

module.exports = {
    validateTea,
    validateCustomer,
    validateOrder
};