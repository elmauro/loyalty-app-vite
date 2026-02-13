describe('Redemption Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('permite solicitar OTP y muestra el campo de código', () => {
    cy.get('[data-testid="red-document"]').type('12345678');
    cy.get('[data-testid="red-points"]').type('200');
    cy.contains('Redimir').click();
    cy.get('[data-testid="otp-code"]', { timeout: 10000 }).should('be.visible');
    cy.contains('Código OTP enviado').should('exist');
  });

  it('permite completar redención con OTP válido', () => {
    cy.get('[data-testid="red-document"]').type('12345678');
    cy.get('[data-testid="red-points"]').type('200');
    cy.contains('Redimir').click();
    cy.get('[data-testid="otp-code"]', { timeout: 10000 }).should('be.visible').type('123456');
    cy.contains('Confirmar').click();
    cy.contains('Puntos redimidos', { timeout: 10000 }).should('exist');
  });

  it('muestra error si los campos están vacíos', () => {
    cy.contains('Redención')
      .parent()
      .within(() => {
        cy.contains('Redimir').click();
      });
    cy.contains('Por favor completa todos los campos').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede cancelar la operación después de solicitar OTP', () => {
    cy.get('[data-testid="red-document"]').type('12345678');
    cy.get('[data-testid="red-points"]').type('200');
    cy.contains('Redimir').click();
    cy.get('[data-testid="otp-code"]', { timeout: 10000 }).should('be.visible');
    cy.contains('Cancelar').click();
    cy.get('[data-testid="red-document"]').should('be.visible');
  });
});
