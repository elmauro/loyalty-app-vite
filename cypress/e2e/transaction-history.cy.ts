// cypress/e2e/transaction-history.cy.ts

describe('Transaction History Form', () => {
    beforeEach(() => {
      cy.loginAsAdmin(); // Reutilizamos helper de autenticación
    });
  
    const phoneNumber = '3001234567';
  
    it('consulta transacciones exitosamente (200)', () => {
      cy.contains('Historial de Transacciones')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type(phoneNumber);
          cy.get('input[data-testid="startDate"]').type('2023-10-01');
          cy.get('input[data-testid="endDate"]').type('2023-10-10');
          cy.contains('Buscar').click();
        });
  
      cy.contains('Deelite').should('exist');
      cy.contains('2023-10-04').should('exist');
      cy.contains('100').should('exist');
    });
  
    it('muestra error 401 UNAUTHORIZED (MSW simulado)', () => {
      cy.clearLocalStorage(); // Simulamos pérdida de sesión
      cy.visit('/administration');
  
      cy.contains('Login').should('exist');
    });
  
    it('muestra error 403 FORBIDDEN (simulado)', () => {
      // Simula token inválido para forzar respuesta 403 por MSW/interceptor
      window.localStorage.setItem('authData', JSON.stringify({ token: 'forbidden-token' }));
      
      cy.visit('/administration');
      cy.contains('Login').should('exist');
    });
});  