import type { FC } from 'react';

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

import type { PageLink } from '@/types';
import { useNavigate } from '@tanstack/react-router';

interface Props {
	links: PageLink[];
}

export const Paginator: FC<Props> = (props) => {
	const navigate = useNavigate();
	const handleClick = (link: PageLink) => {
		return () =>
			navigate({
				to: '.',
				search: (prev) => ({
					...prev,
					page: link.page,
				}),
			});
	};

	const [previous, ...pages] = props.links;
	const next = pages.pop()!;

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						text=''
						hidden={previous.page === null}
						onClick={handleClick(previous)}
					/>
				</PaginationItem>

				{pages.map((link) => {
					if (link.label === '...') {
						return (
							<PaginationItem key={link.label}>
								<PaginationEllipsis />
							</PaginationItem>
						);
					}

					return (
						<PaginationItem key={link.page}>
							<PaginationLink
								isActive={link.active}
								onClick={handleClick(link)}
							>
								{link.label}
							</PaginationLink>
						</PaginationItem>
					);
				})}

				<PaginationItem>
					<PaginationNext
						text=''
						hidden={next.page === null}
						onClick={handleClick(next)}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
};
