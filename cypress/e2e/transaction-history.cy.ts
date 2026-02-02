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
    // Paginación visible tras cargar resultados
    cy.get('#tx-page-size').should('be.visible').and('have.value', '20');
    cy.contains(/Página 1 de \d+/).should('exist');
    cy.get('button[aria-label="Página siguiente"]').should('be.visible');
  });

  it('muestra controles de paginación y permite cambiar cantidad por página', () => {
    cy.get('[data-testid="th-doc"]').type('3001234567');
    cy.get('[data-testid="th-startDate"]').type('2023-10-01');
    cy.get('[data-testid="th-endDate"]').type('2023-10-10');
    cy.contains('Buscar').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
    cy.get('#tx-page-size').select('50');
    cy.get('#tx-page-size').should('have.value', '50');
  });

  it('permite navegar entre páginas con Anterior y Siguiente', () => {
    cy.get('[data-testid="th-doc"]').type('3001234567');
    cy.get('[data-testid="th-startDate"]').type('2023-10-01');
    cy.get('[data-testid="th-endDate"]').type('2023-10-10');
    cy.contains('Buscar').click();
    cy.contains('Deelite', { timeout: 10000 }).should('exist');
    // 10 por página → 25 ítems = 3 páginas
    cy.get('#tx-page-size').select('10');
    cy.contains('Página 1 de 3').should('exist');
    cy.get('button[aria-label="Página siguiente"]').click();
    cy.contains('Página 2 de 3').should('exist');
    cy.get('button[aria-label="Página siguiente"]').click();
    cy.contains('Página 3 de 3').should('exist');
    cy.get('button[aria-label="Página anterior"]').click();
    cy.contains('Página 2 de 3').should('exist');
    cy.get('button[aria-label="Página anterior"]').click();
    cy.contains('Página 1 de 3').should('exist');
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
