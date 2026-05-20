const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Account = db.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    acceptTerms: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    role: {
        type: DataTypes.ENUM('Admin', 'User'),
        defaultValue: 'User'
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verified: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    passwordReset: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});

module.exports = Account;
