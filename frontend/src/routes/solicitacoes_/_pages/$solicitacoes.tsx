import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Loader2 } from 'lucide-react';

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

import { Content } from '@/components/Content';
import { Field } from '@/components/Field';
import { StateMessage } from '@/components/StateMessage';

import values from '@/assets/values.json';
import { parseDate } from '@/utils/parseDate';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useAxios } from '@/hooks/useAxios';
import type { Resource, Solicitation } from '@/types';

type Status = keyof typeof values.status;

export const Route = createFileRoute('/solicitacoes_/_pages/$solicitacoes')({
	component: RouteComponent,
});

function RouteComponent() {
	const { solicitacoes: id } = Route.useParams();

	const axios = useAxios();
	const queryClient = useQueryClient();
	const queryKey = ['solicitation', id];

	const { data, error, isError, isPending } = useQuery({
		queryKey,
		queryFn: async () => {
			const { data } = await axios.get<Resource<Solicitation>>(
				`/solicitacoes/${id}`,
			);
			return data.data;
		},
	});

	const transition = useMutation({
		mutationFn: async (status: Status) => {
			await axios.patch(`/solicitacoes/${id}/status`, { status });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
			queryClient.invalidateQueries({ queryKey: ['solicitations'] });
		},
	});

	if (isPending) {
		return (
			<Content>
				<StateMessage
					icon={Loader2}
					iconClassName='animate-spin'
					title='Carregando solicitação...'
				/>
			</Content>
		);
	}

	if (isError && !data) {
		return (
			<Content>
				<StateMessage
					icon={CircleAlert}
					title='Não foi possível carregar a solicitação'
					description={getErrorMessage(error)}
				/>
			</Content>
		);
	}

	const nextStatuses = (values.transitions[data.status] ?? []) as Status[];

	return (
		<Content>
			<Card className='w-full'>
				<CardHeader>
					<CardTitle>{data.protocolo}</CardTitle>
					<CardDescription className='flex items-center gap-2'>
						Status atual
						<Badge variant='secondary'>{values.status[data.status]}</Badge>
					</CardDescription>

					{nextStatuses.length > 0 && (
						<CardAction>
							<ButtonGroup>
								{nextStatuses.map((status) => (
									<Button
										key={status}
										disabled={transition.isPending}
										onClick={() => transition.mutate(status)}
									>
										{values.status[status]}
									</Button>
								))}
							</ButtonGroup>
						</CardAction>
					)}
				</CardHeader>

				<Separator />

				<CardContent>
					<div className='flex flex-wrap gap-6'>
						<Field label='Solicitante'>{data.nome_solicitante}</Field>
						<Field label='Categoria'>
							<Badge variant='secondary'>
								{values.category[data.categoria]}
							</Badge>
						</Field>
						<Field label='Prioridade'>
							<Badge variant='secondary'>
								{values.priority[data.prioridade]}
							</Badge>
						</Field>
					</div>

					<Field label='Descrição'>{data.descricao}</Field>

					{data.justificativa_prioridade && (
						<Field label='Justificativa da Prioridade'>
							{data.justificativa_prioridade}
						</Field>
					)}

					<div className='flex flex-wrap gap-6'>
						<Field label='Criado em'>
							{parseDate(data.data_criacao)}
						</Field>
						<Field label='Atualizado em'>
							{parseDate(data.data_atualizacao)}
						</Field>
					</div>
				</CardContent>

				{transition.isError && (
					<CardFooter>
						<span>Erro: {getErrorMessage(transition.error)}</span>
					</CardFooter>
				)}
			</Card>
		</Content>
	);
}
