/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import mockAdmin from '../../src/mocks/data/auth/success-admin.json';
import mockUser from '../../src/mocks/data/auth/success-user.json';

  Cypress.Commands.add('loginAsAdmin', () => {
    cy.intercept('POST', '**/api/authentications', (req) => {
      const body = req.body as { login?: string; pass?: string };
      if (body?.login === '98632674' && body?.pass === '2674') {
        req.reply({ statusCode: 200, body: mockAdmin });
      }
    }).as('loginRequest');
    cy.visit('/login');
    cy.get('input[placeholder="Login"]').should('be.visible');
    cy.get('input[placeholder="Login"]').type('98632674');
    cy.get('input[placeholder="Password"]').type('2674');
    cy.contains('Sign In').click();
    cy.wait('@loginRequest');
    cy.url({ timeout: 10000 }).should('include', '/administration');
  });

  Cypress.Commands.add('loginAsUser', () => {
    cy.intercept('POST', '**/api/authentications', (req) => {
      const body = req.body as { login?: string; pass?: string };
      if (body?.login === '55555555' && body?.pass === '5555') {
        req.reply({ statusCode: 200, body: mockUser });
      }
    }).as('loginRequest');
    cy.visit('/login');
    cy.get('input[placeholder="Login"]').should('be.visible');
    cy.get('input[placeholder="Login"]').type('55555555');
    cy.get('input[placeholder="Password"]').type('5555');
    cy.contains('Sign In').click();
    cy.wait('@loginRequest');
    cy.url({ timeout: 10000 }).should('include', '/user');
  });