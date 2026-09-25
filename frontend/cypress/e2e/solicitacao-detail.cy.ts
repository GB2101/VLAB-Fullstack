describe('Solicitation detail', () => {
	it('shows the solicitation details and the allowed transitions', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/42', {
			fixture: 'solicitation.json',
		}).as('detail');

		cy.visit('/solicitacoes/42');
		cy.wait('@detail');

		cy.contains('EXA-260115-XYZ789');
		cy.contains('Joana Lima');
		cy.contains('Exame de imagem para avaliacao.');

		// AGENDADA allows CONCLUIDA and CANCELADA
		cy.contains('button', 'Concluida');
		cy.contains('button', 'Cancelada');
	});

	it('transitions the status and reflects the change', () => {
		let requestCount = 0;

		cy.fixture('solicitation.json').then((solicitation) => {
			cy.intercept('GET', '**/api/v1/solicitacoes/42', (req) => {
				requestCount += 1;
				req.reply({
					body: {
						data: {
							...solicitation.data,
							status: requestCount === 1 ? 'AGENDADA' : 'CONCLUIDA',
						},
					},
				});
			}).as('detail');
		});

		cy.intercept('PATCH', '**/api/v1/solicitacoes/42/status', {
			statusCode: 204,
		}).as('transition');

		cy.visit('/solicitacoes/42');
		cy.wait('@detail');

		cy.contains('button', 'Concluida').click();

		cy.wait('@transition')
			.its('request.body')
			.should('deep.equal', { status: 'CONCLUIDA' });

		cy.wait('@detail');

		cy.contains('Status atual').parent().contains('Concluida');
		cy.contains('button', 'Concluida').should('not.exist');
		cy.contains('button', 'Cancelada').should('not.exist');
	});

	it('shows the backend message when a transition is rejected', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/42', {
			fixture: 'solicitation.json',
		});
		cy.intercept('PATCH', '**/api/v1/solicitacoes/42/status', {
			statusCode: 400,
			body: { message: 'A transição do Status AGENDADA para AGENDADA não é permitida.' },
		});

		cy.visit('/solicitacoes/42');
		cy.contains('button', 'Concluida').click();

		cy.contains('A transição do Status AGENDADA para AGENDADA não é permitida.');
	});

	it('shows the not-found message for a missing solicitation', () => {
		cy.intercept('GET', '**/api/v1/solicitacoes/999', {
			statusCode: 404,
			body: { message: 'O ID da solicitação não foi encontrado' },
		}).as('missing');

		cy.visit('/solicitacoes/999');
		cy.wait('@missing');

		cy.contains('O ID da solicitação não foi encontrado', {
			timeout: 15000,
		});
	});
});
