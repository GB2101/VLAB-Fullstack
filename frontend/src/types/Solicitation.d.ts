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
