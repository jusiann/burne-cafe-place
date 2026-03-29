import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
            userId: user.id, 
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            is_active: user.is_active,
            type: 'access'
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET_KEY,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};
