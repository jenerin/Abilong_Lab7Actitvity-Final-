const jwt = require('jsonwebtoken');
const Account = require('../accounts/account.model');

function authorize(role = null) {
    return async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-me');
            const account = await Account.findByPk(decoded.id);

            if (!account) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Check role if specified
            if (role && account.role !== role) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.account = account;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}

module.exports = authorize;
