import { allowedAvatars } from './avatarsList.js';


export class sanitizeInput {

	static sanitizeHtmlStrict(input, maxIterations = 9) {
		if (typeof input !== "string") {
			return "";
		}

		let previous = input;
		let current = input;
		let iterations = 0;

		do {
			previous = current;
			current = current.replace(/<[^>]*>?/gi, ""); // Remove all HTML tags
			current = current.replace(/javascript:/gi, ""); // Remove javascript:
			current = current.replace(/on\w+\s*=/gi, ""); // Remove event handlers, e.g. onclick=

				iterations++;

				if (iterations >= maxIterations) {
					console.warn("Max iterations reached in sanitizeHtmlStrict");
					break;
				}
		} while (current !== previous);

		return current;
	}

	static escapeHtml(input) {
		if (typeof input !== "string") {
			return "";
		}
		const htmlEscapes = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
			"/": "&#x2F;",
		};
		return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
	}

	static sanitizeUsername(input) {
		if (typeof input !== "string") {
			return "";
		}

		let sanitized = this.sanitizeHtmlStrict(input);
		sanitized = this.escapeHtml(sanitized);

		sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");

		if (sanitized.length < 2 || sanitized.length > 7) {
			throw new Error("Username must be between 2 and 7 characters");
			return "";
		}
		return sanitized;
	}

	static sanitizeEmail(email) {
		if (typeof email !== "string") {
			return "";
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		const sanitized = email.toLocaleLowerCase().trim();

		if (!emailRegex.test(sanitized)) {
			throw new Error("Invalid email format");
			return "";
		}
		return sanitized;
	}

	static sanitizeAvatarPath(avatarUrl, allowedAvatars) {

		if (typeof avatarUrl !== "string") {
			throw new Error("Avatar URL must be a string");
		}

		const trimmed = avatarUrl.trim();

		if (trimmed.includes("..")) {
			throw new Error("Avatar URL is invalid");
		}

		if (!trimmed || trimmed.length > 20 || !allowedAvatars.includes(trimmed)) {
			throw new Error("Avatar URL is invalid");
		}

		return trimmed;
	}

	static sanitizeUploadAvatarPath(avatarUrl) {

		// const trimmed = avatarUrl.trim();

		const trimmed = avatarUrl;
		if (!trimmed || trimmed.length > 50) {
			throw new Error("Avatar URL is invalid");
		}

		if (trimmed.includes("..") || trimmed.includes("//")) {
			throw new Error("Avatar URL is invalid");
		}

		const [avatarPrefix, avatarTimestamp = ""] = trimmed.split("?", 2);
		const fileName = avatarPrefix.replace("uploadAvatars/", "");

		const fileNamePattern = /^avatar_\d+\.(png|jpg|jpeg)$/i;
		if (fileNamePattern.test(fileName)) {
			throw new Error("Avatar URL is invalid");
		}

		if (avatarTimestamp.length > 0) {
			const timestampPattern = /^t=\d+$/;
			if (!timestampPattern.test(avatarTimestamp)) {
				throw new Error("Avatar URL is invalid");
			}
			return `${avatarPrefix}?${avatarTimestamp}`;
		}

		return avatarPrefix;
	}

	static avatarPathCheck(avatarUrl, allowedAvatars) {

		const defaultAvatar = '/avatars/Avatar_1.png';
		if (!avatarUrl || typeof avatarUrl !== "string") {
			return defaultAvatar;
		}

		if (avatarUrl.startsWith('/uploadAvatars/')){
			return this.sanitizeUploadAvatarPath(avatarUrl);
		}

		try {
			return this.sanitizeAvatarPath(avatarUrl, allowedAvatars);
		} catch (error) {
			return defaultAvatar;
		}
	}
}
