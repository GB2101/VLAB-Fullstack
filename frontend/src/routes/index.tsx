import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CircleAlert, Loader2 } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Content } from '@/components/Content';
import { Navigator } from '@/components/Navigator';
import { StateMessage } from '@/components/StateMessage';

import values from '@/assets/values.json';
import { useAxios } from '@/hooks/useAxios';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { SolicitationSummary } from '@/types';

export const Route = createFileRoute('/')({
	component: RouteComponent,
});

function RouteComponent() {
	const axios = useAxios();

	const { data, error, isError, isPending } = useQuery({
		queryKey: ['solicitations-summary'],
		queryFn: async () => {
			const { data } = await axios.get<SolicitationSummary>(
				'/solicitacoes/summary',
			);
			return data;
		},
	});

	if (isPending) {
		return (
			<Content>
				<StateMessage
					icon={Loader2}
					iconClassName='animate-spin'
					title='Carregando resumo...'
				/>
			</Content>
		);
	}

	if (isError && !data) {
		return (
			<Content>
				<StateMessage
					icon={CircleAlert}
					title='Não foi possível carregar o resumo'
					description={getErrorMessage(error)}
				/>
			</Content>
		);
	}

	return (
		<Content>
			<div className='flex w-full flex-col gap-8'>
				<div className='flex flex-wrap items-center justify-between gap-4'>
					<div className='flex flex-col gap-1'>
						<span className='text-lg font-medium'>
							Painel de Solicitações
						</span>
						<span className='text-sm text-muted-foreground'>
							Resumo geral das solicitações de atendimento.
						</span>
					</div>

					<Navigator to='/solicitacoes'>
						Ver Solicitações
						<ArrowRight />
					</Navigator>
				</div>

				<Card className='w-fit min-w-56'>
					<CardHeader>
						<CardDescription>Total de Solicitações</CardDescription>
						<CardTitle className='text-4xl'>{data.total}</CardTitle>
					</CardHeader>
				</Card>

				<div className='flex flex-col gap-3'>
					<span className='text-sm font-medium'>Por Status</span>
					<div className='flex flex-wrap gap-4'>
						{Object.entries(values.status).map(([status, label]) => (
							<Card key={status} className='min-w-36 flex-1'>
								<CardHeader>
									<CardDescription>{label}</CardDescription>
									<CardTitle className='text-2xl'>
										{
											data.status[
												status as keyof typeof data.status
											]
										}
									</CardTitle>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>

				<div className='flex flex-col gap-3'>
					<span className='text-sm font-medium'>Por Prioridade</span>
					<div className='flex flex-wrap gap-4'>
						{Object.entries(values.priority).map(([priority, label]) => (
							<Card key={priority} className='min-w-36 flex-1'>
								<CardHeader>
									<CardDescription>{label}</CardDescription>
									<CardTitle className='text-2xl'>
										{
											data.prioridade[
												priority as keyof typeof data.prioridade
											]
										}
									</CardTitle>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>
			</div>
		</Content>
	);
}
