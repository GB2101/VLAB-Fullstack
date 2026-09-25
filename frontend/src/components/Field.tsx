import type { FC, PropsWithChildren } from 'react';

import { Label } from '@/components/ui/label';

interface Props extends PropsWithChildren {
	label: string;
}

export const Field: FC<Props> = ({ label, children }) => (
	<div className='flex flex-col gap-1'>
		<Label>{label}</Label>
		<div className='text-sm'>{children}</div>
	</div>
);
