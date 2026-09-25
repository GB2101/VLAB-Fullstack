import { useState, type FormEvent } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Field as FormField,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';

import { Content } from '@/components/Content';
import { Navigator } from '@/components/Navigator';

import values from '@/assets/values.json';
import { useAxios } from '@/hooks/useAxios';
import { getErrorMessage, getValidationErrors } from '@/utils/getErrorMessage';
import type {
	CreateSolicitationPayload,
	Resource,
	Solicitation,
} from '@/types';

type Categoria = keyof typeof values.category;
type Prioridade = keyof typeof values.priority;

interface FormState {
	nome_solicitante: string;
	descricao: string;
	categoria: Categoria | '';
	prioridade: Prioridade | '';
	justificativa_prioridade: string;
}

const initialState: FormState = {
	nome_solicitante: '',
	descricao: '',
	categoria: '',
	prioridade: '',
	justificativa_prioridade: '',
};

function validate(form: FormState): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!form.nome_solicitante.trim()) {
		errors.nome_solicitante = 'Informe o nome do solicitante.';
	}

	if (!form.categoria) {
		errors.categoria = 'Selecione uma categoria.';
	}

	if (!form.prioridade) {
		errors.prioridade = 'Selecione uma prioridade.';
	}

	if (!form.descricao.trim()) {
		errors.descricao = 'Descreva a solicitação.';
	}

	if (form.prioridade === 'URGENTE' && !form.justificativa_prioridade.trim()) {
		errors.justificativa_prioridade =
			'Justifique a prioridade urgente.';
	}

	return errors;
}

export const Route = createFileRoute('/solicitacoes_/_pages/registrar')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const axios = useAxios();
	const queryClient = useQueryClient();

	const [form, setForm] = useState<FormState>(initialState);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => ({ ...prev, [key]: '' }));
	};

	const mutation = useMutation({
		mutationFn: async (payload: CreateSolicitationPayload) => {
			const { data } = await axios.post<Resource<Solicitation>>(
				'/solicitacoes',
				payload,
			);
			return data.data;
		},
		onSuccess: (solicitation) => {
			queryClient.invalidateQueries({ queryKey: ['solicitations'] });
			navigate({
				to: '/solicitacoes/$solicitacoes',
				params: { solicitacoes: String(solicitation.id) },
			});
		},
		onError: (error) => {
			setErrors((prev) => ({ ...prev, ...getValidationErrors(error) }));
		},
	});

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();

		const validationErrors = validate(form);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) return;

		mutation.mutate({
			nome_solicitante: form.nome_solicitante,
			descricao: form.descricao,
			categoria: form.categoria as Categoria,
			prioridade: form.prioridade as Prioridade,
			justificativa_prioridade:
				form.prioridade === 'URGENTE'
					? form.justificativa_prioridade
					: undefined,
		});
	};

	return (
		<Content>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>Nova Solicitação</CardTitle>
					<CardDescription>
						Preencha os dados para registrar uma nova solicitação de
						atendimento.
					</CardDescription>
				</CardHeader>

				<Separator />

				<form onSubmit={handleSubmit}>
					<CardContent>
						<FieldGroup>
							<FormField data-invalid={!!errors.nome_solicitante}>
								<FieldLabel htmlFor='nome_solicitante'>
									Nome do Solicitante
								</FieldLabel>
								<Input
									id='nome_solicitante'
									value={form.nome_solicitante}
									aria-invalid={!!errors.nome_solicitante}
									disabled={mutation.isPending}
									onChange={(event) =>
										setField(
											'nome_solicitante',
											event.target.value,
										)
									}
								/>
								<FieldError>{errors.nome_solicitante}</FieldError>
							</FormField>

							<div className='flex flex-wrap gap-4'>
								<FormField
									className='min-w-48 flex-1'
									data-invalid={!!errors.categoria}
								>
									<FieldLabel htmlFor='categoria'>
										Categoria
									</FieldLabel>
									<Select
										value={form.categoria}
										disabled={mutation.isPending}
										onValueChange={(value) =>
											setField(
												'categoria',
												value as Categoria,
											)
										}
									>
										<SelectTrigger
											id='categoria'
											className='w-full'
											aria-invalid={!!errors.categoria}
										>
											<SelectValue placeholder='Selecione'>
												{(value: Categoria | null) =>
													value
														? values.category[value]
														: 'Selecione'
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{Object.entries(values.category).map(
												([value, label]) => (
													<SelectItem
														key={value}
														value={value}
													>
														{label}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldError>{errors.categoria}</FieldError>
								</FormField>

								<FormField
									className='min-w-48 flex-1'
									data-invalid={!!errors.prioridade}
								>
									<FieldLabel htmlFor='prioridade'>
										Prioridade
									</FieldLabel>
									<Select
										value={form.prioridade}
										disabled={mutation.isPending}
										onValueChange={(value) =>
											setField(
												'prioridade',
												value as Prioridade,
											)
										}
									>
										<SelectTrigger
											id='prioridade'
											className='w-full'
											aria-invalid={!!errors.prioridade}
										>
											<SelectValue placeholder='Selecione'>
												{(value: Prioridade | null) =>
													value
														? values.priority[value]
														: 'Selecione'
												}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{Object.entries(values.priority).map(
												([value, label]) => (
													<SelectItem
														key={value}
														value={value}
													>
														{label}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<FieldError>{errors.prioridade}</FieldError>
								</FormField>
							</div>

							{form.prioridade === 'URGENTE' && (
								<FormField
									data-invalid={
										!!errors.justificativa_prioridade
									}
								>
									<FieldLabel htmlFor='justificativa_prioridade'>
										Justificativa da Prioridade
									</FieldLabel>
									<Textarea
										id='justificativa_prioridade'
										value={form.justificativa_prioridade}
										aria-invalid={
											!!errors.justificativa_prioridade
										}
										disabled={mutation.isPending}
										onChange={(event) =>
											setField(
												'justificativa_prioridade',
												event.target.value,
											)
										}
									/>
									<FieldError>
										{errors.justificativa_prioridade}
									</FieldError>
								</FormField>
							)}

							<FormField data-invalid={!!errors.descricao}>
								<FieldLabel htmlFor='descricao'>
									Descrição
								</FieldLabel>
								<Textarea
									id='descricao'
									value={form.descricao}
									aria-invalid={!!errors.descricao}
									disabled={mutation.isPending}
									onChange={(event) =>
										setField('descricao', event.target.value)
									}
								/>
								<FieldError>{errors.descricao}</FieldError>
							</FormField>
						</FieldGroup>
					</CardContent>

					<Separator />

					<CardFooter className='flex items-center justify-between gap-4'>
						{mutation.isError && (
							<span className='text-sm text-destructive'>
								Erro: {getErrorMessage(mutation.error)}
							</span>
						)}

						<div className='flex flex-1 justify-end gap-2'>
							<Navigator to='/solicitacoes' variant='outline'>
								Cancelar
							</Navigator>
							<Button type='submit' disabled={mutation.isPending}>
								{mutation.isPending && (
									<Loader2 className='animate-spin' />
								)}
								Registrar Solicitação
							</Button>
						</div>
					</CardFooter>
				</form>
			</Card>
		</Content>
	);
}
