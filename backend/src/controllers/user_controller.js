import { db } from '../server.js';

const userController = {
    getProfile: async (request, reply) => {
        // reply.send({
        //     name: "Eduarda",
        // });
        try {
            const row = db.prepare('SELECT name FROM items LIMIT 1').get();
            if (!row) {
                reply.status(404).send({ error: 'User not found' });
            } else {
                reply.send({
                    name: row.name,
                    avatarUrl: '/avatars/Avatar 1.png' // default avatar, change for db
                });
            }
        } catch (err) {
            reply.status(500).send({ error: 'Database error', details: err.message });
        }
    },
};

export default userController;