# Datos de ciudades de Colombia

> Fecha: 13 de marzo de 2025

Este documento describe el origen, estructura y uso de los datos de departamentos y ciudades de Colombia en el frontend. Sirve como referencia para mantenimiento y para futura migración a un servicio API.

---

## 1. Ubicación y propósito

| Elemento | Ubicación |
|----------|------------|
| **Datos** | `src/data/colombia-cities.js` |
| **Tipos** | `src/data/colombia-cities.d.ts` |
| **Uso** | `src/components/program/TenantOfficesDialog.tsx` (selector de ciudad al crear/editar oficinas) |

**Propósito:** Proporcionar un selector de ciudades agrupado por departamento en el formulario de oficinas (Administración del Programa → Aliados → Oficinas). El backend espera `cityId` como número (código DANE).

---

## 2. Estructura de datos

### 2.1 Fuente

Los códigos siguen la **Codificación Divipola** del DANE (División Político Administrativa de Colombia):

- **Departamento:** código de 2 dígitos (ej. 05 = Antioquia, 11 = Bogotá D.C.)
- **Municipio:** código de 5 dígitos (ej. 05001 = Medellín, 11001 = Bogotá, D.C.)

Referencia: [DANE - Divipola](https://www.dane.gov.co/index.php/sistema-estadistico-nacional-sen/normas-y-estandares/nomenclaturas-y-clasificaciones/nomenclaturas/codificacion-de-la-division-politico-administrativa-de-colombia-divipola)

### 2.2 Formato

```javascript
// Estructura de colombiaDepartments
[
  {
    id: 11,           // Código departamento
    name: 'Bogotá D.C.',
    cities: [
      { id: 11001, name: 'Bogotá, D.C.' }
    ]
  },
  {
    id: 5,
    name: 'Antioquia',
    cities: [
      { id: 5001, name: 'Medellín' },
      { id: 5411, name: 'Envigado' },
      // ...
    ]
  },
  // ... 32 departamentos
]
```

### 2.3 Exports

| Export | Descripción |
|--------|-------------|
| `colombiaDepartments` | Array de departamentos con sus ciudades |
| `allCities` | Array plano de todas las ciudades (incluye `departmentName`) |
| `getCityById(cityId)` | Busca una ciudad por su id. Retorna `undefined` si no existe |

---

## 3. Cobertura actual

- **32 departamentos** + Bogotá D.C.
- **Capitales** de cada departamento
- **Ciudades principales** en departamentos más poblados (Antioquia, Valle, Atlántico, Santander, etc.)

No incluye los ~1.100 municipios completos. Para ampliar la lista, consultar [Datos Abiertos Colombia - Divipola](https://www.datos.gov.co/Mapas-Nacionales/Departamentos-y-municipios-de-Colombia/xdk5-pm3f/data) o el Geoportal del DANE.

---

## 4. Uso en el frontend

1. **Formulario de oficina:** El `TenantOfficesDialog` usa un `Select` agrupado por departamento. El valor seleccionado (`cityId`) se envía al backend en `addOfficeByTenant` y `updateOfficeByTenant`.

2. **Tabla de oficinas:** La columna "Ciudad" muestra `getCityById(o.cityId)?.name ?? o.cityId` para mostrar el nombre en lugar del código.

3. **Valor por defecto:** Bogotá, D.C. (11001) al crear una nueva oficina.

---

## 5. Migración futura a servicio API

Cuando se implemente un servicio para consultar departamentos y ciudades:

1. **Crear** un servicio (ej. `cityService.ts`) que consuma el API.
2. **Mantener** la misma estructura de respuesta (`colombiaDepartments` o equivalente).
3. **Reemplazar** el import estático en `TenantOfficesDialog` por una llamada al servicio (con loading y caché si aplica).
4. **Preservar** `getCityById` para búsquedas por id (o moverla al servicio).
5. **Deprecar** `src/data/colombia-cities.js` una vez migrado.

El contrato del backend (`cityId: number`) no cambia; solo la fuente de los datos.

---

## 6. Mantenimiento

| Tarea | Acción |
|-------|--------|
| Añadir municipios | Editar `colombia-cities.js`, añadir al array `cities` del departamento correspondiente |
| Corregir nombres | Actualizar el campo `name` en el objeto de la ciudad |
| Verificar códigos DANE | Consultar Divipola o Datos Abiertos Colombia |
| Actualizar tipos | Si se añaden campos, actualizar `colombia-cities.d.ts` |

---

## Historial de cambios

| Fecha | Descripción |
|-------|-------------|
| 2025-03-13 | Documento inicial - Datos de ciudades para selector de oficinas |
