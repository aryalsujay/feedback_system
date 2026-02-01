const roleMiddleware = (roles) => {
    return (req, res, next) => {
        // req.user is populated by authMiddleware
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

module.exports = roleMiddleware;

