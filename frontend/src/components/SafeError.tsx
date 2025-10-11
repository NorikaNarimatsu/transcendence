import { sanitizeInput } from "../utils/sanitizeInput";

interface SafeErrorProps {
	error: string | null | undefined;
	className?: string;
	sanitize?: boolean;
}

export default function SafeError({ error, className, sanitize = true }: SafeErrorProps) {
	if (!error) return null;

	return (
		<div className={`text-red-500 ${className}`}>
			{sanitize ? sanitizeInput.escapeHtml(error) : error}
		</div>
	);
}
