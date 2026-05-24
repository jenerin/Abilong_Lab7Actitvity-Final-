const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Account = require('./account.model');
const RefreshToken = require('./refresh-token.model');
const sendEmail = require('../helpers/send-email');

// Set up associations
Account.hasMany(RefreshToken, { foreignKey: 'accountId', as: 'refreshTokens' });
RefreshToken.belongsTo(Account, { foreignKey: 'accountId' });

// ─── Register ────────────────────────────────────────────────────────────────
async function register(params, origin) {
    const existing = await Account.findOne({ where: { email: params.email } });
    if (existing) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    const accountCount = await Account.count();
    const role = accountCount === 0 ? 'Admin' : 'User';

    const verificationToken = uuidv4();

    const account = await Account.create({
        title: params.title,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordHash: bcrypt.hashSync(params.password, 10),
        acceptTerms: params.acceptTerms,
        role,
        verificationToken
    });

    // Calls the internal helper function below
    await sendVerificationEmail(account, origin);

    return { message: 'Registration successful, please check your email for verification instructions' };
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
async function verifyEmail({ token }) {
    const account = await Account.findOne({ where: { verificationToken: token } });
    if (!account) throw new Error('Verification failed');

    account.verified = new Date();
    account.verificationToken = null;
    await account.save();
}

// ─── Authenticate ─────────────────────────────────────────────────────────────
async function authenticate({ email, password }, ipAddress) {
    const account = await Account.findOne({ where: { email } });

    if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        throw new Error('Email or password is incorrect');
    }

    if (!account.verified) {
        throw new Error('Please verify your email before logging in');
    }

    const jwtToken = generateJwtToken(account);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
async function refreshToken({ token, ipAddress }) {
    const existingToken = await getRefreshToken(token);
    const account = await Account.findByPk(existingToken.accountId);

    // Rotate refresh token
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    existingToken.revoked = new Date();
    existingToken.revokedByIp = ipAddress;
    existingToken.replacedByToken = newRefreshToken.token;
    await existingToken.save();

    const jwtToken = generateJwtToken(account);

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

// ─── Revoke Token ─────────────────────────────────────────────────────────────
async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = new Date();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
async function forgotPassword({ email }, origin) {
    const account = await Account.findOne({ where: { email } });
    if (!account) return;

    account.resetToken = uuidv4();
    account.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await account.save();

    await sendPasswordResetEmail(account, origin);
}

// ─── Validate Reset Token ─────────────────────────────────────────────────────
async function validateResetToken({ token }) {
    const account = await Account.findOne({ where: { resetToken: token } });
    if (!account || account.resetTokenExpires < new Date()) {
        throw new Error('Invalid token');
    }
}

// ─── Reset Password ───────────────────────────────────────────────────────────
async function resetPassword({ token, password }) {
    const account = await Account.findOne({ where: { resetToken: token } });
    if (!account || account.resetTokenExpires < new Date()) {
        throw new Error('Invalid token');
    }

    account.passwordHash = bcrypt.hashSync(password, 10);
    account.passwordReset = new Date();
    account.resetToken = null;
    account.resetTokenExpires = null;
    await account.save();
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
async function getAll() {
    const accounts = await Account.findAll();
    return accounts.map(basicDetails);
}

async function getById(id) {
    const account = await Account.findByPk(id);
    if (!account) throw new Error('Account not found');
    return basicDetails(account);
}

async function create(params) {
    const existing = await Account.findOne({ where: { email: params.email } });
    if (existing) throw new Error(`Email "${params.email}" is already registered`);

    const account = await Account.create({
        title: params.title,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordHash: bcrypt.hashSync(params.password, 10),
        acceptTerms: params.acceptTerms,
        role: params.role || 'User',
        verified: new Date()
    });

    return basicDetails(account);
}

async function update(id, params) {
    const account = await Account.findByPk(id);
    if (!account) throw new Error('Account not found');

    if (params.email && params.email !== account.email) {
        const existing = await Account.findOne({ where: { email: params.email } });
        if (existing) throw new Error(`Email "${params.email}" is already registered`);
    }

    if (params.password) {
        params.passwordHash = bcrypt.hashSync(params.password, 10);
        delete params.password;
    }

    Object.assign(account, params);
    await account.save();
    return basicDetails(account);
}

async function deleteAccount(id) {
    const account = await Account.findByPk(id);
    if (!account) throw new Error('Account not found');
    await account.destroy();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, verified, created, updated } = account;
    return { id, title, firstName, lastName, email, role, verified, created, updated };
}

function generateJwtToken(account) {
    return jwt.sign(
        { id: account.id, role: account.role },
        process.env.JWT_SECRET || 'default-secret-change-me',
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
}

async function generateRefreshToken(account, ipAddress) {
    return await RefreshToken.create({
        accountId: account.id,
        token: uuidv4(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdByIp: ipAddress
    });
}

async function getRefreshToken(token) {
    const refreshToken = await RefreshToken.findOne({ where: { token } });
    if (!refreshToken || refreshToken.revoked || refreshToken.expires < new Date()) {
        throw new Error('Invalid token');
    }
    return refreshToken;
}

// 🚀 UPDATED: Prints a short, clean line to your terminal console logs
async function sendVerificationEmail(account, origin) {
    const frontendBase = process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    const verifyUrl = `${frontendBase}/account/verify-email?token=${account.verificationToken}`;
    
    console.log(`\n👉 VERIFY LINK FOR ${account.email}:\n${verifyUrl}\n`);
    
    await sendEmail({
        to: account.email,
        subject: 'Verify your email address',
        html: `<p>Please verify your account by clicking here: <a href="${verifyUrl}">${verifyUrl}</a></p>`
    });
}

// 🚀 UPDATED: Prints a short, clean line to your terminal console logs
async function sendPasswordResetEmail(account, origin) {
    const frontendBase = process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    const resetUrl = `${frontendBase}/account/reset-password?token=${account.resetToken}`;
    
    console.log(`\n👉 RESET LINK FOR ${account.email}:\n${resetUrl}\n`);
    
    await sendEmail({
        to: account.email,
        subject: 'Reset your password',
        html: `<p>Please reset your password by clicking here: <a href="${resetUrl}">${resetUrl}</a></p>`
    });
}

module.exports = {
    register,
    verifyEmail,
    authenticate,
    refreshToken,
    revokeToken,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: deleteAccount,
    sendVerificationEmail,
    sendPasswordResetEmail
};
