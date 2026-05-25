const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Account = require('./account.model');
const RefreshToken = require('./refresh-token.model');
const sendEmail = require('../helpers/send-email');

Account.hasMany(RefreshToken, { foreignKey: 'accountId', as: 'refreshTokens' });
RefreshToken.belongsTo(Account, { foreignKey: 'accountId' });

async function register(params, origin) {
    const existing = await Account.findOne({ where: { email: params.email } });
    if (existing) throw new Error(`Email "${params.email}" is already registered`);
    const accountCount = await Account.count();
    const role = accountCount === 0 ? 'Admin' : 'User';
    const verificationToken = uuidv4();
    const account = await Account.create({
        title: params.title, firstName: params.firstName, lastName: params.lastName,
        email: params.email, passwordHash: bcrypt.hashSync(params.password, 10),
        acceptTerms: params.acceptTerms, role, verificationToken
    });
    await sendVerificationEmail(account, origin);
    return { message: 'Registration successful, please check your email for verification instructions' };
}

async function forgotPassword({ email }, origin) {
    const account = await Account.findOne({ where: { email } });
    if (!account) return { message: 'If this email exists, a reset link has been sent.' };
    account.resetToken = uuidv4();
    account.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await account.save();
    await sendPasswordResetEmail(account, origin);
    return { message: 'Please check your email for reset instructions' };
}

async function sendVerificationEmail(account, origin) {
    let frontendBase = origin || process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    frontendBase = frontendBase.replace(/\/$/, "");
    const verifyUrl = `${frontendBase}/account/verify-email?token=${account.verificationToken}`;
    await sendEmail({ to: account.email, subject: 'Verify your email', html: `<p><a href="${verifyUrl}">${verifyUrl}</a></p>` });
}

async function sendPasswordResetEmail(account, origin) {
    let frontendBase = origin || process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    frontendBase = frontendBase.replace(/\/$/, "");
    const resetUrl = `${frontendBase}/account/reset-password?token=${account.resetToken}`;
    await sendEmail({ to: account.email, subject: 'Reset your password', html: `<p><a href="${resetUrl}">${resetUrl}</a></p>` });
}

module.exports = { register, forgotPassword, sendVerificationEmail, sendPasswordResetEmail };
