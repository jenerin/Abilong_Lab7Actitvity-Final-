const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../middleware/validate-request');
const authorize = require('../middleware/authorize');
const accountsService = require('./accounts.service');

router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeToken);
router.get('/', authorize('Admin'), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), updateSchema, update);
router.post('/', authorize('Admin'), createSchema, create);
router.delete('/:id', authorize('Admin'), _delete);

module.exports = router;

// --- Route Handlers ---

function authenticate(req, res, next) {
    const ipAddress = req.ip;
    accountsService.authenticate(req.body, ipAddress)
        .then(({ refreshToken, ...account }) => { setTokenCookie(res, refreshToken); res.json(account); })
        .catch(next);
}

function register(req, res, next) {
    const clientOrigin = req.get('Origin') || req.get('origin') || process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    accountsService.register(req.body, clientOrigin)
        .then(result => res.json(result))
        .catch(next);
}

function verifyEmail(req, res, next) {
    accountsService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPassword(req, res, next) {
    const clientOrigin = req.get('Origin') || req.get('origin') || process.env.FRONTEND_URL || 'https://abilong-lab7actitvity-final-frontend.onrender.com';
    accountsService.forgotPassword(req.body, clientOrigin)
        .then(result => res.json(result))
        .catch(next);
}

function validateResetToken(req, res, next) {
    accountsService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

function resetPassword(req, res, next) {
    accountsService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountsService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => { setTokenCookie(res, refreshToken); res.json(account); })
        .catch(() => res.json(null));
}

function revokeToken(req, res, next) {
    const token = req.cookies.refreshToken || req.body.token;
    const ipAddress = req.ip;
    if (!token) return res.status(400).json({ message: 'Token is required' });
    accountsService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function getAll(req, res, next) {
    accountsService.getAll().then(accounts => res.json(accounts)).catch(next);
}

function getById(req, res, next) {
    if (req.params.id !== req.account.id.toString() && req.account.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    accountsService.getById(req.params.id).then(account => res.json(account)).catch(next);
}

function create(req, res, next) {
    accountsService.create(req.body).then(account => res.json(account)).catch(next);
}

function update(req, res, next) {
    if (req.params.id !== req.account.id.toString() && req.account.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    accountsService.update(req.params.id, req.body).then(account => res.json(account)).catch(next);
}

function _delete(req, res, next) {
    accountsService.delete(req.params.id).then(() => res.json({ message: 'Account deleted successfully' })).catch(next);
}

// --- Schemas & Helpers ---

function authenticateSchema(req, res, next) { const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() }); validateRequest(req, next, schema); }
function registerSchema(req, res, next) { const schema = Joi.object({ title: Joi.string().allow('', null), firstName: Joi.string().required(), lastName: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(6).required(), confirmPassword: Joi.string().valid(Joi.ref('password')).required(), acceptTerms: Joi.boolean().valid(true).required() }); validateRequest(req, next, schema); }
function verifyEmailSchema(req, res, next) { const schema = Joi.object({ token: Joi.string().required() }); validateRequest(req, next, schema); }
function forgotPasswordSchema(req, res, next) { const schema = Joi.object({ email: Joi.string().email().required() }); validateRequest(req, res, next, schema); }
function validateResetTokenSchema(req, res, next) { const schema = Joi.object({ token: Joi.string().required() }); validateRequest(req, next, schema); }
function resetPasswordSchema(req, res, next) { const schema = Joi.object({ token: Joi.string().required(), password: Joi.string().min(6).required(), confirmPassword: Joi.string().valid(Joi.ref('password')).required() }); validateRequest(req, next, schema); }
function createSchema(req, res, next) { const schema = Joi.object({ title: Joi.string().allow('', null), firstName: Joi.string().required(), lastName: Joi.string().required(), email: Joi.string().email().required(), password: Joi.string().min(6).required(), confirmPassword: Joi.string().valid(Joi.ref('password')).required(), role: Joi.string().valid('Admin', 'User').required(), acceptTerms: Joi.boolean() }); validateRequest(req, next, schema); }
function updateSchema(req, res, next) { const schema = Joi.object({ title: Joi.string().allow('', null), firstName: Joi.string().empty(''), lastName: Joi.string().empty(''), email: Joi.string().email().empty(''), password: Joi.string().min(6).empty(''), confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''), role: Joi.string().valid('Admin', 'User').empty('') }); validateRequest(req, next, schema); }
function setTokenCookie(res, token) { res.cookie('refreshToken', token, { httpOnly: true, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), sameSite: 'None', secure: true }); }
