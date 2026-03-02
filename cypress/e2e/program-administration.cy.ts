describe('Administración del Programa', () => {
  beforeEach(() => {
    cy.loginAsProgramAdmin();
  });

  it('carga la página y muestra pestañas Configuración y Aliados', () => {
    cy.contains('Administración del Programa').should('exist');
    cy.get('[data-testid="program-admin-tab-aliados"]').should('exist');
    cy.contains('Configuración').should('exist');
    cy.contains('Aliados').should('exist');
  });

  it('muestra la lista de aliados al cambiar a la pestaña Aliados', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliados (Tenants)', { timeout: 5000 }).should('exist');
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
  });

  it('abre el diálogo de administradores al hacer clic en el icono de personas', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.contains('Administradores').should('exist');
    cy.contains('Aliado Demo').should('exist');
  });

  it('abre el formulario de nuevo administrador', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admins-new-admin"]').click();
    cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admin-form-email"]').should('exist');
    cy.get('[data-testid="tenant-admin-form-password"]').should('exist');
    cy.get('[data-testid="tenant-admin-form-firstName"]').should('exist');
    cy.get('[data-testid="tenant-admin-form-lastName"]').should('exist');
  });

  it('crea un nuevo administrador (MSW mock)', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admins-new-admin"]').click();
    cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admin-form-email"]').type('admin-test@aliado.com');
    cy.get('[data-testid="tenant-admin-form-password"]').type('Password123');
    cy.get('[data-testid="tenant-admin-form-firstName"]').type('Admin');
    cy.get('[data-testid="tenant-admin-form-lastName"]').type('Test');
    cy.get('[data-testid="tenant-admin-form-save"]').click();
    cy.contains('Administrador creado', { timeout: 5000 }).should('exist');
  });

  it('requiere campos obligatorios para crear administrador', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admins-new-admin"]').click();
    cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admin-form-save"]').click();
    cy.contains('Todos los campos son obligatorios').should('exist');
  });

  it('requiere contraseña de al menos 8 caracteres', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admins-new-admin"]').click();
    cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admin-form-email"]').type('admin@test.com');
    cy.get('[data-testid="tenant-admin-form-password"]').type('123');
    cy.get('[data-testid="tenant-admin-form-firstName"]').type('Admin');
    cy.get('[data-testid="tenant-admin-form-lastName"]').type('Test');
    cy.get('[data-testid="tenant-admin-form-save"]').click();
    cy.contains('La contraseña debe tener al menos 8 caracteres').should('exist');
  });

  it('abre el diálogo de confirmación al desactivar un administrador', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.contains('admin@aliado.com', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admin-deactivate-admin-demo-001"]').click();
    cy.contains('¿Desactivar administrador?', { timeout: 3000 }).should('exist');
    cy.contains('El usuario no podrá acceder al sistema hasta que se reactive.').should('exist');
    cy.contains('button', 'Cancelar').click();
    cy.contains('¿Desactivar administrador?').should('not.exist');
  });

  it('tiene botones Editar y Desactivar para cada administrador', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.contains('admin@aliado.com', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admin-edit-admin-demo-001"]').should('be.visible');
    cy.get('[data-testid="tenant-admin-deactivate-admin-demo-001"]').should('be.visible');
  });

  it('cierra el formulario con Cancelar', () => {
    cy.get('[data-testid="program-admin-tab-aliados"]').click();
    cy.contains('Aliado Demo', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="tenant-admins-btn-tenant-1"]').click();
    cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admins-new-admin"]').click();
    cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 3000 }).should('be.visible');
    cy.get('[data-testid="tenant-admin-form-cancel"]').click();
    cy.get('body').should(($body) => {
      expect($body.find('[data-testid="tenant-admin-form-dialog"]').length).to.eq(0);
    });
  });
});
