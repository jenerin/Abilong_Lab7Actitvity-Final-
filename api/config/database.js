const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Modern driver requirement

const db = new Sequelize(
    process.env.DB_NAME || 'defaultdb',
    process.env.DB_USER || 'avnadmin',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 15705,
        dialect: 'mysql',
        dialectModule: mysql2, 
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

module.exports = db;
