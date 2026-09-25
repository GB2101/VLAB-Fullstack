import type { FC, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
	icon: LucideIcon;
	iconClassName?: string;
	title: string;
	description?: string;
	action?: ReactNode;
}

export const StateMessage: FC<Props> = ({
	icon: Icon,
	iconClassName,
	title,
	description,
	action,
}) => (
	<div className='flex w-full flex-col items-center justify-center gap-2 py-16 text-center'>
		<Icon className={`size-8 text-muted-foreground ${iconClassName ?? ''}`} />
		<p className='font-medium'>{title}</p>
		{description && (
			<p className='max-w-sm text-sm text-muted-foreground'>
				{description}
			</p>
		)}
		{action && <div className='mt-2'>{action}</div>}
	</div>
);
