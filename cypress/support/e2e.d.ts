// cypress/support/index.d.ts o e2e.d.ts
/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsUser(): Chainable<void>;
    }
  }
  