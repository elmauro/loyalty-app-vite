/// <reference types="cypress" />

import mockAdmin from '../../src/mocks/data/auth/success-admin.json';
import mockProgramAdmin from '../../src/mocks/data/auth/success-program-admin.json';
import mockUser from '../../src/mocks/data/auth/success-user.json';
import { isSimulithBackend } from './backend';

type SimulithUsersFixture = {
  password: string;
  users: Record<
    string,
    { email: string; givenName: string; frontendPath: string }
  >;
};

function loginViaUi(email: string, password: string, expectedPath: string): void {
  cy.visit('/login');
  cy.get('[data-testid="login-username"]').clear().type(email);
  cy.get('[data-testid="login-password"]').clear().type(password, { log: false });
  cy.get('button[type="submit"]').contains('Sign In').click();
  cy.url({ timeout: 30000 }).should('include', expectedPath);
}

function loginSimulithRole(roleKey: 'tenant_admin' | 'program_admin' | 'customer'): void {
  cy.fixture<SimulithUsersFixture>('simulith-users.json').then((fixture) => {
    const user = fixture.users[roleKey];
    loginViaUi(user.email, fixture.password, user.frontendPath);
    cy.contains('Bienvenido', { timeout: 15000 }).should('exist');
  });
}

// Programmatic login — MSW: localStorage mock; Simulith: Cognito UI login.
Cypress.Commands.add('loginAsAdmin', () => {
  if (isSimulithBackend()) {
    loginSimulithRole('tenant_admin');
    return;
  }
  cy.window().then((win) => {
    win.localStorage.setItem('authData', JSON.stringify(mockAdmin));
  });
  cy.visit('/administration');
  cy.url({ timeout: 10000 }).should('include', '/administration');
});

Cypress.Commands.add('loginAsProgramAdmin', () => {
  if (isSimulithBackend()) {
    loginSimulithRole('program_admin');
    return;
  }
  cy.window().then((win) => {
    win.localStorage.setItem('authData', JSON.stringify(mockProgramAdmin));
  });
  cy.visit('/program-administration');
  cy.url({ timeout: 10000 }).should('include', '/program-administration');
});

Cypress.Commands.add('loginAsUser', () => {
  if (isSimulithBackend()) {
    loginSimulithRole('customer');
    return;
  }
  cy.window().then((win) => {
    win.localStorage.setItem('authData', JSON.stringify(mockUser));
  });
  cy.visit('/user');
  cy.url({ timeout: 10000 }).should('include', '/user');
});

Cypress.Commands.add(
  'loginViaSimulith',
  (roleKey: 'tenant_admin' | 'program_admin' | 'customer') => {
    loginSimulithRole(roleKey);
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsProgramAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;
      loginViaSimulith(
        roleKey: 'tenant_admin' | 'program_admin' | 'customer'
      ): Chainable<void>;
    }
  }
}

export {};
