import { isSimulithBackend } from './backend';

export interface AccumulationE2EData {
  document: string;
  sampleValue: string;
}

const MSW_ACCUMULATION: AccumulationE2EData = {
  document: '12345678',
  sampleValue: '100',
};

export function getAccumulationE2EData(): Cypress.Chainable<AccumulationE2EData> {
  if (isSimulithBackend()) {
    return cy.fixture('simulith-e2e-data.json').then((fixture) => ({
      document: fixture.accumulationDocument ?? fixture.customerDocument ?? '10000003',
      sampleValue: fixture.accumulationValue ?? '100',
    }));
  }
  return cy.wrap(MSW_ACCUMULATION);
}

/** Espera oficina del tenant (OfficeContext) antes de acumular — el submit queda disabled sin oficina. */
export function waitForAccumulationReady(): void {
  cy.get('[data-testid="acc-document"]', { timeout: 20000 }).should('be.visible');
  if (isSimulithBackend()) {
    cy.get('[data-testid="admin-office-select"]', { timeout: 30000 }).should('be.visible');
  }
  cy.contains('button', 'Acumular', { timeout: 30000 }).should('not.be.disabled');
}

export function fillAccumulationForm(document: string, value: string): void {
  cy.get('[data-testid="acc-document"]').clear().type(document);
  cy.get('[data-testid="acc-value"]').clear().type(value);
}

export function clickAccumulate(): void {
  cy.contains('button', 'Acumular').click();
}

export function clickAccumulationClear(): void {
  cy.contains('Acumulación')
    .parent()
    .within(() => {
      cy.contains('button', 'Limpiar').click();
    });
}

export function clickAccumulateInFormSection(): void {
  cy.contains('Acumulación')
    .parent()
    .within(() => {
      cy.contains('button', 'Acumular').click();
    });
}
