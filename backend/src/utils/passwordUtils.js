import	bcrypt from 'bcrypt';

const SALT_ROUNDS = 11;

export	async function hashPassword(password) {
	try {
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
		return hashedPassword;
	} catch (error) {
		throw new Error('Error: hashPassword: ' + error.message);
	}
}

export async function comparePassword(password, hashedPassword) {
	try {
		const isMatch = await bcrypt.compare(password, hashedPassword);
		return isMatch;
	} catch (error) {
		throw new Error('Error: comparePassword: ' + error.message)
	}
}


const passwordUtils = {
	hashPassword,
	comparePassword
};

export default passwordUtils;