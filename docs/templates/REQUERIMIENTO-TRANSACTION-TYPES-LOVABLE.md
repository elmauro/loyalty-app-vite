# Requerimiento: Tipos de Transacción (Transaction Types)

**Alcance:** Solo frontend. Lovable no tiene conocimiento del backend; este documento describe únicamente lo que el frontend debe implementar y los contratos de datos que consumirá.

**Objetivo:** Documentar los requisitos funcionales de tipos de transacción para que Lovable proponga la mejor UX en cada contexto (Administración del Programa, Administración tenant, Reglas de Bonificación).

**Nota:** Se describe *qué* debe hacer el frontend y *qué* reglas de negocio aplicar en la UI. La elección de componentes, layout y patrones de interacción queda a criterio de Lovable.

---

## 1. Contexto (para el frontend)

Un programa de lealtad usa **tipos de transacción** para acumulación (income) y redención (expense). Ejemplos: `sale`, `rule`, `promo`, `referral` (acumulación); `redemption`, `gift` (redención). Las reglas de bonificación se evalúan según el tipo enviado.

**Datos disponibles:** Los tipos pueden obtenerse de la configuración del programa (incluye `transactionsType`) o de un servicio dedicado que devuelve `{ income, expense }`. En la página del programa se usa la info ya cargada; en otras páginas (Administración tenant, Reglas) se usa el servicio dedicado.

---

## 2. Administración del Programa (Program Admins)

**Ruta:** `/program-administration`

**Rol requerido:** `ROLE_PROGRAM_ADMIN` (solo administradores de programa).

**Funcionalidad:** Configuración del programa, incluyendo la gestión de tipos de transacción para acumulación y redención.

### 2.1 Requisitos funcionales

- La página tiene tabs: **Configuración** | **Aliados**.
- En Configuración: formulario con datos básicos del programa y **gestión de tipos de transacción**.
- **Fuente de datos:** Los tipos vienen en la configuración del programa (`transactionsType`). No hace falta una llamada adicional para obtener tipos; se reutiliza la información ya cargada.
- **Lovable propone:** La mejor UX para mostrar y editar los tipos (income/expense).

**Reglas de negocio (validación en frontend):**

- **Añadir tipo:** Normalizar a minúsculas y sin espacios; no permitir duplicados por categoría.
- **Eliminar tipo:** Debe haber al menos un tipo en `income` y uno en `expense`.
- **Validación:** Antes de guardar, validar mínimo un tipo por categoría.
- **Guardar:** Enviar el programa actualizado (incluyendo `transactionsType`) al servicio de actualización.

**Feedback:** Mostrar errores (duplicado, eliminar último) y éxito al guardar.

---

## 3. Página de Administración (Tenant Admins)

**Ruta:** `/administration`

**Funcionalidad:** Formulario de acumulación de puntos para administradores de tenant.

### 3.1 Requisitos funcionales

- El usuario debe poder **elegir el tipo de transacción** (income) antes de acumular.
- Obtener tipos del servicio que devuelve `{ income, expense }`; usar el campo `income`.
- Valor por defecto: primer tipo de la lista o `sale` si existe.
- Al enviar acumulación: incluir el tipo seleccionado en la petición (header `x-transaction-type`).
- Campos del formulario: tipo de transacción, documento, valor $, botones Acumular/Limpiar.
- **Lovable propone:** La mejor UX para el selector de tipo (dropdown, chips, tabs, etc.).

**Manejo de errores:** Si falla la carga de tipos, informar al usuario y usar fallback `['sale']`.

---

## 4. Página de Reglas de Bonificación

**Ruta:** `/rules`

**Funcionalidad:** Crear, editar y gestionar reglas de bonificación por tipo de transacción.

### 4.1 Requisitos funcionales (nivel página)

- El usuario debe poder **filtrar/cambiar el tipo de transacción** para ver las reglas de ese tipo.
- Obtener tipos del servicio `{ income, expense }`; usar el campo `income`.
- Al cambiar el tipo, mostrar las reglas correspondientes **sin recargar la página**.
- Obtener reglas por tipo: el servicio de reglas recibe el tipo en la petición.
- **Lovable propone:** La mejor UX para cambiar entre tipos (dropdown, tabs, chips, etc.) y para optimizar carga (caché, lazy load, etc.).

### 4.2 Requisitos funcionales (formulario crear/editar regla)

- El formulario debe permitir **elegir el tipo** de la regla.
- Al crear: valor por defecto = tipo actualmente seleccionado en la página.
- Al editar: valor por defecto = tipo de la regla.
- Al guardar:
  - Mismo tipo: actualizar la regla.
  - Tipo distinto: mover la regla al nuevo tipo (eliminar del actual, añadir al nuevo).
- Al crear en otro tipo: crear la regla en ese tipo y actualizar la vista.
- **Lovable propone:** La mejor UX para el selector de tipo dentro del formulario.

### 4.3 Estructura mínima

- Header: título, botón "Nueva regla".
- Selector de tipo de transacción.
- Tabs: Reglas | Facts.
- Lista de reglas con toggle, editar, eliminar.
- FactsManager para atributos.

---

## 5. Invitación a Lovable

**Objetivo:** Que Lovable proponga la mejor UX para cada contexto.

Al implementar, Lovable debe:

1. **Proponer** el componente y patrón más adecuado para seleccionar tipo de transacción en Administración (tenant) y en Reglas.
2. **Proponer** la mejor UX para gestionar tipos (añadir/quitar) en Administración del Programa.
3. **Optimizar** la experiencia al cambiar entre tipos en Reglas (evitar recargas innecesarias, loading excesivo).
4. **Garantizar** que el formulario de reglas permita elegir tipo y soporte mover reglas entre tipos.
5. **Asegurar** feedback claro en errores (carga de tipos, guardado, validaciones).

---

## 6. Contratos de datos (servicios que el frontend consumirá)

El frontend consumirá servicios existentes. A continuación, los contratos relevantes para implementar la funcionalidad:

| Servicio | Qué devuelve / recibe | Uso |
|----------|------------------------|-----|
| Tipos de transacción | Devuelve `{ income, expense }` | Solo en páginas que no cargan el programa (Administración tenant, Reglas) |
| Configuración del programa | Devuelve/recibe objeto con `transactionsType: { income, expense }` | En Administración del Programa: los tipos vienen aquí; no hace falta llamada adicional |
| Acumulación | Recibe tipo en header `x-transaction-type` | — |
| Reglas | Recibe/envía tipo en la petición para filtrar por tipo | — |

---

## 7. Ejemplo de datos

```json
{
  "income": ["sale", "rule", "promo", "referral"],
  "expense": ["redemption", "gift"]
}
```

En Reglas el frontend usa solo `income`, ya que las reglas de bonificación aplican a acumulación.
