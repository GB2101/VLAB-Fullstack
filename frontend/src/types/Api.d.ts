export interface Resource<T> {
	data: T;
}

export interface PageLink {
	url: string;
	label: string;
	page: number;
	active: boolean;
}

export interface SearchResults<T> {
	data: T[];
	meta: {
		path: string;
		from: number;
		to: number;
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
		links: PageLink[];
	};
}
