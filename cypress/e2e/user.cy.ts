import mockTransactions from '../../src/mocks/data/transactions/success.json';

describe('User flow (rol 2)', () => {
    beforeEach(() => {
      cy.loginAsUser(); // Usa tu helper personalizado
    });
  
    it('accede correctamente al dashboard de usuario', () => {
      cy.contains('Welcome, User986').should('exist');
      cy.url().should('include', '/user');
    });
  
    it('consulta transacciones exitosamente (200)', () => {
        cy.intercept('GET', '**/history53rv1c3/history/**', { statusCode: 200, body: mockTransactions }).as('getHistory');
        cy.contains('Historial de Transacciones').should('be.visible');
        // User page has no Document Number input; it uses the logged-in user's identification
        cy.get('input[data-testid="startDate"]').type('2023-10-01');
        cy.get('input[data-testid="endDate"]').type('2023-10-10');
        cy.contains('Find').click();
        cy.wait('@getHistory');
        cy.contains('Deelite').should('exist');
        cy.contains('2023-10-04').should('exist');
        cy.contains('100').should('exist');
    });
  
    it('puede cerrar sesión', () => {
      cy.contains('Logout').click();
      cy.url().should('include', '/login');
      cy.contains('Sign In').should('exist');
    });
});