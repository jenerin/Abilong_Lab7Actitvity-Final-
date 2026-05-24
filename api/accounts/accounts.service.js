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

// 🚀 FIXED: Forces the correct Frontend base URL and styled interactive links
async function sendVerificationEmail(account, origin) {
    const frontendBase = process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    const verifyUrl = `${frontendBase}/account/verify-email?token=${account.verificationToken}`;
    
    console.log(`📡 [Service] Passing registration data to sendEmail wrapper for: ${account.email}`);
    
    await sendEmail({
        to: account.email,
        subject: 'Verify your email address',
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h4 style="color: #2b7a78; font-size: 20px;">Verify Email</h4>
                <p>Thanks for registering!</p>
                <p>Please click the link below to verify your email address:</p>
                <p style="margin: 20px 0;">
                    <a href="${verifyUrl}" target="_blank" style="background-color: #2b7a78; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Verify Account Now
                    </a>
                </p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${verifyUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">${verifyUrl}</a></p>
                <br/>
                <p>Or use this token manually: <strong style="background: #eee; padding: 2px 6px; border-radius: 3px;">${account.verificationToken}</strong></p>
            </div>
        `
    });
}

// 🚀 FIXED: Forces the correct Frontend base URL and styled interactive links
async function sendPasswordResetEmail(account, origin) {
    const frontendBase = process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    const resetUrl = `${frontendBase}/account/reset-password?token=${account.resetToken}`;
    
    await sendEmail({
        to: account.email,
        subject: 'Reset your password',
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h4 style="color: #2b7a78; font-size: 20px;">Reset Password</h4>
                <p>Click the button below to reset your password:</p>
                <p style="margin: 20px 0;">
                    <a href="${resetUrl}" target="_blank" style="background-color: #2b7a78; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Reset Password
                    </a>
                </p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${resetUrl}" target="_blank" style="color: #007bff; text-decoration: underline;">${resetUrl}</a></p>
                <br/>
                <p>Or use this token manually: <strong style="background: #eee; padding: 2px 6px; border-radius: 3px;">${account.resetToken}</strong></p>
                <p>The token expires in 10 minutes.</p>
            </div>
        `
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
