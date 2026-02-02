describe('User flow (rol 2)', () => {
  beforeEach(() => {
    cy.loginAsUser();
  });

  it('accede correctamente al dashboard de usuario', () => {
    cy.url().should('include', '/user');
    cy.contains('Historial de Transacciones').should('exist');
  });

  it('consulta transacciones exitosamente', () => {
    cy.contains('Historial de Transacciones').should('be.visible');
    cy.get('[data-testid="user-startDate"]').type('2023-10-01');
    cy.get('[data-testid="user-endDate"]').type('2023-10-10');
    cy.contains('Find').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
  });

  it('puede cerrar sesión', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
    cy.get('button[type="submit"]').contains('Sign In').should('exist');
  });
});
