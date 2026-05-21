const { Sequelize } = require('sequelize');

// 🚀 PRESENTATION SAFE-MODE: Runs flawlessly inside the server's local RAM.
// No cloud databases, no firewall blocks, zero connection delays.
const db = new Sequelize('sqlite::memory:', {
    logging: false
});

module.exports = db;
