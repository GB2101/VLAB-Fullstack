Cypress.Commands.add('selectOption', (triggerId: string, optionLabel: string) => {
	cy.get(`#${triggerId}`).click();
	cy.contains('[role="option"]', optionLabel).click({ force: true });
});

declare global {
	namespace Cypress {
		interface Chainable {
			/** Opens a Base UI Select by its trigger id and picks the option with the given label. */
			selectOption(triggerId: string, optionLabel: string): Chainable<void>;
		}
	}
}

export {};
