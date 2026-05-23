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
