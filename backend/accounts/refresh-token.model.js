const { DataTypes } = require('sequelize');
const db = require('../config/database');

const RefreshToken = db.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    expires: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdByIp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    revoked: {
        type: DataTypes.DATE,
        allowNull: true
    },
    revokedByIp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    replacedByToken: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: false
});

module.exports = RefreshToken;
