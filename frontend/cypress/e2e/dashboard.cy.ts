describe('Dashboard', () => {
	it('shows the totals from the summary endpoint', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/summary', {
			fixture: 'summary.json',
		}).as('summary');

		cy.visit('/');
		cy.wait('@summary');

		cy.contains('Total de Solicitações').parent().contains('12');

		cy.contains('Recebida').parent().contains('3');
		cy.contains('Em Analise').parent().contains('2');
		cy.contains('Agendada').parent().contains('4');
		cy.contains('Concluida').parent().contains('2');
		cy.contains('Cancelada').parent().contains('1');

		cy.contains('Baixa').parent().contains('5');
		cy.contains('Media').parent().contains('3');
		cy.contains('Alta').parent().contains('3');
		cy.contains('Urgente').parent().contains('1');
	});

	it('links to the solicitations list', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/summary', {
			fixture: 'summary.json',
		});
		cy.intercept('GET', '**/api/v1/solicitacoes*', {
			fixture: 'solicitations.json',
		});

		cy.visit('/');
		cy.contains('a', 'Ver Solicitações').click();

		cy.location('pathname').should('eq', '/solicitacoes');
		cy.contains('CON-260101-AAA111');
	});

	it('shows an error state when the summary request fails', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/summary', {
			statusCode: 500,
			body: { message: 'Erro interno do servidor' },
		}).as('summary');

		cy.visit('/');
		cy.wait('@summary');

		cy.contains('Não foi possível carregar o resumo', { timeout: 15000 });
	});
});
