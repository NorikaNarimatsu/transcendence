
export const sanitizeInput = {
	escapeHtml: (input: string): string => {
		if (typeof input !== 'string') {
			return "";
		}
		const htmlEscapes: { [key: string]: string } = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return input.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
	},

	sanitizeVerificationCode: (input: string): string => {
		if (typeof input !== 'string') {
			return "";
		}

		const numOnly = input.replace(/[^0-9]/g, '');
		return numOnly.slice(0,6);
	}
}
