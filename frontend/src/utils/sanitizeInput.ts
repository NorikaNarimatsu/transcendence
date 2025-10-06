
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
	}
}
