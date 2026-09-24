import { Fragment, useState } from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import { Funnel, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

import values from '@/assets/values.json';
import { parseDate } from '@/utils/parseDate';
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
	status?: Status[];
	// status?: Status[];
	// categories?: Categories[];
	// priorities?: Priorities[];
};

export const Route = createFileRoute('/solicitacoes_/')({
	component: RouteComponent,
	validateSearch: (search: RawParams): SearchParams => {
		console.log(JSON.stringify(search));
		return {
			page: Number(search.page) || undefined,
			pageSize: Number(search.pageSize) || undefined,
			status: !search.status
				? undefined
				: (Array.isArray(search.status)
						? search.status
						: [search.status]
					).filter((item): item is Status => item in values.status),
			// categories: (search.categories?.split(',') || []) as Categories[],
			// priorities: (search.priorities?.split(',') || []) as Priorities[],}
		};
	},
});

function RouteComponent() {
	const params = Route.useSearch();

	const [status, setStatus] = useState<Status[]>([]);
	const [categories, setCategories] = useState<Categories[]>([]);
	const [priorities, setPriorities] = useState<Priorities[]>([]);

	const axios = useAxios();
	const { data, error, isError, isPending } = useQuery({
		queryKey: ['solicitations', params.page, params.pageSize],
		queryFn: async () => {
			const { data } = await axios.get<SearchResults<Solicitation>>(
				'/solicitacoes',
				// { params },
			);
			return data;
		},
	});

	if (isPending) {
		return <span>Loading...</span>;
	}

	if (isError && !data) {
		return <span>Error: {error.message}</span>;
	}

	return (
		<Fragment>
			<Content>
				<div className='w-full flex justify-between items-end flex-wrap border-b pb-2'>
					<div className='flex gap-4 w-fit'>
						<Filter
							id='Categoria'
							items={values.category}
							onValueChange={(values) => {
								setCategories(values as Categories[]);
							}}
						/>
						<Filter
							id='Prioridade'
							items={values.priority}
							onValueChange={(values) => {
								setPriorities(values as Priorities[]);
							}}
						/>
						<Filter
							id='Status'
							items={values.status}
							onValueChange={(values) => {
								setStatus(values as Status[]);
							}}
						/>
					</div>

					<Button>
						<Funnel />
						Aplicar Filtros
					</Button>
				</div>

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
							<TableRow
								key={item.id}
								onClick={() => alert('Clicked')}
								className='hover:cursor-pointer'
							>
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
									<Button>
										<ArrowRight />
									</Button>
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
			</Content>
			<Outlet />
		</Fragment>
	);
}
