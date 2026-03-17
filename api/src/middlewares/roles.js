import ApiError from '../utils/error.js';

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user)
            throw ApiError.unauthorized("Authentication required.");

        if (!allowedRoles.includes(req.user.role))
            throw ApiError.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`);

        next();
    };
};
