import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
	if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
		return error.response.data.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'Erro desconhecido';
}

export function getValidationErrors(error: unknown): Record<string, string> {
	if (!isAxiosError(error)) return {};

	const errors = error.response?.data?.errors as
		| Record<string, string[]>
		| undefined;

	if (!errors) return {};

	return Object.fromEntries(
		Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
	);
}
