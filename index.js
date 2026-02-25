const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS Hardening
const allowedOrigins = [
    process.env.CLIENT_URL, // Production domain from env
    'http://localhost:5173', // Local development
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 minutes
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const eventRoutes = require('./routes/eventRoutes.js');
const testimonyRoutes = require('./routes/testimonyRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const sermonRoutes = require('./routes/sermonRoutes.js');
const locationRoutes = require('./routes/locationRoutes.js');
const formRoutes = require('./routes/formRoutes.js');
const statsRoutes = require('./routes/statsRoutes.js');
const newsletterRoutes = require('./routes/newsletterRoutes.js');
const apaproRoutes = require('./routes/apaproRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

// Database
const { testConnection } = require('./config/database.js');

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/testimonies', testimonyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/apapro', apaproRoutes);
app.use('/api/auth', authRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'CFWM Backend API',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Test database connection
    await testConnection();
});

module.exports = app;
