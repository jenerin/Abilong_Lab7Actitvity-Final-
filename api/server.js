const { Sequelize } = require('sequelize');

const db = new Sequelize(
    process.env.DB_NAME || 'defaultdb',
    process.env.DB_USER || 'avnadmin',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 15705,
        dialect: 'mysql',
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
