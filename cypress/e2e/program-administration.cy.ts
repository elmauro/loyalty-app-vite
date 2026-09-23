import { describeWhenMsw, describeWhenSimulith } from '../support/backend';
import {
  getProgramAdminE2EData,
  openAliadosTab,
  openTenantAdminsDialog,
  openTenantOfficesDialog,
  openTenantApiKeyDialog,
  uniqueE2EEmail,
  uniqueE2EName,
  uniqueE2EDocument,
  openNewTenantAdminForm,
  fillNewTenantAdminForm,
  submitNewTenantAdminForm,
  clickDeactivateAdminByEmail,
  confirmDeactivateAdmin,
  assertAdminCreatedToast,
  assertAdminDeactivatedToast,
  assertAdminEmailInList,
  assertGeneratedApiKey,
  createOfficeViaUi,
  assertOfficeCreatedToast,
  assertOfficeDeactivatedToast,
  assertOfficeActivatedToast,
  deactivateOfficeById,
  deactivateOfficeByName,
  reactivateOfficeById,
  reactivateOfficeByName,
  assertOfficesPagination,
} from '../support/programAdministration';

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

  describe('pestaña Aliados', () => {
    beforeEach(() => {
      openAliadosTab();
    });

    it('muestra la lista de aliados al cambiar a la pestaña Aliados', () => {
      getProgramAdminE2EData().then((data) => {
        cy.contains('Aliados (Tenants)').should('exist');
        cy.contains(data.primaryTenant.name, { timeout: 15000 }).should('exist');
      });
    });

    it('abre el diálogo de administradores al hacer clic en el icono de personas', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        cy.contains('Administradores').should('exist');
        cy.contains(data.primaryTenant.name).should('exist');
      });
    });

    it('abre el formulario de nuevo administrador', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        openNewTenantAdminForm();
        cy.get('[data-testid="tenant-admin-form-email"]').should('exist');
        cy.get('[data-testid="tenant-admin-form-password"]').should('exist');
        cy.get('[data-testid="tenant-admin-form-firstName"]').should('exist');
        cy.get('[data-testid="tenant-admin-form-lastName"]').should('exist');
        cy.get('[data-testid="tenant-admin-form-documentNumber"]').should('exist');
      });
    });

    it('requiere campos obligatorios para crear administrador', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        openNewTenantAdminForm();
        submitNewTenantAdminForm();
        cy.contains('Todos los campos obligatorios deben completarse').should('exist');
      });
    });

    it('requiere contraseña de al menos 8 caracteres', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        openNewTenantAdminForm();
        fillNewTenantAdminForm({
          email: 'admin@test.com',
          password: '123',
          documentNumber: '12345678',
        });
        submitNewTenantAdminForm();
        cy.contains('La contraseña debe tener al menos 8 caracteres').should('exist');
      });
    });

    it('abre el diálogo de confirmación al desactivar un administrador', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        cy.contains(data.tenantAdminEmail, { timeout: 15000 }).should('exist');
        clickDeactivateAdminByEmail(data.tenantAdminEmail);
        cy.contains('¿Desactivar administrador?', { timeout: 3000 }).should('exist');
        cy.contains('El usuario no podrá acceder al sistema hasta que se reactive.').should('exist');
        cy.contains('button', 'Cancelar').click();
        cy.contains('¿Desactivar administrador?').should('not.exist');
      });
    });

    it('tiene botones Editar y Desactivar para cada administrador', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        cy.contains(data.tenantAdminEmail, { timeout: 15000 }).should('exist');
        cy.contains(data.tenantAdminEmail)
          .parents('tr')
          .find('[data-testid^="tenant-admin-edit-"]')
          .should('be.visible');
        cy.contains(data.tenantAdminEmail)
          .parents('tr')
          .find('[data-testid^="tenant-admin-deactivate-"]')
          .should('be.visible');
      });
    });

    it('cierra el formulario con Cancelar', () => {
      getProgramAdminE2EData().then((data) => {
        openTenantAdminsDialog(data);
        openNewTenantAdminForm();
        cy.get('[data-testid="tenant-admin-form-cancel"]').click();
        cy.get('body').should(($body) => {
          expect($body.find('[data-testid="tenant-admin-form-dialog"]').length).to.eq(0);
        });
      });
    });

    describeWhenMsw('mutaciones MSW — administradores', () => {
      it('crea un nuevo administrador (MSW mock)', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantAdminsDialog(data);
          openNewTenantAdminForm();
          fillNewTenantAdminForm({ email: 'admin-test@aliado.com' });
          submitNewTenantAdminForm();
          assertAdminCreatedToast();
        });
      });

      it('desactiva un administrador al confirmar (MSW mock)', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantAdminsDialog(data);
          cy.contains(data.tenantAdminEmail, { timeout: 5000 }).should('exist');
          cy.get('[data-testid="tenant-admin-deactivate-admin-demo-001"]').click();
          confirmDeactivateAdmin();
          assertAdminDeactivatedToast();
        });
      });
    });

    describeWhenSimulith('mutaciones Simulith — administradores', () => {
      it('crea un nuevo administrador (Cognito + DynamoDB)', () => {
        getProgramAdminE2EData().then((data) => {
          const email = uniqueE2EEmail();
          cy.intercept('POST', '**/tenant-admins').as('createTenantAdmin');
          cy.intercept('GET', '**/tenant-admins').as('listTenantAdmins');
          openTenantAdminsDialog(data);
          cy.wait('@listTenantAdmins');
          openNewTenantAdminForm();
          fillNewTenantAdminForm({
            email,
            password: data.disposableAdminPassword ?? 'Test1234!',
            documentNumber: uniqueE2EDocument(),
          });
          submitNewTenantAdminForm();
          cy.wait('@createTenantAdmin', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
          cy.wait('@listTenantAdmins', { timeout: 30000 });
          assertAdminCreatedToast();
          assertAdminEmailInList(email);
        });
      });

      it('desactiva un administrador disposable al confirmar', () => {
        getProgramAdminE2EData().then((data) => {
          const email = uniqueE2EEmail('admin-deact');
          cy.intercept('POST', '**/tenant-admins').as('createTenantAdmin');
          cy.intercept('GET', '**/tenant-admins').as('listTenantAdmins');
          cy.intercept('PATCH', '**/tenant-admins/**').as('deactivateTenantAdmin');
          openTenantAdminsDialog(data);
          cy.wait('@listTenantAdmins');
          openNewTenantAdminForm();
          fillNewTenantAdminForm({
            email,
            password: data.disposableAdminPassword ?? 'Test1234!',
            documentNumber: uniqueE2EDocument(),
          });
          submitNewTenantAdminForm();
          cy.wait('@createTenantAdmin', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
          cy.wait('@listTenantAdmins', { timeout: 30000 });
          assertAdminCreatedToast();
          clickDeactivateAdminByEmail(email);
          confirmDeactivateAdmin();
          cy.wait('@deactivateTenantAdmin', { timeout: 30000 }).its('response.statusCode').should('eq', 200);
          cy.wait('@listTenantAdmins', { timeout: 30000 });
          assertAdminDeactivatedToast();
        });
      });
    });

    describe('API Key', () => {
      it('abre el diálogo de API key al hacer clic en el icono de llave', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantApiKeyDialog(data);
          cy.contains('API Key').should('exist');
          cy.contains(data.primaryTenant.name).should('exist');
        });
      });

      it('cierra el diálogo de API key con Cancelar', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantApiKeyDialog(data);
          cy.contains('button', 'Cancelar').click();
          cy.get('body').should(($body) => {
            expect($body.find('[data-testid="tenant-api-key-dialog"]').length).to.eq(0);
          });
        });
      });

      describeWhenMsw('generación MSW', () => {
        it('genera una API key y la muestra (MSW mock)', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantApiKeyDialog(data);
            cy.get('[data-testid="api-key-generate-btn"]').click();
            assertGeneratedApiKey(data);
          });
        });
      });

      describeWhenSimulith('generación Simulith', () => {
        it('genera una API key y la muestra (backend real)', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantApiKeyDialog(data);
            cy.get('[data-testid="api-key-generate-btn"]').click();
            assertGeneratedApiKey(data);
          });
        });
      });
    });

    describe('Oficinas', () => {
      it('abre el diálogo de oficinas al hacer clic en el icono de ubicación', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.contains('Oficinas').should('exist');
          cy.contains(data.primaryTenant.name).should('exist');
        });
      });

      it('muestra la lista de oficinas del aliado', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.contains(data.primaryOffice.name, { timeout: 15000 }).should('exist');
        });
      });

      it('filtra oficinas por búsqueda y muestra mensaje si no hay coincidencias', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.contains(data.primaryOffice.name, { timeout: 15000 }).should('exist');
          cy.get('[data-testid="tenant-offices-search"]').should('be.visible').type(data.officeSearchTerm ?? 'Centro');
          cy.contains(data.primaryOffice.name, { timeout: 10000 }).should('exist');
          cy.get('[data-testid="tenant-offices-search"]').clear().type(data.officeSearchNoMatch ?? 'sin-resultados-xyz-999');
          cy.contains('Ninguna oficina coincide con la búsqueda', { timeout: 10000 }).should('exist');
        });
      });

      it('abre el formulario de nueva oficina', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.get('[data-testid="tenant-offices-dialog"]').within(() => {
            cy.get('[data-testid="tenant-offices-new-office"]').click();
          });
          cy.get('[data-testid="tenant-office-form-dialog"]', { timeout: 8000 }).should('be.visible');
          cy.get('[data-testid="tenant-office-form-name"]', { timeout: 5000 }).should('be.visible');
          cy.get('[data-testid="tenant-office-form-address"]').should('be.visible');
        });
      });

      it('requiere nombre y dirección para crear oficina', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.get('[data-testid="tenant-offices-new-office"]').click();
          cy.get('[data-testid="tenant-office-form-dialog"]', { timeout: 3000 }).should('be.visible');
          cy.get('[data-testid="tenant-office-form-save"]').click();
          cy.contains('Nombre y dirección son obligatorios').should('exist');
        });
      });

      it('abre el diálogo de confirmación al desactivar una oficina', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.contains(data.primaryOffice.name, { timeout: 15000 }).should('exist');
          cy.get(`[data-testid="tenant-office-delete-${data.primaryOffice.officeId}"]`).click();
          cy.contains('¿Desactivar oficina?', { timeout: 3000 }).should('exist');
          cy.contains('Podrás activarla de nuevo desde la sección de oficinas desactivadas').should('exist');
          cy.contains('button', 'Cancelar').click();
          cy.contains('¿Desactivar oficina?').should('not.exist');
        });
      });

      it('cierra el formulario de oficina con Cancelar', () => {
        getProgramAdminE2EData().then((data) => {
          openTenantOfficesDialog(data);
          cy.get('[data-testid="tenant-offices-new-office"]').click();
          cy.get('[data-testid="tenant-office-form-dialog"]', { timeout: 3000 }).should('be.visible');
          cy.get('[data-testid="tenant-office-form-cancel"]').click();
          cy.get('body').should(($body) => {
            expect($body.find('[data-testid="tenant-office-form-dialog"]').length).to.eq(0);
          });
        });
      });

      describeWhenMsw('mutaciones y paginación MSW — oficinas', () => {
        it('pagina la lista de oficinas (10 por página) y permite cambiar cantidad', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            assertOfficesPagination(data);
          });
        });

        it('crea una nueva oficina (MSW mock)', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            createOfficeViaUi('Oficina Norte E2E', 'Carrera 43 #1-50');
            cy.contains('Oficina creada', { timeout: 5000 }).should('exist');
          });
        });

        it('desactiva una oficina al confirmar (MSW mock)', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            cy.contains(data.primaryOffice.name, { timeout: 5000 }).should('exist');
            deactivateOfficeById(data.primaryOffice.officeId);
            cy.contains('Oficina desactivada', { timeout: 5000 }).should('exist');
          });
        });

        it('muestra oficinas desactivadas y permite reactivar', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            cy.contains('Oficinas desactivadas', { timeout: 5000 }).should('exist');
            const office = data.deactivatedOffice!;
            cy.contains(office.name).should('exist');
            reactivateOfficeById(office.officeId);
            cy.contains('Oficina activada', { timeout: 5000 }).should('exist');
          });
        });
      });

      describeWhenSimulith('mutaciones y paginación Simulith — oficinas', () => {
        it('crea una nueva oficina (backend real)', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            createOfficeViaUi(uniqueE2EName('Comfama Norte E2E'), 'Carrera 43 #1-50');
            assertOfficeCreatedToast();
          });
        });

        it('desactiva una oficina disposable al confirmar', () => {
          getProgramAdminE2EData().then((data) => {
            const officeName = uniqueE2EName('Comfama Desactivar E2E');
            openTenantOfficesDialog(data);
            createOfficeViaUi(officeName, 'Calle disposable 1-1');
            assertOfficeCreatedToast();
            deactivateOfficeByName(officeName);
            assertOfficeDeactivatedToast();
          });
        });

        it('muestra oficinas desactivadas y permite reactivar (flujo idempotente)', () => {
          getProgramAdminE2EData().then((data) => {
            const officeName = uniqueE2EName('Comfama Reactivar E2E');
            openTenantOfficesDialog(data);
            createOfficeViaUi(officeName, 'Calle reactivar 2-2');
            assertOfficeCreatedToast();
            deactivateOfficeByName(officeName);
            assertOfficeDeactivatedToast();
            reactivateOfficeByName(officeName);
            assertOfficeActivatedToast();
          });
        });

        it('pagina la lista de oficinas (10 por página) y permite cambiar cantidad', () => {
          getProgramAdminE2EData().then((data) => {
            openTenantOfficesDialog(data);
            assertOfficesPagination(data);
          });
        });
      });
    });
  });
});
