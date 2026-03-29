import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';
import { generateTokens } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/send.mail.js';

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email))
        return 'Invalid email format. Please enter a valid email address.';
    return null;
};

const validatePassword = (password) => {
    if (password.length < 8)
        return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password))
        return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password))
        return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password))
        return 'Password must contain at least one number.';
    return null;
};

export const signUp = async (req, res) => {
    try {
        const { email, phone, fullname, password } = req.body;
        if (!fullname || !email || !password || !phone)
            throw ApiError.badRequest(
                'fullname, email, phone and password are required.',
            );

        const emailError = validateEmail(email);
        if (emailError) throw ApiError.badRequest(emailError);

        if (fullname.length < 2 || fullname.length > 50)
            throw ApiError.badRequest(
                'Full name must be between 2 and 50 characters long.',
            );

        const passError = validatePassword(password);
        if (passError) throw ApiError.badRequest(passError);

        const { rows: existingRows } = await db.query(
            'SELECT id FROM users WHERE email = $1 OR phone = $2 LIMIT 1',
            [email.toLowerCase(), phone],
        );

        if (existingRows.length > 0)
            throw ApiError.conflict('Email or phone already exists.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { rows } = await db.query(
            'INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, role, is_active',
            [fullname.trim(), email.toLowerCase(), phone, hashedPassword],
        );

        const user = rows[0];
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(201).json({
            success: true,
            message: 'Sign-up Successful',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                is_active: user.is_active,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Sign-up Failed',
        });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        if (!password || (!email && !phone))
            throw ApiError.badRequest(
                'Either email or phone, and password are required.',
            );

        let existingRows = [];

        if (email) {
            const result = await db.query(
                'SELECT u.id, u.name, u.email, u.phone, u.password, u.role, u.is_active, sb.branch_id FROM users u LEFT JOIN staff_branches sb ON u.id = sb.user_id WHERE u.email = $1 OR u.phone = $2 LIMIT 1',
                [email.toLowerCase(), phone || null],
            );
            existingRows = result.rows;
        } else if (phone) {
            const result = await db.query(
                'SELECT u.id, u.name, u.email, u.phone, u.password, u.role, u.is_active, sb.branch_id FROM users u LEFT JOIN staff_branches sb ON u.id = sb.user_id WHERE u.phone = $1 LIMIT 1',
                [phone],
            );
            existingRows = result.rows;
        }

        const existingUser = existingRows[0];

        if (!existingUser)
            throw ApiError.notFound(
                'User not found. Please check your email or phone.',
            );

        if (!existingUser.is_active)
            throw ApiError.forbidden('Account is deactivated.');

        const isPasswordValid = await bcrypt.compare(
            password,
            existingUser.password,
        );
        if (!isPasswordValid)
            throw ApiError.unauthorized('Invalid password. Please try again.');

        const { accessToken, refreshToken } = generateTokens(existingUser);

        const userResponse = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            role: existingUser.role,
        };

        if (existingUser.role === 'staff' && existingUser.branch_id) {
            userResponse.branch_id = existingUser.branch_id;
        }

        res.status(200).json({
            success: true,
            message: 'Sign-in successful',
            access_token: accessToken,
            refresh_token: refreshToken,
            user: userResponse,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Sign-in Failed',
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) throw ApiError.badRequest('Email is required.');

        const emailError = validateEmail(email);
        if (emailError) throw ApiError.badRequest(emailError);

        const { rows } = await db.query(
            'SELECT id FROM users WHERE email = $1 LIMIT 1',
            [email.toLowerCase()],
        );
        const user = rows[0];

        if (!user) {
            res.status(200).json({
                success: true,
                message:
                    'If this email is registered, a reset code will be sent.',
            });
            return;
        }

        const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

        const salt = await bcrypt.genSalt(10);
        const hashedResetCode = await bcrypt.hash(resetCode, salt);

        await db.query(
            'UPDATE users SET reset_code = $1, reset_code_expires = $2 WHERE id = $3',
            [hashedResetCode, resetCodeExpires, user.id],
        );

        const emailSubject = 'Password Reset Code';
        const emailText = `Your password reset code is: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;

        const emailHtml = `
            <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF7F2; padding: 40px 20px; border-radius: 8px;">
                <div style="background-color: #FFFFFF; padding: 30px; border-radius: 8px; border: 1px solid #E8E0D5; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h2 style="color: #2B1E17; margin-top: 0;">Password Reset Code</h2>
                    <p style="color: #2B1E17;">Your password reset code is:</p>
                    <div style="background-color: #FAF7F2; padding: 20px; text-align: center; margin: 24px 0; border-radius: 6px; border: 1px dashed #C46A2B;">
                        <h1 style="color: #C46A2B; font-size: 36px; margin: 0; letter-spacing: 6px;">${resetCode}</h1>
                    </div>
                    <p style="color: #8B7E75; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
                    <p style="color: #8B7E75; font-size: 14px; margin-bottom: 0;">If you didn't request this password reset, please ignore this email.</p>
                </div>
            </div>
        `;

        await sendEmail(email, emailSubject, emailText, emailHtml);

        if (process.env.NODE_ENV === 'development')
            console.log(`Reset code for ${email}: ${resetCode}`);

        res.status(200).json({
            success: true,
            message: 'If this email is registered, a reset code will be sent.',
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Password reset failed',
        });
    }
};

export const checkResetCode = async (req, res) => {
    try {
        const { email, reset_code } = req.body;
        if (!email || !reset_code)
            throw ApiError.badRequest('Email and reset code are required.');

        const { rows } = await db.query(
            'SELECT id, email, reset_code FROM users WHERE email = $1 AND reset_code_expires > NOW() LIMIT 1',
            [email.toLowerCase()],
        );
        const user = rows[0];

        if (!user || !user.reset_code)
            throw ApiError.badRequest('Invalid or expired reset code.');

        const isCodeValid = await bcrypt.compare(
            reset_code.toUpperCase(),
            user.reset_code,
        );
        if (!isCodeValid)
            throw ApiError.badRequest('Invalid or expired reset code.');

        await db.query(
            'UPDATE users SET reset_code = NULL, reset_code_expires = NULL WHERE id = $1',
            [user.id],
        );

        const temporary_token = jwt.sign(
            { userId: user.id, email: user.email, type: 'reset' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '5m' },
        );

        res.status(200).json({
            success: true,
            message: 'Reset code verified successfully',
            temporary_token,
            email: user.email,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Reset code verification failed',
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { password, temporary_token } = req.body;

        if (!password || !temporary_token)
            throw ApiError.badRequest(
                'Password and temporary token are required.',
            );

        const passError = validatePassword(password);
        if (passError) throw ApiError.badRequest(passError);

        let decoded;
        try {
            decoded = jwt.verify(temporary_token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError)
                throw ApiError.unauthorized('Temporary token has expired.');
            throw ApiError.unauthorized('Invalid temporary token.');
        }

        if (decoded.type !== 'reset')
            throw ApiError.unauthorized('Invalid temporary token type.');

        const { rows } = await db.query(
            'SELECT id, password FROM users WHERE id = $1 LIMIT 1',
            [decoded.userId],
        );
        const user = rows[0];

        if (!user) throw ApiError.notFound('User not found.');

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword)
            throw ApiError.badRequest(
                'New password must be different from the current password.',
            );

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [
            hashedPassword,
            user.id,
        ]);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Password reset failed',
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token)
            throw ApiError.unauthorized('Refresh token is required.');

        const decoded = jwt.verify(
            refresh_token,
            process.env.JWT_REFRESH_SECRET_KEY,
        );

        const { rows } = await db.query(
            'SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, sb.branch_id FROM users u LEFT JOIN staff_branches sb ON u.id = sb.user_id WHERE u.id = $1 LIMIT 1',
            [decoded.userId],
        );
        const user = rows[0];

        if (!user) throw ApiError.notFound('User not found.');

        if (!user.is_active)
            throw ApiError.forbidden('Account is deactivated.');

        const { accessToken, refreshToken: newRefreshToken } =
            generateTokens(user);

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        };

        if (user.role === 'staff' && user.branch_id) {
            userResponse.branch_id = user.branch_id;
        }

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            access_token: accessToken,
            refresh_token: newRefreshToken,
            user: userResponse,
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false, error: 'Refresh token has expired',
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
                success: false, error: 'Invalid refresh token',
            });
        } else {
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({
                success: false, error: error.message || 'Token refresh failed',
            });
        }
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, phone, currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!fullname && !phone && (!currentPassword || !newPassword))
            throw ApiError.badRequest(
                'At least one field (fullname, phone, or currentPassword + newPassword) is required.',
            );

        if (
            (currentPassword && !newPassword) ||
            (!currentPassword && newPassword)
        )
            throw ApiError.badRequest(
                'Both current password and new password are required for password change.',
            );

        const { rows: userRows } = await db.query(
            'SELECT password FROM users WHERE id = $1 LIMIT 1',
            [userId],
        );
        const user = userRows[0];

        if (!user) throw ApiError.notFound('User not found.');

        let updateValues = [];
        let querySegments = [];
        let index = 1;

        let passwordChanged = false;

        if (fullname) {
            if (fullname.length < 2 || fullname.length > 50)
                throw ApiError.badRequest(
                    'Full name must be between 2 and 50 characters long.',
                );
            querySegments.push(`name = $${index++}`);
            updateValues.push(fullname.trim());
        }

        if (phone !== undefined) {
            querySegments.push(`phone = $${index++}`);
            updateValues.push(phone);
        }

        if (currentPassword && newPassword) {
            const isCurrentPasswordValid = await bcrypt.compare(
                currentPassword,
                user.password,
            );
            if (!isCurrentPasswordValid)
                throw ApiError.unauthorized('Current password is incorrect.');

            const passError = validatePassword(newPassword);
            if (passError) throw ApiError.badRequest(passError);

            const isSamePassword = await bcrypt.compare(
                newPassword,
                user.password,
            );
            if (isSamePassword)
                throw ApiError.badRequest(
                    'New password must be different from the current password.',
                );

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            querySegments.push(`password = $${index++}`);
            updateValues.push(hashedPassword);
            passwordChanged = true;
        }

        if (querySegments.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No updates provided.',
            });
            return;
        }

        updateValues.push(userId);

        const { rows } = await db.query(
            `UPDATE users SET ${querySegments.join(', ')} WHERE id = $${index} RETURNING id, name, email, phone, role, is_active`,
            updateValues,
        );

        const updatedUser = rows[0];

        let message = 'Profile updated successfully';
        if (passwordChanged && !fullname && !phone)
            message = 'Password changed successfully';
        else if (passwordChanged)
            message = 'Profile and password updated successfully';

        res.status(200).json({
            success: true,
            message: message,
            user: updatedUser,
        });
    } catch (error) {
        if (error.code === '23505') {
            res.status(409).json({
                success: false, error: 'Phone number is already in use.',
            });
            return;
        }
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Profile update failed',
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT u.id, u.name, u.email, u.phone, u.role, sb.branch_id FROM users u LEFT JOIN staff_branches sb ON u.id = sb.user_id WHERE u.id = $1 LIMIT 1',
            [userId],
        );
        const user = rows[0];

        if (!user) throw ApiError.notFound('User not found.');

        const userResponse = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };

        if (user.role === 'staff' && user.branch_id) {
            userResponse.branch_id = user.branch_id;
        }

        res.status(200).json({
            success: true,
            user: userResponse,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to get user data',
        });
    }
};

export const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const authHeader = req.header('Authorization');
        const accessToken = authHeader?.replace('Bearer ', '');

        if (!userId) throw ApiError.notFound('User not found.');

        if (!accessToken) throw ApiError.badRequest('Access token not found.');

        console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Logout failed',
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rows } = await db.query(
            'SELECT id FROM users WHERE id = $1 LIMIT 1',
            [userId],
        );
        const user = rows[0];

        if (!user) throw ApiError.notFound('User not found.');

        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully.',
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Account deletion failed',
        });
    }
};
