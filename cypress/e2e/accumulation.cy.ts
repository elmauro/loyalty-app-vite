describe('Accumulation Form', () => {
    beforeEach(() => {
      cy.loginAsAdmin(); // Tu helper para autenticarse
    });
  
    it('envía correctamente (200)', () => {
      cy.contains('Acumulación')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type('3001234567');
          cy.get('input[placeholder="Valor $"]').type('100');
          cy.contains('Acumular').click();
        });
  
      cy.contains('Puntos acumulados').should('exist');
    });
  
    it('muestra error 400 BAD REQUEST', () => {
      cy.contains('Acumulación')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type('3001234567');
          cy.get('input[placeholder="Valor $"]').type('0'); // Valor inválido
          cy.contains('Acumular').click();
        });
  
      cy.contains('Solicitud inválida').should('exist');
    });
  
    it('muestra error 401 UNAUTHORIZED (mock MSW)', () => {
      // Este caso depende del MSW devolviendo 401 si no hay token válido
      // Puedes simularlo modificando temporalmente el `localStorage`:
      cy.clearLocalStorage();
  
      cy.visit('/administration'); // Fuerza carga sin token
  
      cy.contains('Login').should('exist'); // Redirigido al login
    });

    it('muestra error 403 FORBIDDEN', () => {
      cy.contains('Acumulación')
        .parent()
        .within(() => {
        cy.get('input[placeholder="Phone Number"]').type('3001234567');
        cy.get('input[placeholder="Valor $"]').type('403');
        cy.contains('Acumular').click();
      });

      cy.url().should('include', '/login'); // Redirección
    });
    
    it('muestra error 404 NOT FOUND', () => {
      cy.contains('Acumulación')
        .parent()
        .within(() => {
        cy.get('input[placeholder="Phone Number"]').type('3001234567');
        cy.get('input[placeholder="Valor $"]').type('404');
        cy.contains('Acumular').click();
      });

      cy.contains('Recurso no encontrado').should('exist');
    });
});  