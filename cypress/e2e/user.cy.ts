describe('User flow (rol 2)', () => {
    beforeEach(() => {
      cy.loginAsUser(); // Usa tu helper personalizado
    });
  
    it('accede correctamente al dashboard de usuario', () => {
      cy.contains('Welcome, User986').should('exist');
      cy.url().should('include', '/user');
    });
  
    it('consulta transacciones exitosamente (200)', () => {
        cy.contains('Historial de Transacciones')
          .closest('section') // más seguro que parent()
          .within(() => {
            cy.get('input[data-testid="startDate"]').type('2023-10-01');
            cy.get('input[data-testid="endDate"]').type('2023-10-10');
            cy.contains('Find').click();
          });
      
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