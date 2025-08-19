// HEFIN Health & Finance Intelligence - Backend Server
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// CORS middleware for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// In-memory storage (replace with database in production)
const storage = {
    contacts: new Map(),
    users: new Map()
};

// Validation helpers
function validateContactData(data) {
    const errors = [];
    
    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
        errors.push('First name is required');
    }
    
    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
        errors.push('Last name is required');
    }
    
    if (!data.email || typeof data.email !== 'string') {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            errors.push('Valid email is required');
        }
    }
    
    if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
        errors.push('Message is required');
    }
    
    if (data.organization && typeof data.organization !== 'string') {
        errors.push('Organization must be a string');
    }
    
    return errors;
}

function validateCalculationData(data) {
    const errors = [];
    
    if (!data.population || typeof data.population !== 'number' || data.population < 10000 || data.population > 1000000) {
        errors.push('Population must be a number between 10,000 and 1,000,000');
    }
    
    if (!data.budget || typeof data.budget !== 'number' || data.budget < 1000000 || data.budget > 50000000) {
        errors.push('Budget must be a number between $1M and $50M');
    }
    
    if (!data.coverage || typeof data.coverage !== 'number' || data.coverage < 50 || data.coverage > 100) {
        errors.push('Coverage must be a number between 50 and 100');
    }
    
    return errors;
}

// API Routes

// Contact form submission
app.post('/api/contact', (req, res) => {
    try {
        console.log('Contact form submission:', req.body);
        
        const errors = validateContactData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        const contactId = uuidv4();
        const contact = {
            id: contactId,
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            email: req.body.email.trim().toLowerCase(),
            organization: req.body.organization ? req.body.organization.trim() : null,
            message: req.body.message.trim(),
            createdAt: new Date().toISOString(),
            ipAddress: req.ip || req.connection.remoteAddress
        };

        // Store contact
        storage.contacts.set(contactId, contact);

        console.log(`Contact stored: ${contact.firstName} ${contact.lastName} (${contact.email})`);

        res.json({
            success: true,
            message: 'Contact form submitted successfully',
            id: contactId
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form'
        });
    }
});

// Health financing calculation
app.post('/api/calculate', (req, res) => {
    try {
        console.log('Health calculation request:', req.body);
        
        const errors = validateCalculationData(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        const { population, budget, coverage } = req.body;

        // HEFIN calculation logic based on health financing principles
        const efficiencyGain = 0.23; // 23% efficiency improvement through intelligent systems
        const costSavings = Math.round(budget * efficiencyGain);
        
        // Coverage improvement calculation
        const maxCoverageIncrease = 100 - coverage;
        const baseImprovementRate = 0.25; // 25% of the gap can be covered
        const coverageImprovement = Math.min(25, Math.round(maxCoverageIncrease * baseImprovementRate));
        
        // Additional people calculation
        const additionalPeople = Math.floor(population * (coverageImprovement / 100));

        // Efficiency metrics based on HEFIN's core functions
        const results = {
            costSavings,
            coverageImprovement,
            additionalPeople,
            efficiencyMetrics: {
                administrativeEfficiency: Math.min(95, Math.round(75 + (budget / 1000000) * 2)), // Scales with budget
                resourceAllocation: Math.min(98, Math.round(80 + (coverage / 10) * 1.5)), // Scales with current coverage
                providerPerformance: Math.min(90, Math.round(70 + (population / 100000) * 3)) // Scales with population
            }
        };

        console.log('Calculation results:', results);

        res.json({
            success: true,
            results: results,
            calculatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Calculation failed'
        });
    }
});

// Get contact submissions (admin endpoint)
app.get('/api/contacts', (req, res) => {
    try {
        // In a real application, add authentication/authorization here
        const contacts = Array.from(storage.contacts.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            contacts: contacts,
            count: contacts.length
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve contacts'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HEFIN API is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main HTML file for all non-API routes (SPA support)
app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
    
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🏥 HEFIN Health & Finance Intelligence Server
🚀 Server running on http://0.0.0.0:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
💡 API endpoints:
   - POST /api/contact - Submit contact form
   - POST /api/calculate - Calculate health financing optimization
   - GET /api/contacts - Get all contact submissions
   - GET /api/health - Health check
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;