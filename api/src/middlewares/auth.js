import jwt from 'jsonwebtoken';
import db from '../lib/db/database.js';


export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ 
                success: false, 
                message: 'Access token is required' 
            });
        
        const accessToken = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        
        if (decoded.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = {
            id: decoded.userId,
            name: decoded.name,
            email: decoded.email,
            phone: decoded.phone,
            role: decoded.role,
            is_active: decoded.is_active
        };
        
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError)
            return res.status(401).json({ 
                success: false, 
                message: 'Access token has expired' 
            });     

        return res.status(401).json({ 
            success: false, 
            message: 'Invalid access token' 
        });
    }
};
