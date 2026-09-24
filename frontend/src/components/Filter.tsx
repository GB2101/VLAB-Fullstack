import type { FC, PropsWithChildren } from 'react';
import { Fragment, useEffect, useState } from 'react';

import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from '@/components/ui/combobox';

import { Label } from './ui/label';

interface ItemsType {
	id: string;
	label: string;
}

interface Props extends PropsWithChildren {
	id: string;
	items: Record<string, string>;
	onValueChange: (values: string[]) => void;
}

export const Filter: FC<Props> = (props) => {
	const anchor = useComboboxAnchor();

	const [state, setState] = useState<ItemsType[]>([]);

	const items = Object.keys(props.items).map<ItemsType>((key) => ({
		id: key,
		label: props.items[key],
	}));

	return (
		<div className='flex flex-col gap-2'>
			<Label htmlFor={props.id}>{props.id}</Label>
			<Combobox
				id={props.id}
				multiple
				autoHighlight
				items={items}
				onValueChange={(values: ItemsType[]) => {
					console.log(values);
					props.onValueChange(values.map((item) => item.id));
				}}
			>
				<ComboboxChips
					ref={anchor}
					className='w-3xs max-w-3xs h-9 overflow-y-auto'
				>
					<ComboboxValue>
						{(values) => (
							<Fragment>
								{values.map((value: ItemsType) => (
									<ComboboxChip key={value.id}>
										{value.label}
									</ComboboxChip>
								))}
								<ComboboxChipsInput />
							</Fragment>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxContent anchor={anchor}>
					<ComboboxEmpty>Sem itens para selecionar</ComboboxEmpty>
					<ComboboxList>
						{(item: ItemsType) => (
							<ComboboxItem key={item.id} value={item}>
								{item.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</div>
	);
};
