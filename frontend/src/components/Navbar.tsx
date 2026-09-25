import type { FC } from 'react';

import { House, ClipboardPlus, Plus } from 'lucide-react';

import { Navigator } from './Navigator';

export const Navbar: FC = () => (
	<div className='flex flex-row justify-between px-8 py-3 border-b'>
		<div className='flex flex-row'>
			<Navigator to='/' size={'lg'} variant={'secondary'}>
				<House />
				Home
			</Navigator>
			<Navigator to='/solicitacoes' size={'lg'} variant={'secondary'}>
				<ClipboardPlus />
				Solicitações
			</Navigator>
		</div>
		<Navigator to='/solicitacoes/registrar' size={'lg'} variant={'default'}>
			<Plus />
			Nova Solicitação
		</Navigator>
	</div>
);
