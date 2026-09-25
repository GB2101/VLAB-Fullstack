describe('Register a solicitation', () => {
	it('shows client-side validation errors on an empty submission', () => {
		cy.visit('/solicitacoes/registrar');

		cy.contains('button', 'Registrar Solicitação').click();

		cy.contains('Informe o nome do solicitante.');
		cy.contains('Selecione uma categoria.');
		cy.contains('Selecione uma prioridade.');
		cy.contains('Descreva a solicitação.');
	});

	it('requires a justification only when priority is URGENTE', () => {
		cy.visit('/solicitacoes/registrar');

		cy.selectOption('prioridade', 'Urgente');
		cy.contains('button', 'Registrar Solicitação').click();

		cy.contains('Justifique a prioridade urgente.');
	});

	it('creates a solicitation and redirects to its detail page', () => {
		cy.intercept('POST', '**/api/v1/solicitacoes', {
			statusCode: 201,
			fixture: 'solicitation-created.json',
		}).as('create');
		cy.intercept('GET', '**/api/v1/solicitacoes/99', {
			fixture: 'solicitation-created.json',
		}).as('detail');

		cy.visit('/solicitacoes/registrar');

		cy.get('#nome_solicitante').type('Maria da Silva');
		cy.selectOption('categoria', 'Exame');
		cy.selectOption('prioridade', 'Urgente');
		cy.get('#justificativa_prioridade').type(
			'Paciente com dor aguda, necessita atendimento prioritario.',
		);
		cy.get('#descricao').type(
			'Solicitacao de exame de urgencia para avaliacao medica.',
		);

		cy.contains('button', 'Registrar Solicitação').click();

		cy.wait('@create')
			.its('request.body')
			.should('deep.equal', {
				nome_solicitante: 'Maria da Silva',
				categoria: 'EXAME',
				prioridade: 'URGENTE',
				justificativa_prioridade:
					'Paciente com dor aguda, necessita atendimento prioritario.',
				descricao: 'Solicitacao de exame de urgencia para avaliacao medica.',
			});

		cy.wait('@detail');
		cy.location('pathname').should('eq', '/solicitacoes/99');
		cy.contains('EXA-260924-NEW001');
	});

	it('shows the backend validation errors when the request fails', () => {
		cy.intercept('POST', '**/api/v1/solicitacoes', {
			statusCode: 422,
			body: {
				message: 'The nome solicitante field is required.',
				errors: {
					nome_solicitante: ['O campo nome do solicitante é obrigatório.'],
				},
			},
		}).as('create');

		cy.visit('/solicitacoes/registrar');

		cy.get('#nome_solicitante').type('Maria da Silva');
		cy.selectOption('categoria', 'Exame');
		cy.selectOption('prioridade', 'Baixa');
		cy.get('#descricao').type('Descricao valida para o teste.');

		cy.contains('button', 'Registrar Solicitação').click();
		cy.wait('@create');

		cy.contains('O campo nome do solicitante é obrigatório.');
	});

	it('cancels back to the solicitations list', () => {
		cy.visit('/solicitacoes/registrar');
		cy.contains('a', 'Cancelar').click();

		cy.location('pathname').should('eq', '/solicitacoes');
	});
});
