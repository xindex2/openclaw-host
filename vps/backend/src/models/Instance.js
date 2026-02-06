import { query } from '../config/database.js';

export class Instance {
    // Create a new instance
    static async create({ userId, subdomain, sshPort, gatewayPort }) {
        const result = await query(
            `INSERT INTO instances (user_id, subdomain, ssh_port, gateway_port, status)
       VALUES ($1, $2, $3, $4, 'stopped')
       RETURNING *`,
            [userId, subdomain, sshPort, gatewayPort]
        );

        return result.rows[0];
    }

    // Find instance by ID
    static async findById(id) {
        const result = await query(
            'SELECT * FROM instances WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find all instances for a user
    static async findByUserId(userId) {
        const result = await query(
            'SELECT * FROM instances WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    // Find instance by subdomain
    static async findBySubdomain(subdomain) {
        const result = await query(
            'SELECT * FROM instances WHERE subdomain = $1',
            [subdomain]
        );
        return result.rows[0];
    }

    // Update instance
    static async update(id, updates) {
        const fields = [];
        const values = [];
        let paramCount = 1;

        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }

        values.push(id);

        const result = await query(
            `UPDATE instances SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Update container ID
    static async updateContainerId(id, containerId) {
        const result = await query(
            'UPDATE instances SET container_id = $1 WHERE id = $2 RETURNING *',
            [containerId, id]
        );
        return result.rows[0];
    }

    // Update status
    static async updateStatus(id, status) {
        const timestampField = status === 'running' ? 'last_started_at' : 'last_stopped_at';

        const result = await query(
            `UPDATE instances SET status = $1, ${timestampField} = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return result.rows[0];
    }

    // Delete instance
    static async delete(id) {
        await query('DELETE FROM instances WHERE id = $1', [id]);
    }

    // Count instances for a user
    static async countByUserId(userId) {
        const result = await query(
            'SELECT COUNT(*) as count FROM instances WHERE user_id = $1',
            [userId]
        );
        return parseInt(result.rows[0].count);
    }

    // Get instance with user info
    static async findWithUser(id) {
        const result = await query(
            `SELECT i.*, u.full_name, u.email
       FROM instances i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
            [id]
        );
        return result.rows[0];
    }
}
