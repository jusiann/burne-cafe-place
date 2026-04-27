import jwt from 'jsonwebtoken';
import db from '../lib/db/database.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ 
                success: false, error: 'Access token is required' 
            });
        
        const accessToken = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
        
        if (decoded.type !== 'access') {
            return res.status(401).json({
                success: false, error: 'Invalid token type'
            });
        }

        const { rows } = await db.query(
            'SELECT is_active, role FROM users WHERE id = $1',
            [decoded.userId],
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false, error: 'User no longer exists'
            });
        }

        if (rows[0].is_active === false) {
            return res.status(403).json({
                success: false, error: 'Account is deactivated'
            });
        }

        req.user = {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone,
            role: rows[0].role,
            is_active: rows[0].is_active
        };
        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError)
            return res.status(401).json({ 
                success: false, error: 'Access token has expired' 
            });     

        return res.status(401).json({ 
            success: false, error: 'Invalid access token' 
        });
    }
};
