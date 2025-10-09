
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
				// .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
				// .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
				// .replace(/<img\b[^<]*(?:(?!<\/img>)<[^<]*)*<\/img>/gi, "")
				// .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
				// .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
				// .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
				// .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
				// .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
				// .replace(/svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
				// .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi, "")
				// .replace(/<\s*script/gi, "&lt;script") // remove any remaining <script tags
				// .replace(/<\s*\/\s*script\s*>/gi, "&lt;/script&gt;") // remove any remaining </script> tags
				// .replace(/javascript:/gi, "") // Remove javascript
				// .replace(/on\w+\s*=/gi, ""); // Remove event handlers, e.g. onclick=

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

	static sanitizeText(input, maxLength = 500) {
		if (typeof input !== 'string') {
			return '';
		}
		let sanitized = this.sanitizeHtmlStrict(input);
		sanitized = this.escapeHtml(sanitized);

		if (sanitized.length > maxLength) {
			sanitized = sanitized.substring(0, maxLength);
		}
		return sanitized.trim();
	}
}
