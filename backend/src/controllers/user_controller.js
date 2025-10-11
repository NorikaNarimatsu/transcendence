import { db } from '../server.js';

const userAnon = {
    anonymizeUserData: (userId) => {
        const anonymizedName = `deleted_user_${userId}`;
        const anonymizedEmail = `deleted_${userId}@anonymized.com`;
        const anonymizedPassword = 'ANONYMIZED';
        const defaultAvatarUrl = '/avatars/Avatar_1.png';

        return {
            name: anonymizedName,
            email: anonymizedEmail,
            password: anonymizedPassword,
            avatarUrl: defaultAvatarUrl
        };
    },

    performAnonymization: async (email) => {
        // Check if user exists
        const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate anonymous data
        const anonymizedData = userAnon.anonymizeUserData(user.id);

        // Update user with anonymized data
        const updateResult = db.prepare(`
            UPDATE users 
            SET name = ?, email = ?, password = ?, avatarUrl = ? 
            WHERE email = ?
        `).run(anonymizedData.name, anonymizedData.email, anonymizedData.password, anonymizedData.avatarUrl, email);

        if (updateResult.changes === 0) {
            throw new Error('Failed to anonymize user data');
        }

        return {
            message: 'User data anonymized successfully',
            anonymizedName: anonymizedData.name
        };
    }
};

const userController = {
    getProfile: async (request, reply) => {
        try {
            const email = request.query.email;
            if (!email) {
                reply.status(400).send({ error: 'Email is required' });
                return;
            }
            const row = db.prepare('SELECT name, avatarUrl FROM users WHERE email = ?').get(email);
            if (!row) {
                reply.status(404).send({ error: 'User not found' });
            } else {
                reply.send({
                    name: row.name,
                    avatarUrl: row.avatarUrl,
                });
            }
        } catch (err) {
            reply.status(500).send({ error: 'Database error', details: err.message });
        }
    },

    anonymizeUser: async (request, reply) => {
        try {
            const { email } = request.body;
            
            if (!email) {
                reply.status(400).send({ error: 'Email is required' });
                return;
            }

            const result = await userAnon.performAnonymization(email);
            reply.send(result);

        } catch (err) {
            if (err.message === 'User not found') {
                reply.status(404).send({ error: err.message });
            } else {
                reply.status(500).send({ error: 'Database error', details: err.message });
            }
        }
    },
};

export default userController;