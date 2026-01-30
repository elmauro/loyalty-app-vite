/// <reference types="cypress" />

import mockAdmin from '../../src/mocks/data/auth/success-admin.json';
import mockUser from '../../src/mocks/data/auth/success-user.json';

// Programmatic login - sets auth data directly in localStorage.
// tenants viene del JWT; getTenantCodeForRequest lo decodifica si no está en authData.
Cypress.Commands.add('loginAsAdmin', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('authData', JSON.stringify(mockAdmin));
  });
  cy.visit('/administration');
  cy.url({ timeout: 10000 }).should('include', '/administration');
});

Cypress.Commands.add('loginAsUser', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('authData', JSON.stringify(mockUser));
  });
  cy.visit('/user');
  cy.url({ timeout: 10000 }).should('include', '/user');
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;
    }
  }
}

export {};
