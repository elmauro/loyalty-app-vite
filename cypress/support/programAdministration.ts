import { isSimulithBackend } from './backend';

/** Simulith (Cognito + Lambda + DynamoDB) suele superar 15s en mutaciones. */
const SIMULITH_MUTATION_TIMEOUT_MS = 30000;

export interface ProgramAdminE2EData {
  primaryTenant: { tenantId: string; name: string; tenantCode?: string };
  secondaryTenantName?: string;
  tenantAdminEmail: string;
  primaryOffice: { officeId: string; name: string };
  paginationLastOfficeName?: string;
  deactivatedOffice?: { officeId: string; name: string };
  disposableAdminPassword?: string;
  officeSearchTerm?: string;
  officeSearchNoMatch?: string;
  deactivatedOfficeName?: string;
  mockApiKey?: string;
}

const MSW_PROGRAM_ADMIN: ProgramAdminE2EData = {
  primaryTenant: { tenantId: 'tenant-1', name: 'Aliado Demo', tenantCode: 'DEMO01' },
  tenantAdminEmail: 'admin@aliado.com',
  primaryOffice: { officeId: 'off-e2e-001', name: 'Oficina Centro E2E' },
  paginationLastOfficeName: 'Oficina Mock 11',
  officeSearchTerm: 'Centro',
  officeSearchNoMatch: 'sin-resultados-xyz-999',
  deactivatedOfficeName: 'Oficina Desactivada E2E',
  deactivatedOffice: { officeId: 'off-e2e-002', name: 'Oficina Desactivada E2E' },
  mockApiKey: 'lk_test1234567890abcdef1234567890abcdef',
};

export function getProgramAdminE2EData(): Cypress.Chainable<ProgramAdminE2EData> {
  if (isSimulithBackend()) {
    return cy.fixture('simulith-program-admin.json');
  }
  return cy.wrap(MSW_PROGRAM_ADMIN);
}

export function uniqueE2EEmail(prefix = 'admin-e2e'): string {
  return `${prefix}-${Date.now()}@loyaleasy.test`;
}

export function uniqueE2EName(prefix = 'Oficina E2E'): string {
  return `${prefix} ${Date.now()}`;
}

export function openAliadosTab(): void {
  cy.get('[data-testid="program-admin-tab-aliados"]').click();
  cy.get('[data-testid="program-admin-tab-aliados"]').should('have.attr', 'data-state', 'active');
  cy.contains('Aliados (Tenants)', { timeout: 30000 }).should('be.visible');
}

export function openTenantAdminsDialog(data: ProgramAdminE2EData): void {
  cy.contains(data.primaryTenant.name, { timeout: 15000 }).should('be.visible');
  cy.get(`[data-testid="tenant-admins-btn-${data.primaryTenant.tenantId}"]`).click();
  cy.get('[data-testid="tenant-admins-dialog"]', { timeout: 10000 }).should('be.visible');
}

export function openTenantOfficesDialog(data: ProgramAdminE2EData): void {
  cy.contains(data.primaryTenant.name, { timeout: 15000 }).should('be.visible');
  cy.get(`[data-testid="tenant-offices-btn-${data.primaryTenant.tenantId}"]`).click();
  cy.get('[data-testid="tenant-offices-dialog"]', { timeout: 10000 }).should('be.visible');
  cy.get('[data-testid="tenant-offices-search"]').clear();
}

export function openTenantApiKeyDialog(data: ProgramAdminE2EData): void {
  cy.contains(data.primaryTenant.name, { timeout: 15000 }).should('be.visible');
  cy.get(`[data-testid="tenant-api-key-btn-${data.primaryTenant.tenantId}"]`).click();
  cy.get('[data-testid="tenant-api-key-dialog"]', { timeout: 10000 }).should('be.visible');
}

export function openNewTenantAdminForm(): void {
  cy.get('[data-testid="tenant-admins-new-admin"]').click();
  cy.get('[data-testid="tenant-admin-form-dialog"]', { timeout: 8000 }).should('be.visible');
}

export function fillNewTenantAdminForm(input: {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  phoneNumber?: string;
}): void {
  cy.get('[data-testid="tenant-admin-form-email"]').clear().type(input.email);
  cy.get('[data-testid="tenant-admin-form-password"]').clear().type(input.password ?? 'Password123!', {
    log: false,
  });
  cy.get('[data-testid="tenant-admin-form-firstName"]').clear().type(input.firstName ?? 'Admin');
  cy.get('[data-testid="tenant-admin-form-lastName"]').clear().type(input.lastName ?? 'E2E');
  cy.get('[data-testid="tenant-admin-form-documentNumber"]').clear().type(input.documentNumber ?? '1234567890');
  cy.get('[data-testid="tenant-admin-form-phoneNumber"]').clear().type(input.phoneNumber ?? '573001234567');
}

export function submitNewTenantAdminForm(): void {
  cy.get('[data-testid="tenant-admin-form-save"]').click();
}

export function filterAdminsByEmail(email: string): void {
  cy.get('[data-testid="tenant-admins-dialog"]')
    .find('input[placeholder="Buscar administrador..."]')
    .clear()
    .type(email);
}

/** Tras crear admin: filtra por email (evita paginación) y espera fila visible. */
export function assertAdminEmailInList(email: string): void {
  filterAdminsByEmail(email);
  cy.contains('[data-testid="tenant-admins-dialog"] tbody tr', email, {
    timeout: SIMULITH_MUTATION_TIMEOUT_MS,
  }).should('exist');
}

export function clickDeactivateAdminByEmail(email: string): void {
  assertAdminEmailInList(email);
  cy.contains('[data-testid="tenant-admins-dialog"] tbody tr', email)
    .find('[data-testid^="tenant-admin-deactivate-"]')
    .click();
}

export function confirmDeactivateAdmin(): void {
  cy.contains('¿Desactivar administrador?', { timeout: 5000 }).should('exist');
  cy.contains('button', 'Confirmar').click();
}

export function assertAdminCreatedToast(): void {
  cy.contains('Administrador creado', { timeout: 30000 }).should('exist');
}

export function uniqueE2EDocument(): string {
  return `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

export function assertAdminDeactivatedToast(): void {
  cy.contains('Administrador desactivado', { timeout: 15000 }).should('exist');
}

export function assertGeneratedApiKey(data: ProgramAdminE2EData): void {
  cy.get('[data-testid="api-key-display"]', { timeout: 15000 }).should('be.visible');
  if (isSimulithBackend()) {
    cy.get('[data-testid="api-key-display"]')
      .invoke('val')
      .should('match', /^lk_[a-f0-9]{32,}$/);
  } else {
    cy.get('[data-testid="api-key-display"]').should(
      'have.value',
      data.mockApiKey ?? 'lk_test1234567890abcdef1234567890abcdef'
    );
  }
  cy.contains('API key generada').should('exist');
}

export function createOfficeViaUi(name: string, address: string): void {
  if (isSimulithBackend()) {
    cy.intercept('POST', '**/offices').as('createOffice');
  }
  cy.get('[data-testid="tenant-offices-dialog"]').within(() => {
    cy.get('[data-testid="tenant-offices-new-office"]').click();
  });
  cy.get('[data-testid="tenant-office-form-dialog"]', { timeout: 8000 }).should('be.visible');
  cy.get('[data-testid="tenant-office-form-name"]').clear().type(name);
  cy.get('[data-testid="tenant-office-form-address"]').clear().type(address);
  cy.get('[data-testid="tenant-office-form-save"]').click();
  if (isSimulithBackend()) {
    cy.wait('@createOffice', { timeout: SIMULITH_MUTATION_TIMEOUT_MS })
      .its('response.statusCode')
      .should('eq', 200);
  }
}

export function assertOfficeCreatedToast(): void {
  cy.contains('Oficina creada', { timeout: SIMULITH_MUTATION_TIMEOUT_MS }).should('exist');
}

export function assertOfficeDeactivatedToast(): void {
  cy.contains('Oficina desactivada', { timeout: SIMULITH_MUTATION_TIMEOUT_MS }).should('exist');
}

export function assertOfficeActivatedToast(): void {
  cy.contains('Oficina activada', { timeout: SIMULITH_MUTATION_TIMEOUT_MS }).should('exist');
}

export function deactivateOfficeById(officeId: string): void {
  cy.get(`[data-testid="tenant-office-delete-${officeId}"]`, { timeout: 15000 }).click();
  cy.contains('¿Desactivar oficina?', { timeout: 5000 }).should('exist');
  cy.contains('button', 'Desactivar').click();
}

export function filterOfficesByName(officeName: string): void {
  cy.get('[data-testid="tenant-offices-search"]').clear().type(officeName);
  cy.contains(officeName, { timeout: 15000 }).should('exist');
}

export function deactivateOfficeByName(officeName: string): void {
  if (isSimulithBackend()) {
    cy.intercept('PUT', '**/offices/**').as('updateOffice');
  }
  filterOfficesByName(officeName);
  cy.contains(officeName)
    .parents('tr')
    .find('[data-testid^="tenant-office-delete-"]')
    .click();
  cy.contains('¿Desactivar oficina?', { timeout: 5000 }).should('exist');
  cy.contains('button', 'Desactivar').click();
  if (isSimulithBackend()) {
    cy.wait('@updateOffice', { timeout: SIMULITH_MUTATION_TIMEOUT_MS })
      .its('response.statusCode')
      .should('eq', 200);
  }
}

export function reactivateOfficeById(officeId: string): void {
  cy.get(`[data-testid="tenant-office-reactivate-${officeId}"]`, { timeout: 15000 }).click();
}

export function reactivateOfficeByName(officeName: string): void {
  if (isSimulithBackend()) {
    cy.intercept('PUT', '**/offices/**').as('reactivateOffice');
  }
  cy.contains('Oficinas desactivadas', { timeout: 10000 }).should('exist');
  cy.contains(officeName, { timeout: SIMULITH_MUTATION_TIMEOUT_MS }).should('exist');
  cy.contains(officeName)
    .parents('tr')
    .find('[data-testid^="tenant-office-reactivate-"]')
    .click();
  if (isSimulithBackend()) {
    cy.wait('@reactivateOffice', { timeout: SIMULITH_MUTATION_TIMEOUT_MS })
      .its('response.statusCode')
      .should('eq', 200);
  }
}

const MIN_OFFICES_FOR_PAGINATION = 11;

function readActiveOfficeTotal(): Cypress.Chainable<number> {
  return cy
    .get('[data-testid="tenant-offices-dialog"]')
    .contains(/\d+-\d+ de \d+/, { timeout: 20000 })
    .invoke('text')
    .then((rangeText) => {
      const match = /de (\d+)\s*$/.exec(String(rangeText).trim());
      return Number(match?.[1] ?? 0);
    });
}

/** Crea oficinas disposable hasta alcanzar el mínimo (idempotente si el seed ya tiene suficientes). */
export function ensureMinimumActiveOffices(minCount: number): void {
  readActiveOfficeTotal().then((total) => {
    if (total >= minCount) return;
    const name = uniqueE2EName('Comfama Pag Bootstrap');
    cy.intercept('POST', '**/offices').as('bootstrapOffice');
    createOfficeViaUi(name, 'Calle bootstrap E2E 1-1');
    cy.wait('@bootstrapOffice', { timeout: SIMULITH_MUTATION_TIMEOUT_MS })
      .its('response.statusCode')
      .should('eq', 200);
    assertOfficeCreatedToast();
    cy.get('[data-testid="tenant-offices-search"]').clear();
    ensureMinimumActiveOffices(minCount);
  });
}

export function assertOfficesPagination(data: ProgramAdminE2EData): void {
  const lastOffice = data.paginationLastOfficeName ?? 'Oficina Mock 11';

  if (isSimulithBackend()) {
    ensureMinimumActiveOffices(MIN_OFFICES_FOR_PAGINATION);
    cy.get('[data-testid="tenant-offices-dialog"]').within(() => {
      cy.contains(data.primaryOffice.name, { timeout: 20000 }).should('exist');
      cy.get('#tenant-offices-page-size', { timeout: 20000 }).should('have.value', '10');
      cy.contains(/Página 1 de 2/, { timeout: 20000 }).should('exist');
      cy.get('[data-testid^="tenant-office-delete-"]', { timeout: 10000 }).should('have.length', 10);
      cy.get('button[aria-label="Página siguiente"]').click();
      cy.contains(data.primaryOffice.name).should('not.exist');
      cy.get('[data-testid^="tenant-office-delete-"]').should('have.length.at.least', 1);
      cy.get('#tenant-offices-page-size').select('20');
      cy.get('#tenant-offices-page-size').should('have.value', '20');
      cy.contains(/Página 1 de 1/).should('exist');
    });
    return;
  }

  cy.get('[data-testid="tenant-offices-dialog"]').within(() => {
    cy.contains(data.primaryOffice.name, { timeout: 20000 }).should('exist');
    cy.get('#tenant-offices-page-size', { timeout: 20000 }).should('have.value', '10');
    cy.contains(/Página 1 de 2/, { timeout: 20000 }).should('exist');
    cy.contains(lastOffice).should('not.exist');
    cy.get('button[aria-label="Página siguiente"]').click();
    cy.contains(lastOffice, { timeout: 10000 }).should('exist');
    cy.contains(data.primaryOffice.name).should('not.exist');
    cy.get('#tenant-offices-page-size').select('20');
    cy.get('#tenant-offices-page-size').should('have.value', '20');
    cy.contains(/Página 1 de 1/).should('exist');
  });
}
