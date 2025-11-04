import { sanitizeInput } from "./sanitizeInput.js";


export const authenticateToken = async (request, response) => {
	try {
		const authHeader = request.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return response.code(401).send({ error: 'Unauthorized' });
		}
		await request.jwtVerify();
		
		const user = request.user;

		if (user && user.temp === true) {
			return;
		}
		
		if (user && user.lastActivity) {
			const lastActivity = user.lastActivity;
			const currentTime = Math.floor(Date.now() / 1000);
			const inactivityTimeOut = 30 * 60;
			const timeSinceLastActivity = currentTime - lastActivity;

			if (timeSinceLastActivity > inactivityTimeOut) {
				return response.code(401).send({ error: 'Session expired due to inactivity' });
			}

			if (timeSinceLastActivity > 10) {
				const newToken = request.server.jwt.sign({
					userID: user.userID,
					email: sanitizeInput.sanitizeEmail(user.email),
					name: sanitizeInput.sanitizeUsername(user.name),
					has2FA: user.has2FA || false,
					verified2FA: user.verified2FA || false,
					iat: Math.floor(Date.now() / 1000),
					exp: Math.floor(Date.now() / 1000) + (3 * 60 * 60),
					lastActivity: currentTime,
				}, { expiresIn: '3h' });
				
				response.header('Renewed-Token', newToken);
				} 
		} else if (user && !user.lastActivity) {
			return response.code(401).send({ error: 'Invalid session. Please log in again' });
		}
	} catch (error) {
		request.log?.error?.('Error in authenticateToken: ', error);
		return response.code(401).send({ error: 'Unauthorized' });
	}
}
