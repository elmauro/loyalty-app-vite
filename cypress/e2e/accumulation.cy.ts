describe('Accumulation Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('envía correctamente y muestra mensaje de éxito', () => {
    cy.get('[data-testid="acc-document"]').type('12345678');
    cy.get('[data-testid="acc-value"]').type('100');
    cy.contains('Acumular').click();
    cy.contains('Puntos acumulados', { timeout: 10000 }).should('exist');
  });

  it('muestra error si los campos están vacíos', () => {
    cy.contains('Acumulación')
      .parent()
      .within(() => {
        cy.contains('Acumular').click();
      });
    cy.contains('Por favor completa todos los campos').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede limpiar el formulario', () => {
    cy.get('[data-testid="acc-document"]').type('12345678');
    cy.get('[data-testid="acc-value"]').type('100');
    cy.contains('Acumulación')
      .parent()
      .within(() => {
        cy.contains('Limpiar').click();
      });
    cy.get('[data-testid="acc-document"]').should('have.value', '');
    cy.get('[data-testid="acc-value"]').should('have.value', '');
  });
});
