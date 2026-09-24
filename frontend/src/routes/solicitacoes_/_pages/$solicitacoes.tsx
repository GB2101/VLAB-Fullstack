import { Content } from '@/components/Content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/solicitacoes_/_pages/$solicitacoes')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Content>
			<div className='bg-red-400'>
				Hello "/solicitacoes/$solicitacoes"!
			</div>
		</Content>
	);
}
