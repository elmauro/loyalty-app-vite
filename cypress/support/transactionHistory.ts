import { isSimulithBackend } from './backend';

export interface TransactionHistoryE2EData {
  document: string;
  startDate: string;
  endDate: string;
  /** Texto esperado en fila de resultados (nombre oficina o detalle). */
  expectedOfficeLabel: string;
}

const MSW_HISTORY: TransactionHistoryE2EData = {
  document: '3001234567',
  startDate: '2023-10-01',
  endDate: '2023-10-10',
  expectedOfficeLabel: 'Oficina Principal',
};

function dynamicYearRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function getTransactionHistoryE2EData(): Cypress.Chainable<TransactionHistoryE2EData> {
  if (isSimulithBackend()) {
    return cy.fixture('simulith-e2e-data.json').then((fixture) => {
      const range = dynamicYearRange();
      return {
        document: fixture.historyDocument ?? fixture.customerDocument ?? '10000003',
        startDate: fixture.historyStartDate ?? range.startDate,
        endDate: fixture.historyEndDate ?? range.endDate,
        expectedOfficeLabel: fixture.historyOfficeName ?? 'Comfama Centro',
      };
    });
  }
  return cy.wrap(MSW_HISTORY);
}

export function waitForTransactionHistoryReady(): void {
  cy.get('[data-testid="th-doc"]', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="th-startDate"]', { timeout: 20000 }).should('be.visible');
}

export function fillTransactionHistorySearch(
  data: Pick<TransactionHistoryE2EData, 'document' | 'startDate' | 'endDate'>,
  options?: { omitDocument?: boolean },
): void {
  if (!options?.omitDocument) {
    cy.get('[data-testid="th-doc"]').clear().type(data.document);
  }
  cy.get('[data-testid="th-startDate"]').clear().type(data.startDate);
  cy.get('[data-testid="th-endDate"]').clear().type(data.endDate);
}

export function clickHistorySearch(): void {
  cy.contains('button', 'Buscar').click();
}

export function runTransactionHistorySearch(
  data: TransactionHistoryE2EData,
  options?: { omitDocument?: boolean },
): void {
  fillTransactionHistorySearch(data, options);
  clickHistorySearch();
  cy.contains(data.expectedOfficeLabel, { timeout: 15000 }).should('exist');
}

export function clickHistoryClear(): void {
  cy.contains('Historial de Transacciones')
    .parent()
    .within(() => {
      cy.contains('button', 'Limpiar').click();
    });
}
