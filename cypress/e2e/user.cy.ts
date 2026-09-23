import { isSimulithBackend } from '../support/backend';
import {
  getUserE2EData,
  waitForUserDashboardReady,
  runUserHistorySearch,
  assertUserPointsCards,
} from '../support/userFlow';

describe('User flow (rol 2)', () => {
  beforeEach(() => {
    cy.loginAsUser();
    waitForUserDashboardReady();
  });

  it('accede correctamente al dashboard de usuario', () => {
    cy.url().should('include', '/user');
    cy.contains('Historial de Transacciones').should('exist');
  });

  it('muestra Puntos Disponibles y Puntos por Vencer', () => {
    getUserE2EData().then((data) => {
      assertUserPointsCards(data);
    });
  });

  it('consulta transacciones exitosamente', () => {
    getUserE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('GET', '**/history53rv1c3/**').as('userHistory');
      }
      runUserHistorySearch(data);
      if (isSimulithBackend()) {
        cy.wait('@userHistory', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
      }
    });
  });

  it('muestra tabs Todo, Acumulado y Redimido en historial', () => {
    getUserE2EData().then((data) => {
      runUserHistorySearch(data);
      cy.get('[data-testid="tx-tab-all"]').should('contain', 'Todo');
      cy.get('[data-testid="tx-tab-accumulation"]').should('contain', 'Acumulado');
      cy.get('[data-testid="tx-tab-redemption"]').should('contain', 'Redimido');
    });
  });

  it('puede cerrar sesión', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
    cy.get('button[type="submit"]').contains('Sign In').should('exist');
  });
});
