const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const Account = require('./account.model');
const RefreshToken = require('./refresh-token.model');
const sendEmail = require('../helpers/send-email');

Account.hasMany(RefreshToken, {
    foreignKey: 'accountId',
    as: 'refreshTokens'
});

RefreshToken.belongsTo(Account, {
    foreignKey: 'accountId'
});

// REGISTER
async function register(params, origin) {

    const existing = await Account.findOne({
        where: { email: params.email }
    });

    if (existing) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    const accountCount = await Account.count();

    const role = accountCount === 0
        ? 'Admin'
        : 'User';

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

    await sendVerificationEmail(account, origin);

    return {
        message: 'Registration successful, please check your email for verification instructions'
    };
}

// FORGOT PASSWORD
async function forgotPassword({ email }, origin) {

    const account = await Account.findOne({
        where: { email }
    });

    if (!account) {
        return {
            message: 'If this email exists, a reset link has been sent.'
        };
    }

    account.resetToken = uuidv4();

    // 1 HOUR EXPIRATION
    account.resetTokenExpires = new Date(
        Date.now() + 60 * 60 * 1000
    );

    await account.save();

    await sendPasswordResetEmail(account, origin);

    return {
        message: 'Please check your email for reset instructions'
    };
}

// VALIDATE RESET TOKEN
async function validateResetToken({ token }) {

    const account = await Account.findOne({
        where: {
            resetToken: token
        }
    });

    if (!account) {
        throw new Error('Invalid token');
    }

    if (new Date() > new Date(account.resetTokenExpires)) {
        throw new Error('Token expired');
    }

    return {
        message: 'Token is valid'
    };
}

// RESET PASSWORD
async function resetPassword({ token, password }) {

    const account = await Account.findOne({
        where: {
            resetToken: token
        }
    });

    if (!account) {
        throw new Error('Invalid token');
    }

    if (new Date() > new Date(account.resetTokenExpires)) {
        throw new Error('Token expired');
    }

    account.passwordHash = bcrypt.hashSync(password, 10);

    account.resetToken = null;
    account.resetTokenExpires = null;

    await account.save();

    return {
        message: 'Password reset successful'
    };
}

// VERIFY EMAIL
async function verifyEmail({ token }) {

    const account = await Account.findOne({
        where: { verificationToken: token }
    });

    if (!account) {
        throw new Error('Verification failed');
    }

    account.verified = new Date();
    account.verificationToken = null;

    await account.save();
}

// AUTHENTICATE
async function authenticate({ email, password }, ipAddress) {

    const account = await Account.findOne({
        where: { email }
    });

    if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        throw new Error('Email or password is incorrect');
    }

    if (!account.verified) {
        throw new Error('Please verify your email before logging in');
    }

    const jwtToken = generateJwtToken(account);

    const refreshToken = await generateRefreshToken(
        account,
        ipAddress
    );

    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

// GET ALL
async function getAll() {

    const accounts = await Account.findAll();

    return accounts.map(basicDetails);
}

// BASIC DETAILS
function basicDetails(account) {

    const {
        id,
        title,
        firstName,
        lastName,
        email,
        role,
        verified,
        created,
        updated
    } = account;

    return {
        id,
        title,
        firstName,
        lastName,
        email,
        role,
        verified,
        created,
        updated
    };
}

// GENERATE JWT TOKEN
function generateJwtToken(account) {

    return jwt.sign(
        {
            id: account.id,
            role: account.role
        },
        process.env.JWT_SECRET || 'default-secret-change-me',
        {
            expiresIn: '15m'
        }
    );
}

// GENERATE REFRESH TOKEN
async function generateRefreshToken(account, ipAddress) {

    return await RefreshToken.create({
        accountId: account.id,
        token: uuidv4(),
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        createdByIp: ipAddress
    });
}

async function sendVerificationEmail(account, origin) {

    const frontendBase =
        origin ||
        process.env.FRONTEND_URL;

    const verifyUrl =
        `${frontendBase}/account/verify-email?token=${account.verificationToken}`;

    console.log('\n========================================');
    console.log('🔗 VERIFY EMAIL LINK');
    console.log(verifyUrl);
    console.log('========================================\n');

    await sendEmail({
        to: account.email,
        subject: 'Verify your email',
        html: `
            <h3>Email Verification</h3>
            <p>Please click the link below to verify your email:</p>
            <a href="${verifyUrl}">${verifyUrl}</a>
        `
    });
}

// SEND PASSWORD RESET EMAIL
async function sendPasswordResetEmail(account, origin) {

    const frontendBase =
        origin ||
        process.env.FRONTEND_URL ||
        'https://abilong-lab7actitvity-final-frontend.onrender.com';

    const resetUrl =
        `${frontendBase}/account/reset-password?token=${account.resetToken}`;

    await sendEmail({
        to: account.email,
        subject: 'Reset Password',
        html: `
            <h3>Reset Password</h3>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `
    });
}

module.exports = {
    register,
    forgotPassword,
    validateResetToken,
    resetPassword,
    verifyEmail,
    authenticate,
    getAll,
    sendVerificationEmail,
    sendPasswordResetEmail
};
