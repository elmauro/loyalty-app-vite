// cypress/e2e/login.cy.ts
describe('Login flow', () => {
    it('muestra el formulario de login', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').should('exist');
      cy.get('input[placeholder="Password"]').should('exist');
      cy.contains('Sign In').should('exist');
    });
  
    it('muestra error si los campos están vacíos', () => {
      cy.visit('/login');
      cy.contains('Sign In').click();
      cy.contains('Credenciales inválidas').should('exist');
    });
  
    it('muestra error por credenciales inválidas (400)', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('bad');
      cy.get('input[placeholder="Password"]').type('bad');
      cy.contains('Sign In').click();
      cy.contains('Credenciales inválidas').should('exist');
    });
  
    it('muestra error por acceso prohibido (403)', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('forbidden');
      cy.get('input[placeholder="Password"]').type('1234');
      cy.contains('Sign In').click();
      cy.contains('Acceso prohibido').should('exist');
    });
  
    it('muestra error por usuario no encontrado (404)', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('notfound');
      cy.get('input[placeholder="Password"]').type('1234');
      cy.contains('Sign In').click();
      cy.contains('Usuario no encontrado').should('exist');
    });
  
    it('permite login correcto (admin)', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('8288221');
      cy.get('input[placeholder="Password"]').type('8221');
      cy.contains('Sign In').click();
      cy.url().should('include', '/administration');
      cy.contains('Welcome, AdminUser');
    });
  
    it('permite login como usuario normal', () => {
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('98632674');
      cy.get('input[placeholder="Password"]').type('2674');
      cy.contains('Sign In').click();
      cy.url().should('include', '/user');
      cy.contains('Welcome, User986');
    });
});