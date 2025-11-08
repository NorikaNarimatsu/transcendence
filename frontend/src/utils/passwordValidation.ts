import { z, ZodError} from 'zod';

// TODO -> bring back all password rules when done with the project!
const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters long")
  .max(25, "Password must be at most 25 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[@$!%*?&]/,"Password must contain at least one special character @$!%*?&")
  .refine((val) => !/[<>"']/.test(val), "Password cannot contain < > \" or ' characters")
  .refine((val) => !/on\w+\s*=/i.test(val), "Password cannot contain event handlers like onclick=")
  .refine((val) => !/javascript:/i.test(val), "Password cannot contain 'javascript:'");

const passwordSchemaMini = z
  .string()
  .min(1, "Password cannot be empty")
  .refine((val) => !/[<>"']/.test(val), "Password cannot contain < > \" or ' characters")
  .refine((val) => !/on\w+\s*=/i.test(val), "Password cannot contain event handlers like onclick=")
  .refine((val) => !/javascript:/i.test(val), "Password cannot contain 'javascript:'");

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

export function validatePasswordMini(password: string): ValidationResult {
	try {
		passwordSchemaMini.parse(password);
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

export function validatePasswordRealTimeMini(password: string): string {
	if (password.length === 0) {
		return '';
	}
	const validation = validatePasswordMini(password);
	if (!validation.isValid) {
		return validation.errors[0];
	}
	return '';
}

const passwordValidation = {
	validatePassword,
	validatePasswordRealTime,
	validatePasswordMini,
	validatePasswordRealTimeMini
}

export default passwordValidation;