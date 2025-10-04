import { z, ZodError } from 'zod';

const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[@$!%*?&]/,"Password must contain at least one special character @$!%*?&");

  export interface ValidationResult {
	isValid: boolean;
	errors: string[];
  }
  export function validatePassword(password: string): ValidationResult {
	try {
		passwordSchema.parse(password);
		return { isValid: true, errors: [] };
	} catch (error) {
		if (error instanceof ZodError) {
			return {
				isValid: false,
				errors: error.issues.map((issue: any) => issue.message)
			};
		}
		return { isValid: false, errors: ["Invalid password"] };
	}
}

export function validatePasswordRealTime(password: string): string {
	if (password.length === 0) {
		return '';
	}
	const validation = validatePassword(password);
	if (!validation.isValid) {
		return validation.errors[0];
	}
	return '';
}

const passwordValidation = {
	validatePassword,
	validatePasswordRealTime
}

export default passwordValidation;