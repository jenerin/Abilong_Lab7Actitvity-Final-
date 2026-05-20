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

// CORS — allow Angular frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
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
    res.json({ message: 'IPT 2026 Backend API is running', docs: '/api-docs' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Connect DB then start server
db.authenticate()
    .then(() => {
        console.log('✅ Database connected');
        return db.sync({ alter: true });
    })
    .then(() => {
        console.log('✅ Database synced');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Make sure XAMPP MySQL is running and your .env DB settings are correct');
        process.exit(1);
    });
    module.exports = app;
