import type { FC, PropsWithChildren, HTMLAttributes } from 'react';

interface Props extends PropsWithChildren {
	className?: HTMLAttributes<HTMLDivElement>['className'];
}

export const Content: FC<Props> = (props) => (
	<div
		className={`flex flex-col items-center w-[60vw] min-w-240 my-8 mx-2 px-8 py-6 border-x ${props.className}`}
	>
		{props.children}
	</div>
);
