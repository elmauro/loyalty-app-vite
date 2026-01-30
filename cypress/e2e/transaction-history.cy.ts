describe('Transaction History Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('consulta transacciones exitosamente', () => {
    cy.get('[data-testid="th-doc"]').type('3001234567');
    cy.get('[data-testid="th-startDate"]').type('2023-10-01');
    cy.get('[data-testid="th-endDate"]').type('2023-10-10');
    cy.contains('Buscar').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
  });

  it('muestra error si el documento está vacío', () => {
    cy.contains('Historial de Transacciones')
      .parent()
      .within(() => {
        cy.contains('Buscar').click();
      });
    cy.contains('Por favor ingresa el número de documento').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (redirige a login)', () => {
    cy.clearLocalStorage();
    cy.visit('/administration');
    cy.url().should('include', '/login');
  });

  it('puede limpiar el formulario', () => {
    cy.get('[data-testid="th-doc"]').type('3001234567');
    cy.contains('Historial de Transacciones')
      .parent()
      .within(() => {
        cy.contains('Limpiar').click();
      });
    cy.get('[data-testid="th-doc"]').should('have.value', '');
  });
});
