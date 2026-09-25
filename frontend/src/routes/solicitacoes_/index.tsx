import { Fragment, useState } from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import {
	Funnel,
	FunnelX,
	ArrowRight,
	Loader2,
	CircleAlert,
	Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { Content } from '@/components/Content';
import { Filter } from '@/components/Filter';
import { Navigator } from '@/components/Navigator';
import { StateMessage } from '@/components/StateMessage';

import values from '@/assets/values.json';
import { parseDate } from '@/utils/parseDate';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useAxios } from '@/hooks/useAxios';
import { Paginator } from '@/components/Paginator';
import type { SearchResults, Solicitation } from '@/types';

type Categories = keyof typeof values.category;
type Priorities = keyof typeof values.priority;
type Status = keyof typeof values.status;

type RawParams = Record<string, unknown>;
type SearchParams = {
	page?: number;
	pageSize?: number;
	categoria?: Categories[];
	prioridade?: Priorities[];
	status?: Status[];
};

const parseList = <T extends string>(
	value: unknown,
	allowed: Record<string, string>,
): T[] | undefined => {
	if (!value) return undefined;

	const list = (Array.isArray(value) ? value : String(value).split(','))
		.map(String)
		.filter((item): item is T => item in allowed);

	return list.length ? list : undefined;
};

const toParam = <T,>(list: T[]) => (list.length ? list : undefined);

export const Route = createFileRoute('/solicitacoes_/')({
	component: RouteComponent,
	validateSearch: (search: RawParams): SearchParams => ({
		page: Number(search.page) || undefined,
		pageSize: Number(search.pageSize) || undefined,
		categoria: parseList<Categories>(search.categoria, values.category),
		prioridade: parseList<Priorities>(search.prioridade, values.priority),
		status: parseList<Status>(search.status, values.status),
	}),
});

function RouteComponent() {
	const params = Route.useSearch();
	const navigate = Route.useNavigate();

	const [status, setStatus] = useState<Status[]>(params.status ?? []);
	const [categories, setCategories] = useState<Categories[]>(
		params.categoria ?? [],
	);
	const [priorities, setPriorities] = useState<Priorities[]>(
		params.prioridade ?? [],
	);

	const applyFilters = () => {
		navigate({
			to: '.',
			search: (prev) => ({
				...prev,
				page: undefined,
				categoria: toParam(categories),
				prioridade: toParam(priorities),
				status: toParam(status),
			}),
		});
	};

	const hasFilters =
		!!params.status ||
		!!params.categoria ||
		!!params.prioridade ||
		!!status.length ||
		!!categories.length ||
		!!priorities.length;
	const clearFilters = () => {
		setStatus([]);
		setCategories([]);
		setPriorities([]);

		navigate({
			to: '.',
			search: {},
		});
	};

	const axios = useAxios();
	const { data, error, isError, isPending, refetch, isRefetching } = useQuery(
		{
			queryKey: ['solicitations', params],
			queryFn: async () => {
				const { data } = await axios.get<SearchResults<Solicitation>>(
					'/solicitacoes',
					{ params },
				);
				return data;
			},
		},
	);

	if (isPending) {
		return (
			<Content>
				<StateMessage
					icon={Loader2}
					iconClassName='animate-spin'
					title='Carregando solicitações...'
				/>
			</Content>
		);
	}

	if (isError && !data) {
		return (
			<Content>
				<StateMessage
					icon={CircleAlert}
					title='Não foi possível carregar as solicitações'
					description={getErrorMessage(error)}
					action={
						<Button
							variant='outline'
							disabled={isRefetching}
							onClick={() => refetch()}
						>
							Tentar novamente
						</Button>
					}
				/>
			</Content>
		);
	}

	return (
		<Fragment>
			<Content>
				<div className='w-full flex justify-between items-end flex-wrap border-b pb-2'>
					<div className='flex gap-4 w-fit'>
						<Filter
							id='Categoria'
							items={values.category}
							defaultValue={categories}
							onValueChange={(values) => {
								setCategories(values as Categories[]);
							}}
						/>
						<Filter
							id='Prioridade'
							items={values.priority}
							defaultValue={priorities}
							onValueChange={(values) => {
								setPriorities(values as Priorities[]);
							}}
						/>
						<Filter
							id='Status'
							items={values.status}
							defaultValue={status}
							onValueChange={(values) => {
								setStatus(values as Status[]);
							}}
						/>
					</div>

					<ButtonGroup>
						<Button onClick={applyFilters}>
							<Funnel />
							Aplicar Filtros
						</Button>
						<Button disabled={!hasFilters} onClick={clearFilters}>
							<FunnelX />
						</Button>
					</ButtonGroup>
				</div>

				{data.data.length === 0 ? (
					<StateMessage
						icon={Inbox}
						title='Nenhuma solicitação encontrada'
						description={
							hasFilters
								? 'Nenhuma solicitação corresponde aos filtros aplicados.'
								: 'Ainda não há solicitações registradas.'
						}
						action={
							hasFilters ? (
								<Button variant='outline' onClick={clearFilters}>
									<FunnelX />
									Limpar Filtros
								</Button>
							) : (
								<Navigator to='/solicitacoes/registrar'>
									Nova Solicitação
								</Navigator>
							)
						}
					/>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Protocolo</TableHead>
								<TableHead>Solicitante</TableHead>
								<TableHead>Categoria</TableHead>
								<TableHead>Prioridade</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Última Atualização</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{data.data.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.protocolo}</TableCell>
									<TableCell>{item.nome_solicitante}</TableCell>
									<TableCell>
										{values.category[item.categoria]}
									</TableCell>
									<TableCell>
										{values.priority[item.prioridade]}
									</TableCell>
									<TableCell>
										{values.status[item.status]}
									</TableCell>
									<TableCell>
										{parseDate(item.data_atualizacao)}
									</TableCell>
									<TableCell>
										<Navigator
											to='/solicitacoes/$solicitacoes'
											params={{
												solicitacoes: String(item.id),
											}}
											size='icon'
											variant='default'
										>
											<ArrowRight />
										</Navigator>
									</TableCell>
								</TableRow>
							))}
						</TableBody>

						<TableFooter>
							<TableRow>
								<TableCell colSpan={7}>
									<Paginator links={data.meta.links} />
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				)}
			</Content>
			<Outlet />
		</Fragment>
	);
}
