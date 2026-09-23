import { describeWhenMsw, isSimulithBackend } from '../support/backend';
import {
  getTransactionHistoryE2EData,
  waitForTransactionHistoryReady,
  runTransactionHistorySearch,
  fillTransactionHistorySearch,
  clickHistorySearch,
  clickHistoryClear,
} from '../support/transactionHistory';

describe('Transaction History Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    waitForTransactionHistoryReady();
  });

  it('consulta transacciones exitosamente', () => {
    getTransactionHistoryE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('GET', '**/history53rv1c3/**').as('historySearch');
      }
      runTransactionHistorySearch(data);
      if (isSimulithBackend()) {
        cy.wait('@historySearch', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
      }
      cy.get('#tx-page-size').should('be.visible').and('have.value', '20');
      cy.contains(/Página 1 de \d+/).should('exist');
      cy.get('button[aria-label="Página siguiente"]').should('be.visible');
    });
  });

  it('muestra controles de paginación y permite cambiar cantidad por página', () => {
    getTransactionHistoryE2EData().then((data) => {
      runTransactionHistorySearch(data);
      cy.get('#tx-page-size').select('50');
      cy.get('#tx-page-size').should('have.value', '50');
    });
  });

  it('permite navegar entre páginas con Anterior y Siguiente', () => {
    getTransactionHistoryE2EData().then((data) => {
      runTransactionHistorySearch(data);
      cy.get('#tx-page-size').select('10');
      cy.contains(/Página 1 de \d+/).should('exist');
      cy.get('button[aria-label="Página siguiente"]').click();
      cy.contains(/Página 2 de \d+/).should('exist');
      cy.get('button[aria-label="Página anterior"]').click();
      cy.contains(/Página 1 de \d+/).should('exist');
    });
  });

  it('permite buscar sin documento (todo el tenant) cuando el admin tiene tenant', () => {
    getTransactionHistoryE2EData().then((data) => {
      fillTransactionHistorySearch(data, { omitDocument: true });
      clickHistorySearch();
      cy.contains(data.expectedOfficeLabel, { timeout: 15000 }).should('exist');
      cy.contains('th', 'Documento').should('exist');
    });
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede limpiar el formulario', () => {
    getTransactionHistoryE2EData().then((data) => {
      cy.get('[data-testid="th-doc"]').type(data.document);
      clickHistoryClear();
      cy.get('[data-testid="th-doc"]').should('have.value', '');
    });
  });

  it('muestra tabs Todo, Acumulado y Redimido', () => {
    getTransactionHistoryE2EData().then((data) => {
      runTransactionHistorySearch(data);
      cy.get('[data-testid="tx-tabs"]').should('be.visible');
      cy.get('[data-testid="tx-tab-all"]').should('contain', 'Todo');
      cy.get('[data-testid="tx-tab-accumulation"]').should('contain', 'Acumulado');
      cy.get('[data-testid="tx-tab-redemption"]').should('contain', 'Redimido');
    });
  });

  it('filtra transacciones por tab Acumulado', () => {
    getTransactionHistoryE2EData().then((data) => {
      runTransactionHistorySearch(data);
      cy.get('[data-testid="tx-tab-accumulation"]').click();
      cy.get('tbody tr').should('have.length.greaterThan', 0);
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row).find('.points-positive').should('exist');
      });
    });
  });

  it('filtra transacciones por tab Redimido', () => {
    getTransactionHistoryE2EData().then((data) => {
      runTransactionHistorySearch(data);
      cy.get('[data-testid="tx-tab-redemption"]').click();
      cy.get('tbody tr').should('exist');
      cy.get('.points-negative, .text-warning').should('exist');
    });
  });

  describeWhenMsw('MSW — datos sintéticos', () => {
    it('muestra badge Vencido en transacciones expiradas', () => {
      getTransactionHistoryE2EData().then((data) => {
        runTransactionHistorySearch(data);
        cy.get('[data-testid="tx-tab-all"]').click();
        cy.get('[data-testid="tx-badge-vencido"]', { timeout: 5000 }).should('exist');
      });
    });
  });
});
