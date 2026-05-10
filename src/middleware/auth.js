const { verifyToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return next(new AppError('No token provided. Access denied.', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Token expired. Please login again.', 401));
        }
        return next(new AppError('Invalid token.', 401));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next(new AppError('Access forbidden: insufficient permissions.', 403));
        }
        next();
    };
};

module.exports = { authenticate, authorize}