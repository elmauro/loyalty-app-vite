import { isSimulithBackend } from '../support/backend';
import {
  getAccumulationE2EData,
  waitForAccumulationReady,
  fillAccumulationForm,
  clickAccumulate,
  clickAccumulationClear,
  clickAccumulateInFormSection,
} from '../support/accumulation';

describe('Accumulation Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    waitForAccumulationReady();
  });

  it('envía correctamente y muestra mensaje de éxito', () => {
    getAccumulationE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('POST', '**/income').as('accumulateIncome');
      }
      fillAccumulationForm(data.document, data.sampleValue);
      clickAccumulate();
      if (isSimulithBackend()) {
        cy.wait('@accumulateIncome', { timeout: 30000 }).then((interception) => {
          const status = interception.response?.statusCode;
          if (status !== 200) {
            const body = JSON.stringify(interception.response?.body ?? {});
            throw new Error(
              `POST /income devolvió ${status}. Body: ${body}. ` +
                'Verifica transaction-api desplegado y PostgreSQL (migrate-db-simulith.sh).'
            );
          }
        });
      }
      cy.contains('Puntos acumulados', { timeout: 15000 }).should('exist');
    });
  });

  it('muestra error si los campos están vacíos', () => {
    clickAccumulateInFormSection();
    cy.contains('Por favor completa todos los campos').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede limpiar el formulario', () => {
    getAccumulationE2EData().then((data) => {
      fillAccumulationForm(data.document, data.sampleValue);
      clickAccumulationClear();
      cy.get('[data-testid="acc-document"]').should('have.value', '');
      cy.get('[data-testid="acc-value"]').should('have.value', '');
    });
  });
});
