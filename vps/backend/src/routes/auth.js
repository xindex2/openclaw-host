import 'dotenv/config';
import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { authenticateToken } from '../middleware/auth.js';
import EmailService from '../services/EmailService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Google OAuth Setup
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`
);

// Initiate Google OAuth
router.get('/google', (req, res) => {
    const url = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
    });
    res.redirect(url);
});

// Google OAuth Callback
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name: full_name, picture: avatar_url } = payload;

        // 1. Try to find by Google ID
        let user = await User.findByGoogleId(googleId);

        // 2. If not found, try to find by email and link
        if (!user) {
            user = await User.findByEmail(email);
            if (user) {
                // Link Google account to existing user and update avatar if missing
                const updates = { google_id: googleId };
                if (!user.avatar_url && avatar_url) updates.avatar_url = avatar_url;
                await User.update(user.id, updates);
                user = await User.findById(user.id);
            } else {
                // 3. Create new user
                user = await User.create({
                    full_name,
                    email,
                    google_id: googleId,
                    avatar_url,
                    acquisition_source: 'Google Auth'
                });
            }
        } else if (avatar_url && user.avatar_url !== avatar_url) {
            // Update avatar if it changed in Google
            await User.update(user.id, { avatar_url });
            user.avatar_url = avatar_url;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, full_name: user.full_name, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Redirect back to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            avatar_url: user.avatar_url
        }))}`);

    } catch (error) {
        console.error('Google Auth Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
});
// Validation middleware
const validateRegistration = [
    body('full_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const validateLogin = [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').exists(),
];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { full_name, email, password, acquisition_source } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create user
        const user = await User.create({ full_name, email, password, acquisition_source });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, full_name: user.full_name, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                acquisition_source: user.acquisition_source
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await User.verifyPassword(user, password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is inactive' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, full_name: user.full_name, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user (requires authentication)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findWithSubscription(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role || 'user',
            plan: user.plan || 'Free',
            maxInstances: user.max_instances !== null && user.max_instances !== undefined ? user.max_instances : 0,
            avatar_url: user.avatar_url,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// Update user profile (requires authentication)
router.patch('/profile', authenticateToken, async (req, res) => {
    try {
        const { full_name, password, avatar_url } = req.body;
        const updates = {};

        if (full_name) updates.full_name = full_name;
        if (avatar_url) updates.avatar_url = avatar_url;
        if (password) {
            const bcrypt = await import('bcryptjs');
            updates.password_hash = await bcrypt.default.hash(password, 10);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        const updatedUser = await User.update(req.user.id, updates);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                avatar_url: updatedUser.avatar_url
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update user subscription (requires authentication)
router.patch('/subscription', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({ error: 'Plan is required' });
        }

        const validPlans = ['One Agent', '5 Agents', '10 Agents', 'Enterprise'];
        if (!validPlans.includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        let maxInstances = 1;
        if (plan === 'One Agent') maxInstances = 1;
        else if (plan === '5 Agents') maxInstances = 5;
        else if (plan === '10 Agents') maxInstances = 10;
        else if (plan === 'Enterprise') maxInstances = 100;

        // Use a generic query since we don't have a Subscription model yet
        const { query } = await import('../config/database.js');
        await query(`
            INSERT INTO subscriptions (user_id, plan, max_instances)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO UPDATE SET plan = $2, max_instances = $3, updated_at = CURRENT_TIMESTAMP
        `, [decoded.userId, plan, maxInstances]);

        res.json({ message: `Plan updated to ${plan} successfully`, plan, maxInstances });
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Failed to update subscription' });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            // Return success even if user not found for security
            return res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await User.setResetToken(email, token, expires);
        await EmailService.sendPasswordResetEmail(email, token);

        res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process forgot password request' });
    }
});

// Reset Password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;
        const user = await User.findByResetToken(token);

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.default.hash(password, 10);

        await User.updatePassword(user.id, passwordHash);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

export default router;
