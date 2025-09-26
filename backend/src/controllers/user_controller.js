import { db } from '../server.js';

const userController = {
    getProfile: async (request, reply) => {
        try {
            const email = request.query.email;
            if (!email) {
                reply.status(400).send({ error: 'Email is required' });
                return;
            }
            const row = db.prepare('SELECT name, avatarUrl FROM items WHERE email = ?').get(email);
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
};

export default userController;