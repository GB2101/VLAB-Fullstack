import values from '@/assets/values.json';

export interface Solicitation {
	id: number;
	protocolo: string;
	nome_solicitante: string;
	categoria: keyof typeof values.category;
	prioridade: keyof typeof values.priority;
	status: keyof typeof values.status;
	descricao: string;
	justificativa_prioridade?: string;
	data_criacao: string;
	data_atualizacao: string;
}

export interface CreateSolicitationPayload {
	nome_solicitante: string;
	descricao: string;
	categoria: Solicitation['categoria'];
	prioridade: Solicitation['prioridade'];
	justificativa_prioridade?: string;
}

export interface SolicitationSummary {
	total: number;
	status: Record<keyof typeof values.status, number>;
	prioridade: Record<keyof typeof values.priority, number>;
}
