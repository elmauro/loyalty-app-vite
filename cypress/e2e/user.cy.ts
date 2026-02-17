describe('User flow (rol 2)', () => {
  beforeEach(() => {
    cy.loginAsUser();
  });

  it('accede correctamente al dashboard de usuario', () => {
    cy.url().should('include', '/user');
    cy.contains('Historial de Transacciones').should('exist');
  });

  it('muestra Puntos Disponibles y Puntos por Vencer', () => {
    cy.get('[data-testid="user-card-puntos-disponibles"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-testid="user-card-puntos-por-vencer"]').should('be.visible');
    cy.get('[data-testid="user-card-puntos-disponibles"]').contains('1.500');
    cy.get('[data-testid="user-card-puntos-por-vencer"]').contains('400');
    cy.get('[data-testid="user-card-puntos-por-vencer"]').contains(/Vencen el/);
  });

  it('consulta transacciones exitosamente', () => {
    cy.contains('Historial de Transacciones').should('be.visible');
    cy.get('[data-testid="user-startDate"]').type('2023-10-01');
    cy.get('[data-testid="user-endDate"]').type('2023-10-10');
    cy.contains('Find').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
  });

  it('muestra tabs Todo, Acumulado y Redimido en historial', () => {
    cy.get('[data-testid="user-startDate"]').type('2023-10-01');
    cy.get('[data-testid="user-endDate"]').type('2023-10-10');
    cy.contains('Find').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="tx-tab-all"]').should('contain', 'Todo');
    cy.get('[data-testid="tx-tab-accumulation"]').should('contain', 'Acumulado');
    cy.get('[data-testid="tx-tab-redemption"]').should('contain', 'Redimido');
  });

  it('puede cerrar sesión', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
    cy.get('button[type="submit"]').contains('Sign In').should('exist');
  });
});
