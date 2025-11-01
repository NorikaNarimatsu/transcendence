
export const checkPassword = (password) => {
	if (typeof password !== 'string' || password.length === 0) {
		return { valid: false, error: 'Invalid password format' };
	}
	if (password.length < 9) {
		return { valid: false, error: 'Password must be at least 9 characters long' };
	}
	if (password.length > 25) {
		return { valid: false, error: 'Password must be at most 25 characters long' };
	}
	if (/[<>"']/.test(password)) {
		return { valid: false, error: 'Password contains invalid characters' };
	}
	if (/on\w+\s*=/i.test(password)) {
		return { valid: false, error: 'Password contains invalid patterns' };
	}
	if (/javascript:/i.test(password)) {
		return { valid: false, error: 'Password contains invalid patterns' };
	}
	return { valid: true };
};
