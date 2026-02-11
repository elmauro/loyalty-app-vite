describe('Flujos de autenticación (Registro, Forgot, Reset, Change)', () => {
  describe('Registro (mock)', () => {
    it('muestra el formulario de registro completo', () => {
      cy.visit('/registration');
      cy.get('#phoneNumber').should('exist');
      cy.get('#birthDate').should('exist');
      cy.get('#documentNumber').should('exist');
      cy.get('#email').should('exist');
      cy.get('#password').should('exist');
      cy.get('#terms').should('exist');
      cy.contains('Register').should('exist');
    });

    it('valida campos vacíos', () => {
      cy.visit('/registration');
      cy.contains('Register').click();
      cy.contains('Por favor corrige los errores').should('exist');
    });

    it('proceso de registro completo (mock path) redirige a login', () => {
      cy.visit('/registration');
      cy.get('#phoneNumber').type('3001234567');
      cy.get('#birthDate').type('1990-01-15');
      cy.get('#documentNumber').type('12345678');
      cy.get('#email').type('test-e2e@example.com');
      cy.get('#password').type('TestPass123');
      cy.get('[role="checkbox"]').click();
      cy.contains('button', 'Register').click();
      cy.url({ timeout: 10000 }).should('include', '/login');
    });
  });

  describe('Forgot Password', () => {
    it('muestra el formulario de recuperación', () => {
      cy.visit('/forgot-password');
      cy.get('#email').should('exist');
      cy.contains('Send Reset Link').should('exist');
    });

    it('valida email vacío o inválido', () => {
      cy.visit('/forgot-password');
      cy.get('#email').then(($el) => { $el.attr('type', 'text'); });
      cy.get('#email').type('sin-arroba');
      cy.contains('Send Reset Link').click();
      cy.contains('Por favor ingresa un email válido').should('exist');
    });

    it('envía recuperación (mock) y muestra éxito', () => {
      cy.visit('/forgot-password');
      cy.get('#email').type('test@example.com');
      cy.contains('Send Reset Link').click();
      cy.contains('Email enviado', { timeout: 5000 }).should('exist');
    });
  });

  describe('Reset Password', () => {
    it('muestra el formulario con email en URL', () => {
      cy.visit('/reset-password?email=test@example.com');
      cy.get('#email').should('have.value', 'test@example.com');
      cy.get('#code').should('exist');
      cy.get('#newPassword').should('exist');
      cy.contains('Restablecer contraseña').should('exist');
    });
  });

  describe('Change Password', () => {
    it('redirige a login cuando no está autenticado', () => {
      cy.clearLocalStorage();
      cy.visit('/change-password');
      cy.url({ timeout: 5000 }).should('include', '/login');
    });

    it('muestra el formulario cuando está logueado y error al enviar (Cognito desactivado en e2e)', () => {
      cy.loginAsUser();
      cy.visit('/change-password');
      cy.contains('Cambiar contraseña').should('exist');
      cy.get('#oldPassword').type('oldpass');
      cy.get('#newPassword').type('NewPass123');
      cy.get('#confirmPassword').type('NewPass123');
      cy.contains('button', 'Cambiar contraseña').click();
      cy.contains('solo está disponible para cuentas con email').should('exist');
    });
  });
});
