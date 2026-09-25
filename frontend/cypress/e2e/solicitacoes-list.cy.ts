describe('Solicitations list', () => {
	it('renders the solicitations returned by the API', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations.json',
		}).as('list');

		cy.visit('/solicitacoes');
		cy.wait('@list');

		cy.contains('CON-260101-AAA111');
		cy.contains('Ana Pereira');
		cy.contains('EXA-260102-BBB222');
		cy.contains('VAC-260103-CCC333');
	});

	it('requests the selected filters when applying them', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations.json',
		}).as('list');

		cy.visit('/solicitacoes');
		cy.wait('@list');

		cy.contains('label', 'Status')
			.parent()
			.find('[data-slot="combobox-chip-input"]')
			.click();
		cy.contains('[data-slot="combobox-item"]', 'Cancelada').click();

		cy.contains('button', 'Aplicar Filtros').click();

		cy.wait('@list')
			.its('request.url')
			.should('include', 'status');
	});

	it('navigates to the detail page when clicking a row action', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations.json',
		});
		cy.intercept('GET', '**/api/v1/solicitacoes/1', {
			fixture: 'solicitation.json',
		});

		cy.visit('/solicitacoes');
		cy.contains('tr', 'CON-260101-AAA111').find('a').click();

		cy.location('pathname').should('eq', '/solicitacoes/1');
	});

	it('shows an empty state with no active filters', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations-empty.json',
		});

		cy.visit('/solicitacoes');

		cy.contains('Nenhuma solicitação encontrada');
		cy.contains('a', 'Nova Solicitação');
	});

	it('offers to clear the filters on an empty filtered result', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations-empty.json',
		});

		cy.visit('/solicitacoes?status=CONCLUIDA');

		cy.contains('Nenhuma solicitação encontrada');
		cy.contains('button', 'Limpar Filtros').click();

		cy.location('search').should('eq', '');
	});

	it('shows an error state and recovers via retry', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			statusCode: 500,
			body: { message: 'Erro interno do servidor' },
		}).as('failed');

		cy.visit('/solicitacoes');
		cy.wait('@failed');
		cy.contains('Não foi possível carregar as solicitações', {
			timeout: 15000,
		});

		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations.json',
		}).as('retry');

		cy.contains('button', 'Tentar novamente').click();
		cy.wait('@retry');

		cy.contains('CON-260101-AAA111');
	});
});
