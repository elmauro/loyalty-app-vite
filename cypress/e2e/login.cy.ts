// cypress/e2e/login.cy.ts
import mockAdmin from '../../src/mocks/data/auth/success-admin.json';
import mockUser from '../../src/mocks/data/auth/success-user.json';

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
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === 'bad' && body?.pass === 'bad') {
          req.reply({ statusCode: 400 });
        }
      }).as('loginBad');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('bad');
      cy.get('input[placeholder="Password"]').type('bad');
      cy.contains('Sign In').click();
      cy.wait('@loginBad');
      cy.contains('Credenciales inválidas').should('exist');
    });
  
    it('muestra error por acceso prohibido (403)', () => {
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === 'forbidden' && body?.pass === '1234') {
          req.reply({ statusCode: 403 });
        }
      }).as('loginForbidden');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('forbidden');
      cy.get('input[placeholder="Password"]').type('1234');
      cy.contains('Sign In').click();
      cy.wait('@loginForbidden');
      cy.contains('Acceso prohibido').should('exist');
    });
  
    it('muestra error por usuario no encontrado (404)', () => {
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === 'notfound' && body?.pass === '1234') {
          req.reply({ statusCode: 404 });
        }
      }).as('loginNotFound');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('notfound');
      cy.get('input[placeholder="Password"]').type('1234');
      cy.contains('Sign In').click();
      cy.wait('@loginNotFound');
      cy.contains('Usuario no encontrado').should('exist');
    });
  
    it('permite login correcto (admin)', () => {
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === '8288221' && body?.pass === '8221') {
          req.reply({ statusCode: 200, body: mockAdmin });
        }
      }).as('loginAdmin');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('8288221');
      cy.get('input[placeholder="Password"]').type('8221');
      cy.contains('Sign In').click();
      cy.wait('@loginAdmin');
      cy.url().should('include', '/administration');
      cy.contains('Welcome, AdminUser');
    });

    it('permite login como usuario normal (customer)', () => {
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === '55555555' && body?.pass === '5555') {
          req.reply({ statusCode: 200, body: mockUser });
        }
      }).as('loginUser');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('55555555');
      cy.get('input[placeholder="Password"]').type('5555');
      cy.contains('Sign In').click();
      cy.wait('@loginUser');
      cy.url().should('include', '/user');
      cy.contains('Welcome, User986');
    });

    it('permite login como admin con 98632674 (Mauricio)', () => {
      cy.intercept('POST', '**/api/authentications', (req) => {
        const body = req.body as { login?: string; pass?: string };
        if (body?.login === '98632674' && body?.pass === '2674') {
          req.reply({ statusCode: 200, body: mockAdmin });
        }
      }).as('loginMauricio');
      cy.visit('/login');
      cy.get('input[placeholder="Login"]').type('98632674');
      cy.get('input[placeholder="Password"]').type('2674');
      cy.contains('Sign In').click();
      cy.wait('@loginMauricio');
      cy.url().should('include', '/administration');
      cy.contains('Welcome, AdminUser');
    });
});