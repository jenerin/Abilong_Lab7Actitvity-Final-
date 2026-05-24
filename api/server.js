require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const errorHandler = require('./middleware/error-handler');
const accountsRouter = require('./accounts/accounts.router');
const db = require('./config/database');

const app = express();

// 🚀 FIXED: Allow the Render frontend URL and local development
const allowedOrigins = [
    'http://localhost:4200', 
    'https://abilong-lab7actitvity-final.onrender.com' // Add your frontend live URL here
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/accounts', accountsRouter);

// Swagger docs
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'IPT 2026 Backend API is running' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Connect DB then start server
db.authenticate()
    .then(() => {
        console.log('✅ Database connected');
        return db.sync(); 
    })
    .then(() => {
        console.log('✅ Database synced');
        app.listen(PORT, '0.0.0.0', () => { // Added '0.0.0.0' for Render network binding
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });

module.exports = app;
