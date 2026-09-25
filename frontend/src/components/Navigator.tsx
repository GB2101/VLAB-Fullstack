import type { FC } from 'react';

import { Link, type LinkComponentProps } from '@tanstack/react-router';
import { type VariantProps } from 'class-variance-authority';

import { buttonVariants } from './ui/button';

type Props = LinkComponentProps<'a'> & VariantProps<typeof buttonVariants>;

export const Navigator: FC<Props> = ({ children, size, variant, ...props }) => {
	const variants = buttonVariants({ size, variant });

	return (
		<Link to={props.to} className={variants} {...props}>
			{children}
		</Link>
	);
};
