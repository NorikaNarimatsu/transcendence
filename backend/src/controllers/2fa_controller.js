import { db} from '../server.js';
import { emailUtils } from '../utils/emailUtils.js';
import { comparePassword } from '../utils/passwordUtils.js';
import bcrypt from 'bcrypt';

const twoFactorController = {
	enable2FA: async (request, response) => {
		try {
			const { userID } = request.body;
			const user = db.prepare('SELECT userID, email, name, "2FA" FROM users WHERE userID = ?').get(userID);

			if (!user) {
				return response.code(404).send({ error: 'User not found' });
			}

			if (user['2FA']) {
				return response.code(400).send({ error: '2FA already enabled' });
			}

			db.prepare('UPDATE users SET "2FA" = 1 WHERE userID = ?').run(userID);

			return response.send({
				success: true,
				message: '2FA enabled successfully',
				user: { ...user, has2FA: true }
			});
		} catch (error) {
			return response.code(500).send({ error: 'Server error' });
		}
	},
	
	disable2FA: async (request, response) => {
		try {
			const { userID, password } = request.body;

			const user = db.prepare('SELECT userID, email, name, password, "2FA" FROM users WHERE userID = ?').get(userID);

			if (!user || !user['2FA']) {
				return response.code(400).send({ error: '2FA not enabled' });
			}

			const isPasswordValid = await comparePassword(password, user.password);
			if (!isPasswordValid) {
				return response.code(401).send({ error: 'Invalid password' });
			}

			db.prepare('UPDATE users SET "2FA" = 0 WHERE userID = ?').run(userID);
			db.prepare('DELETE FROM two_factor_auth WHERE userID = ? AND used = 0').run(userID);

			return response.send({
				success: true,
				message: '2FA disabled successfully',
				user: { ...user, has2FA: false }
			});
		} catch (error) {
			return response.code(500).send({ error: 'Server error' });
		}
	},

	sendVerificationCode: async (request, response) => {
		try {
			const { userID } = request.body;

			const user = db.prepare('SELECT userID, email, name, "2FA" FROM users WHERE userID = ?').get(userID);

			if (!user || !user['2FA']) {
				return response.code(400).send({ error: '2FA not enabled' });
			}

			
			db.prepare('DELETE FROM two_factor_auth WHERE userID = ? AND used = 0').run(userID);
			
			const code = emailUtils.generateAuthCode();
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

			const saltRounds = 12;
			const hashedCode = await bcrypt.hash(code, saltRounds);
			
			
			db.prepare(`
				INSERT INTO two_factor_auth (userID, code, expiresAt, attempts)
				VALUES (?, ?, ?, ?)
			`).run(userID, hashedCode, expiresAt, 0);

			const emailSent = await emailUtils.sendAuthCodeEmail(user.email, user.name, code);

			if (!emailSent) {
				return response.code(500).send({ error: 'Failed to send verification email' });
			}

			return response.send({
				success: true,
				message: 'Verification code sent with email'
			});
		} catch (error) {
			return response.code(500).send({ error: 'Server error' });
		}
	},

	verifyCode: async (request, response) => {
		try {
			const { userID, code } = request.body;

			const codeRecord = db.prepare(`
				SELECT * FROM two_factor_auth
				WHERE userID = ? AND used = 0
				ORDER BY createdAt DESC LIMIT 1
			`).get(userID);
			
			if (!codeRecord) {
				return response.code(400).send({ error: 'Invalid code' });
			}

			if (new Date() > new Date(codeRecord.expiresAt)) {
				return response.code(400).send({ error: 'Code expired' });
			}

			const maxAttempts = 5;
			const currentAttempts = codeRecord.attempts ?? 0;
			if (currentAttempts >= maxAttempts) {
				return response.code(429).send({ error: 'Code verification attempts exceeded', attemptsLeft: 0 });
			}

			const isCodeValid = await bcrypt.compare(code, codeRecord.code);
			if (!isCodeValid) {

				db.prepare('UPDATE two_factor_auth SET attempts = attempts + 1 WHERE codeID = ?').run(codeRecord.codeID);
				const attemptsLeft = maxAttempts - (currentAttempts + 1);
				return response.code(400).send({ error: 'Invalid code', attemptsLeft });
			}

			db.prepare('UPDATE two_factor_auth SET used = 1 WHERE codeID = ?').run(codeRecord.codeID);

			const user = db.prepare('SELECT userID, email, name, avatarUrl FROM users WHERE userID = ?').get(userID);
			// console.log('Raw user from database: ', JSON.stringify(user, null, 2));
			// console.log('userkeys: ', Object.keys(user));

			const fullToken = request.server.jwt.sign({
				userID: user.userID,
				email: user.email,
				name: user.name,
				has2FA: true,
				verified2FA: true,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60), // 3 hrs
				lastActivity: Math.floor(Date.now() / 1000)
			}, { expiresIn: '3h' });

			const userResponse = {};
			userResponse['userID'] = user.userID;
			userResponse['email'] = user.email;
			userResponse['name'] = user.name;
			userResponse['avatarUrl'] = user.avatarUrl;
			userResponse['has2FA'] = true;
			userResponse['verified2FA'] = true;

			// return response.send({
			const responseData = {
				success: true,
				message: 'Code verified successfully',
				token: fullToken,
				// user: {
				// 	userId: user.userID,
				// 	email: user.email,
				// 	name: user.name,
				// 	avatarUrl: user.avatarUrl,
				// 	has2FA: true,
				// 	verified2FA: true
				// }
				user: userResponse
			};
			// console.log('verifyCode response data before send: ', JSON.stringify(responseData, null, 2));
			return response.send(responseData);
			// });
		} catch (error) {
			console.error('2FA verification error: ', error);
			return response.code(500).send({ error: 'Server error' });
		}
	},

	get2FAstatus: async (request, response) => {
		try {
			const userID = request.query.userID;

			const user = db.prepare('SELECT userID, email, name, "2FA" FROM users WHERE userID = ?').get(userID);

			if (!user) {
				return response.code(404).send({ error: 'User not found' });
			}

			return response.send({
				userID: user.userID,
				email: user.email,
				name: user.name,
				has2FA: !!user['2FA'],
				code: user['2FA'] ? 'enabled' : 'disabled'
			});
		} catch (error) {
			return response.code(500).send({ error: 'Server error'});
		}
	}
};

export default twoFactorController;