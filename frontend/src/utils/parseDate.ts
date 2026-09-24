export function parseDate(timestamp: string): string {
	const date = new Date(timestamp);

	return date.toLocaleDateString('pt-BR');
}
