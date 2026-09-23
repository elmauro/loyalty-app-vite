import { isSimulithBackend } from '../support/backend';
import {
  getRedemptionE2EData,
  waitForRedemptionReady,
  fillRedemptionForm,
  clickRedeem,
  clickRedeemInFormSection,
  getSimulithOtpCode,
} from '../support/redemption';

describe('Redemption Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    if (isSimulithBackend()) {
      cy.fixture('simulith-e2e-data.json').then((fixture) => {
        const doc = fixture.redemptionDocument ?? fixture.customerDocument ?? '10000003';
        cy.task('deleteSimulithOtp', { documentNumber: doc });
      });
    }
    waitForRedemptionReady();
  });

  it('permite solicitar OTP y muestra el campo de código', () => {
    getRedemptionE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('POST', '**/otp53rv1c3').as('sendOtp');
      }
      fillRedemptionForm(data.document, data.points);
      clickRedeem();
      if (isSimulithBackend()) {
        cy.wait('@sendOtp', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
      }
      cy.get('[data-testid="otp-code"]', { timeout: 15000 }).should('be.visible');
      cy.contains('Código OTP enviado').should('exist');
    });
  });

  it('permite completar redención con OTP válido', () => {
    getRedemptionE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('POST', '**/otp53rv1c3').as('sendOtp');
        cy.intercept('POST', '**/expense').as('redeemExpense');
      }
      fillRedemptionForm(data.document, data.points);
      clickRedeem();
      if (isSimulithBackend()) {
        cy.wait('@sendOtp', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
        getSimulithOtpCode(data.document).then((otp) => {
          cy.get('[data-testid="otp-code"]', { timeout: 15000 }).should('be.visible').type(otp);
          cy.contains('Confirmar').click();
          cy.wait('@redeemExpense', { timeout: 30000 }).then((interception) => {
            const status = interception.response?.statusCode;
            if (status !== 200) {
              const body = JSON.stringify(interception.response?.body ?? {});
              throw new Error(
                `POST /expense devolvió ${status}. Body: ${body}. ` +
                  'Verifica transaction-api (expense) y puntos del cliente en RDS.'
              );
            }
          });
          cy.contains('Puntos redimidos', { timeout: 15000 }).should('exist');
        });
      } else {
        cy.get('[data-testid="otp-code"]', { timeout: 10000 })
          .should('be.visible')
          .type(data.otp ?? '123456');
        cy.contains('Confirmar').click();
        cy.contains('Puntos redimidos', { timeout: 10000 }).should('exist');
      }
    });
  });

  it('muestra error si los campos están vacíos', () => {
    clickRedeemInFormSection();
    cy.contains('Por favor completa todos los campos').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede cancelar la operación después de solicitar OTP', () => {
    getRedemptionE2EData().then((data) => {
      if (isSimulithBackend()) {
        cy.intercept('POST', '**/otp53rv1c3').as('sendOtp');
      }
      fillRedemptionForm(data.document, data.points);
      clickRedeem();
      if (isSimulithBackend()) {
        cy.wait('@sendOtp', { timeout: 30000 });
      }
      cy.get('[data-testid="otp-code"]', { timeout: 15000 }).should('be.visible');
      cy.contains('Cancelar').click();
      cy.get('[data-testid="red-document"]').should('be.visible');
    });
  });
});
