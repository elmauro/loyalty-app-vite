// cypress/e2e/redemption.cy.ts
const phoneNumber = '3001234567';
const points = '200';
const otpCode = '123456';

describe('Redemption Form', () => {
  beforeEach(() => {
    cy.loginAsAdmin(); // Tu helper para autenticarse
  });

  function fillAndRequestOtp() {
    cy.contains('Redención')
      .parent()
      .within(() => {
        cy.get('input[placeholder="Phone Number"]').type(phoneNumber);
        cy.get('input[placeholder="Puntos"]').type(points);
        cy.contains('Redimir').click();
      });

    cy.get('input[placeholder="Código OTP"]').type(otpCode);
  }

  it('permite redimir exitosamente (200)', () => {
    fillAndRequestOtp();

    cy.contains('Confirmar').click();
    cy.contains('Puntos redimidos').should('exist');
  });

  it('muestra error por solicitud inválida (400)', () => {
    cy.contains('Redención')
      .parent()
      .within(() => {
        cy.get('input[placeholder="Phone Number"]').type('123');
        cy.get('input[placeholder="Puntos"]').type('0');
        cy.contains('Redimir').click();
      });

    cy.get('input[placeholder="Código OTP"]').type('000000');
    cy.contains('Confirmar').click();

    cy.contains('Solicitud inválida').should('exist');
  });

  it('muestra error 401 UNAUTHORIZED (mock MSW)', () => {
    // Este caso depende del MSW devolviendo 401 si no hay token válido
    // Puedes simularlo modificando temporalmente el `localStorage`:
    cy.clearLocalStorage();

    cy.visit('/administration'); // Fuerza carga sin token

    cy.contains('Login').should('exist'); // Redirigido al login
  });

  it('redirecciona y muestra sesión expirada al recibir 403', () => {
    cy.loginAsAdmin();
  
    cy.contains('Redención')
      .parent()
      .within(() => {
        cy.get('input[placeholder="Phone Number"]').type('3001234567');
        cy.get('input[placeholder="Puntos"]').type('200');
        cy.contains('Redimir').click();
      });
  
    cy.get('input[placeholder="Código OTP"]').clear().type('403403');
    cy.contains('Confirmar').click();
  
    cy.url().should('include', '/login');
  });
  
  it('muestra error 404 NOT FOUND (mock MSW)', () => {
    fillAndRequestOtp();
    cy.get('input[placeholder="Código OTP"]').clear().type('404404');
    cy.contains('Confirmar').click();
    cy.contains('Recurso no encontrado').should('exist');
  });
});
