import mockAccumulationSuccess from '../../src/mocks/data/accumulations/success.json';

describe('Accumulation Form', () => {
    beforeEach(() => {
      cy.loginAsAdmin(); // Tu helper para autenticarse
    });

    it('envía correctamente (200)', () => {
      cy.intercept('POST', '**/income53rv1c3/income', { statusCode: 200, body: mockAccumulationSuccess }).as('accumulate');
      cy.contains('Acumulación')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type('3001234567');
          cy.get('input[placeholder="Valor $"]').type('100');
          cy.contains('Acumular').click();
        });
      cy.wait('@accumulate');
      cy.contains('Puntos acumulados').should('exist');
    });
  
    it('muestra error 400 BAD REQUEST', () => {
      cy.intercept('POST', '**/income53rv1c3/income', { statusCode: 400 }).as('accumulateBad');
      cy.contains('Acumulación')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type('3001234567');
          cy.get('input[placeholder="Valor $"]').type('0'); // Valor inválido
          cy.contains('Acumular').click();
        });
      cy.wait('@accumulateBad');
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
      cy.intercept('POST', '**/income53rv1c3/income', { statusCode: 404 }).as('accumulateNotFound');
      cy.contains('Acumulación')
        .parent()
        .within(() => {
          cy.get('input[placeholder="Phone Number"]').type('3001234567');
          cy.get('input[placeholder="Valor $"]').type('404');
          cy.contains('Acumular').click();
        });
      cy.wait('@accumulateNotFound');
      cy.contains('Recurso no encontrado').should('exist');
    });
});  