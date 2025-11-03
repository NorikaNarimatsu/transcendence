
export const sanitizeEmail = (email: string): string => {
	if (typeof email !== 'string') return '';

	let sanitizedEmail = email
		.replace(/[<>]/g, '') //remove < and >
		.replace(/javascript:/gi, '') //remove javascript (malicious URLs)
		.replace(/on\w+\s*=/gi, '') //remove event handlers (e.g. onclick=, onerror=)
		.trim()
		.toLowerCase()

	const emailRegex = /^[a-zA-Z0-9._%+-]+[@a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailRegex.test(sanitizedEmail)) {
		return '';
	}

	return sanitizedEmail;
};

export const getEmailErrorMessage = (email: string): string => {
	const sanitizedEmail = sanitizeEmail(email);
	
	if (!sanitizedEmail|| sanitizedEmail.trim() === "") {
		return "Email is required";
	}
	if (sanitizedEmail.length > 254) {
		return "Email must be less than 255 characters";
	}
	if (sanitizedEmail.includes("..")) {
		return "Email cannot contain consecutive dots";
	}
	if (sanitizedEmail.startsWith(".") || sanitizedEmail.endsWith(".")) {
		return "Email cannot start or end with a dot";
	}
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	
	if (!emailRegex.test(sanitizedEmail)) {
		return "Invalid email format";
	}
	return '';
};

export const validateEmail = (email: string): boolean => {
	return getEmailErrorMessage(email) === '';
};

const emailValidation = {
	sanitizeEmail,
	validateEmail,
	getEmailErrorMessage
};

export default emailValidation;