import { isSimulithBackend } from './backend';

export interface RedemptionE2EData {
  document: string;
  points: string;
  /** Solo MSW — OTP fijo en mocks. */
  otp?: string;
}

const MSW_REDEMPTION: RedemptionE2EData = {
  document: '12345678',
  points: '200',
  otp: '123456',
};

export function getRedemptionE2EData(): Cypress.Chainable<RedemptionE2EData> {
  if (isSimulithBackend()) {
    return cy.fixture('simulith-e2e-data.json').then((fixture) => ({
      document: fixture.redemptionDocument ?? fixture.customerDocument ?? '10000003',
      points: fixture.redemptionPoints ?? '200',
    }));
  }
  return cy.wrap(MSW_REDEMPTION);
}

/** Espera oficina del tenant — el submit queda disabled sin oficina. */
export function waitForRedemptionReady(): void {
  cy.get('[data-testid="red-document"]', { timeout: 20000 }).should('be.visible');
  if (isSimulithBackend()) {
    cy.get('[data-testid="admin-office-select"]', { timeout: 30000 }).should('be.visible');
  }
  cy.contains('button', 'Redimir', { timeout: 30000 }).should('not.be.disabled');
}

export function fillRedemptionForm(document: string, points: string): void {
  cy.get('[data-testid="red-document"]').clear().type(document);
  cy.get('[data-testid="red-points"]').clear().type(points);
}

export function clickRedeem(): void {
  cy.contains('button', 'Redimir').click();
}

export function clickRedeemInFormSection(): void {
  cy.contains('Redención')
    .parent()
    .within(() => {
      cy.contains('button', 'Redimir').click();
    });
}

/** Lee el OTP generado en DynamoDB (Simulith) tras POST /otp. */
export function getSimulithOtpCode(
  documentNumber: string,
  identificationTypeId = 1,
): Cypress.Chainable<string> {
  return cy.task<string>('getSimulithOtp', { documentNumber, identificationTypeId });
}
