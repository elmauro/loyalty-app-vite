import { isSimulithBackend } from './backend';

export interface UserE2EData {
  startDate: string;
  endDate: string;
  expectedOfficeLabel: string;
  expectedAvailablePointsLabel?: string;
  expectedExpiringPointsLabel?: string;
}

const MSW_USER: UserE2EData = {
  startDate: '2023-10-01',
  endDate: '2023-10-10',
  expectedOfficeLabel: 'Oficina Principal',
  expectedAvailablePointsLabel: '1.500',
  expectedExpiringPointsLabel: '400',
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

export function getUserE2EData(): Cypress.Chainable<UserE2EData> {
  if (isSimulithBackend()) {
    return cy.fixture('simulith-e2e-data.json').then((fixture) => {
      const range = dynamicYearRange();
      return {
        startDate: fixture.userHistoryStartDate ?? range.startDate,
        endDate: fixture.userHistoryEndDate ?? range.endDate,
        expectedOfficeLabel: fixture.historyOfficeName ?? 'Comfama Centro',
      };
    });
  }
  return cy.wrap(MSW_USER);
}

export function waitForUserDashboardReady(): void {
  cy.url({ timeout: 30000 }).should('include', '/user');
  cy.contains('Historial de Transacciones', { timeout: 15000 }).should('be.visible');
}

export function fillUserHistorySearch(data: Pick<UserE2EData, 'startDate' | 'endDate'>): void {
  cy.get('[data-testid="user-startDate"]').clear().type(data.startDate);
  cy.get('[data-testid="user-endDate"]').clear().type(data.endDate);
}

export function runUserHistorySearch(data: UserE2EData): void {
  fillUserHistorySearch(data);
  cy.contains('button', 'Buscar').click();
  cy.contains(data.expectedOfficeLabel, { timeout: 15000 }).should('exist');
}

export function assertUserPointsCards(data: UserE2EData): void {
  cy.get('[data-testid="user-card-puntos-disponibles"]', { timeout: 20000 }).should('be.visible');
  cy.get('[data-testid="user-card-puntos-por-vencer"]', { timeout: 20000 }).should('be.visible');

  if (isSimulithBackend()) {
    cy.get('[data-testid="user-card-puntos-disponibles"] .text-3xl', { timeout: 20000 })
      .invoke('text')
      .should((text) => {
        expect(text.trim()).to.match(/[\d.,]+/);
        expect(text.trim()).not.to.eq('-');
      });
    cy.get('[data-testid="user-card-puntos-por-vencer"] .text-3xl', { timeout: 20000 })
      .invoke('text')
      .should('match', /[\d.,]+/);
    cy.get('[data-testid="user-card-puntos-por-vencer"]').contains(/Vencen el/);
    return;
  }

  cy.get('[data-testid="user-card-puntos-disponibles"]').contains(data.expectedAvailablePointsLabel!);
  cy.get('[data-testid="user-card-puntos-por-vencer"]').contains(data.expectedExpiringPointsLabel!);
  cy.get('[data-testid="user-card-puntos-por-vencer"]').contains(/Vencen el/);
}
