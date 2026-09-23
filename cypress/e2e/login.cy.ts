import { describeWhenMsw, describeWhenSimulith } from '../support/backend';

describe('Login flow', () => {
  it('muestra el formulario de login', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-username"]').should('exist');
    cy.get('[data-testid="login-password"]').should('exist');
    cy.get('button[type="submit"]').contains('Sign In').should('exist');
  });

  it('muestra error si los campos están vacíos', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains('Credenciales inválidas').should('exist');
  });

  it('permite navegar a registro', () => {
    cy.visit('/login');
    cy.contains('Sign Up').click();
    cy.url().should('include', '/registration');
  });

  it('permite navegar a recuperar contraseña', () => {
    cy.visit('/login');
    cy.contains('Forgot password?').click();
    cy.url().should('include', '/forgot-password');
  });

  it('muestra/oculta contraseña', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Mostrar contraseña"]').click();
    cy.get('[data-testid="login-password"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Ocultar contraseña"]').click();
    cy.get('[data-testid="login-password"]').should('have.attr', 'type', 'password');
  });
});

describeWhenMsw('Login flow — MSW legacy', () => {
  it('permite login como admin (8288221)', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-username"]').type('8288221');
    cy.get('[data-testid="login-password"]').type('8221');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/administration');
    cy.contains('Bienvenido, AdminUser').should('exist');
  });

  it('permite login como usuario normal (55555555)', () => {
    cy.visit('/login');
    cy.get('[data-testid="login-username"]').type('55555555');
    cy.get('[data-testid="login-password"]').type('5555');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/user');
  });
});

describeWhenSimulith('Login flow — Simulith Cognito', () => {
  it('permite login como tenant admin', () => {
    cy.loginViaSimulith('tenant_admin');
    cy.contains('Bienvenido').should('exist');
  });

  it('permite login como program admin', () => {
    cy.loginViaSimulith('program_admin');
    cy.contains('Bienvenido').should('exist');
  });

  it('permite login como customer', () => {
    cy.loginViaSimulith('customer');
    cy.contains('Bienvenido').should('exist');
  });
});
