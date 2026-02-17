describe('Reglas de Bonificación', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/rules');
    cy.url({ timeout: 10000 }).should('include', '/rules');
  });

  it('carga la página y muestra reglas existentes', () => {
    cy.contains('Reglas de Bonificación').should('exist');
    cy.contains('CompraGrande', { timeout: 5000 }).should('exist');
    cy.contains(/2[.,]?000 pts/).should('exist');
  });

  it('abre el diálogo de nueva regla', () => {
    cy.contains('CompraGrande', { timeout: 5000 }).should('exist');
    cy.get('[data-testid="rules-new-rule"]').click();
    cy.get('[data-testid="rule-form-dialog"]', { timeout: 8000 }).should('be.visible');
    cy.get('[data-testid="rule-form-name"]').should('be.visible');
    cy.get('[data-testid="rule-form-points"]').should('be.visible');
    cy.get('[data-testid="rule-form-cancel"]').click();
    cy.get('body').should(($body) => {
      expect($body.find('[data-testid="rule-form-dialog"]').length).to.eq(0);
    });
  });

  it('crea una nueva regla', () => {
    cy.get('[data-testid="rules-new-rule"]').click();
    cy.get('[data-testid="rule-form-name"]').type('BonoTest');
    cy.get('[data-testid="rule-form-points"]').type('500');
    cy.get('[data-testid="rule-form-condition-fact"]').click();
    cy.get('[role="option"]').contains('Monto').click({ force: true });
    cy.get('[data-testid="rule-form-condition-value"]').clear().type('5000');
    cy.get('[data-testid="rule-form-save"]').click();
    cy.contains('Regla creada', { timeout: 8000 }).should('exist');
    cy.contains('BonoTest').should('exist');
    cy.contains('500 pts').should('exist');
  });

  it('edita una regla existente', () => {
    cy.get('[data-testid="rule-card-0"]').within(() => {
      cy.get('[data-testid="rule-card-edit"]').click();
    });
    cy.contains('Editar regla', { timeout: 3000 }).should('exist');
    cy.get('[data-testid="rule-form-name"]').clear().type('CompraGrandeEditada');
    cy.get('[data-testid="rule-form-save"]').click();
    cy.contains('Regla actualizada', { timeout: 5000 }).should('exist');
    cy.contains('CompraGrandeEditada').should('exist');
  });

  it('cambia a la pestaña Facts', () => {
    cy.get('[data-testid="rules-tab-facts"]').click();
    cy.contains('Facts disponibles').should('exist');
    cy.contains('Monto').should('exist');
    cy.contains('Tipo documento').should('exist');
    cy.contains('Número documento').should('exist');
  });

  describe('Facts', () => {
    beforeEach(() => {
      cy.contains('CompraGrande', { timeout: 5000 }).should('exist');
      cy.get('[data-testid="rules-tab-facts"]').click({ force: true });
      cy.contains('Facts disponibles').should('be.visible');
      cy.get('[data-testid="facts-add-form"]', { timeout: 8000 }).should('be.visible');
    });

    it('añade un fact nuevo', () => {
      cy.get('[data-testid="facts-add-name"]').type('promoCode');
      cy.get('[data-testid="facts-add-type"]').click();
      cy.get('[role="option"]').contains('string').click({ force: true });
      cy.get('[data-testid="facts-add-btn"]').click();
      cy.contains('Fact "promoCode" añadido', { timeout: 5000 }).should('exist');
      cy.contains('promoCode').should('exist');
    });

    it('requiere nombre para añadir fact', () => {
      cy.get('[data-testid="facts-add-btn"]').click();
      cy.contains('El nombre del fact es obligatorio').should('exist');
    });

    it('no permite fact duplicado', () => {
      cy.get('[data-testid="facts-add-name"]').type('value');
      cy.get('[data-testid="facts-add-btn"]').click();
      cy.contains('Ya existe un fact con ese nombre').should('exist');
    });

    it('elimina un fact personalizado no usado', () => {
      cy.get('[data-testid="facts-add-name"]').type('customFact');
      cy.get('[data-testid="facts-add-btn"]').click();
      cy.contains('Fact "customFact" añadido', { timeout: 5000 }).should('exist');
      cy.get('[data-testid="facts-delete-customFact"]').should('exist');
      cy.get('[data-testid="facts-delete-customFact"]').click();
      cy.contains('Fact "customFact" eliminado', { timeout: 5000 }).should('exist');
      cy.get('body').should(($body) => {
        expect($body.find('[data-testid="facts-delete-customFact"]').length).to.eq(0);
      });
    });

    it('no permite eliminar fact en uso (Monto/value)', () => {
      cy.get('[data-testid="facts-delete-value"]').should('be.disabled');
    });
  });

  it('requiere nombre y puntos para guardar', () => {
    cy.get('[data-testid="rules-new-rule"]').click();
    cy.get('[data-testid="rule-form-save"]').click();
    cy.contains('El nombre de la regla es obligatorio').should('exist');
    cy.get('[data-testid="rule-form-name"]').type('Test');
    cy.get('[data-testid="rule-form-save"]').click();
    cy.contains('Los puntos deben ser un valor numérico').should('exist');
  });
});
