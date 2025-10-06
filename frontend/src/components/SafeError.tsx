import { sanitizeInput } from "../utils/sanitizeInput";

interface SafeErrorProps {
	error: string | null | undefined;
	className?: string;
}

export default function SafeError({ error, className }: SafeErrorProps) {
	if (!error) return null;

	return (
		<div className={`text-red-500 ${className}`}>
			{sanitizeInput.escapeHtml(error)}
		</div>
	);
}
