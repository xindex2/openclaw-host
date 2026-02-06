import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
    // Create a new user
    static async create({ full_name, email, password, acquisition_source = null, whop_user_id = null, google_id = null, avatar_url = null }) {
        const passwordHash = password ? await bcrypt.hash(password, 10) : 'MANAGED_AUTH';

        const result = await query(
            `INSERT INTO users (full_name, email, password_hash, role, acquisition_source, whop_user_id, google_id, avatar_url)
       VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)
       RETURNING id, full_name, email, role, created_at, is_active, email_verified, acquisition_source, whop_user_id, google_id, avatar_url`,
            [full_name, email, passwordHash, acquisition_source, whop_user_id, google_id, avatar_url]
        );

        return result.rows[0];
    }

    // Find user by email
    static async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Find user by full_name
    static async findByFullName(full_name) {
        const result = await query(
            'SELECT * FROM users WHERE full_name = $1',
            [full_name]
        );
        return result.rows[0];
    }

    // Find user by Whop ID
    static async findByWhopUserId(whop_user_id) {
        const result = await query(
            'SELECT * FROM users WHERE whop_user_id = $1',
            [whop_user_id]
        );
        return result.rows[0];
    }

    // Find user by Google ID
    static async findByGoogleId(google_id) {
        const result = await query(
            'SELECT * FROM users WHERE google_id = $1',
            [google_id]
        );
        return result.rows[0];
    }

    // Find user by reset token
    static async findByResetToken(token) {
        const result = await query(
            'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP',
            [token]
        );
        return result.rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const result = await query(
            'SELECT id, full_name, email, role, created_at, is_active, email_verified, acquisition_source, whop_user_id, google_id, avatar_url FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Verify password
    static async verifyPassword(user, password) {
        if (user.password_hash === 'WHOP_MANAGED') return false; // Must use Whop/OAuth or reset password
        return await bcrypt.compare(password, user.password_hash);
    }

    // Update user
    static async update(id, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (Object.keys(updates).length === 0) {
            return this.findById(id);
        }

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }

        values.push(id);

        const result = await query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, full_name, email, role, created_at, is_active, email_verified, avatar_url`,
            values
        );

        return result.rows[0];
    }

    // Set reset token
    static async setResetToken(email, token, expires) {
        await query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
            [token, expires, email]
        );
    }

    // Update password
    static async updatePassword(userId, passwordHash) {
        await query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [passwordHash, userId]
        );
    }

    // Delete user
    static async delete(id) {
        await query('DELETE FROM users WHERE id = $1', [id]);
    }

    // Get user with subscription info
    static async findWithSubscription(id) {
        const result = await query(
            `SELECT u.id, u.full_name, u.email, u.role, u.created_at, u.is_active, u.email_verified, u.acquisition_source, u.avatar_url,
                    s.plan, s.status as subscription_status, s.max_instances
       FROM users u
       LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
       WHERE u.id = $1`,
            [id]
        );
        return result.rows[0];
    }
}
