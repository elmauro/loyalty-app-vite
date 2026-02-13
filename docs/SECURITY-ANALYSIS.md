# Análisis de Seguridad - Loyalty App

> Fecha: 9 de febrero de 2025

Este documento contiene los riesgos de seguridad identificados en la aplicación y el plan de acción para su mitigación. Úsalo para seguimiento y trazabilidad.

---

## Riesgos Identificados

### 1. 🔴 CRÍTICO: API Key expuesta en el cliente

**Ubicación:** `src/services/apiConfig.ts`

**Descripción:** La API key tiene un valor por defecto hardcodeado que se incluye en el bundle del cliente. Las variables con prefijo `VITE_` se empaquetan en el JavaScript final y son visibles para cualquier usuario que inspeccione el código fuente en el navegador.

**Impacto:** Cualquiera puede extraer la API key y realizar llamadas no autorizadas al backend.

**Estado:** ⬜ Pendiente

---

### 2. 🔴 CRÍTICO: Tokens en localStorage

**Ubicación:** `src/pages/Login/Login.tsx`, `src/store/AuthContext.tsx`, `src/utils/token.ts`

**Descripción:** El JWT y los datos de autenticación se almacenan en `localStorage`. Este almacenamiento es accesible desde JavaScript, lo que lo hace vulnerable a ataques XSS (si existe alguna vulnerabilidad, un atacante podría robar las credenciales).

**Impacto:** Robo de sesiones, acceso no autorizado a cuentas de usuarios.

**Estado:** ⬜ Pendiente

---

### 3. 🔴 ALTO: Vulnerabilidades en dependencias (npm audit)

**Descripción:** El comando `npm audit` reporta 14 vulnerabilidades (5 low, 3 moderate, 5 high, 1 critical).

| Paquete       | Severidad | Problema                                           |
|---------------|-----------|----------------------------------------------------|
| axios         | Alta      | DoS por falta de verificación de tamaño de datos   |
| react-router  | Alta      | XSS, CSRF, Open Redirects, cache poisoning         |
| form-data     | Crítica   | Función aleatoria insegura para boundary           |
| vite          | Moderada  | Bypass de server.fs.deny en servidor de desarrollo |
| qs            | Alta      | DoS por memory exhaustion                          |
| lodash        | Moderada  | Prototype pollution                                |
| js-yaml       | Moderada  | Prototype pollution                                |

**Impacto:** Explotación de vulnerabilidades conocidas en dependencias.

**Estado:** ⬜ Pendiente

---

### 4. 🟠 ALTO: Autorización basada solo en el cliente

**Ubicación:** `src/routes/ProtectedRoute.tsx`

**Descripción:** La protección de rutas verifica el rol del usuario desde los datos en `localStorage`. Un atacante podría modificar estos datos para acceder a la interfaz de administración (aunque las llamadas API seguirían requiriendo un JWT válido).

**Impacto:** Acceso no autorizado a rutas/UI de administración.

**Estado:** ⬜ Pendiente

---

### 5. 🟡 MODERADO: Validación de entrada limitada

**Ubicación:** Formularios en `Login`, `AccumulationForm`, `RedemptionForm`, `Registration`

**Descripción:**
- Login: solo verifica que los campos no estén vacíos
- Acumulación/Redención: validación mínima de teléfono y valores numéricos
- Registro: validación básica pero sin sanitización profunda

**Impacto:** Posibles inyecciones, datos malformados enviados al backend.

**Mitigaciones aplicadas (feb 2025):** `documentNumber` se valida en frontend y backend (no vacío, trim); Pre Sign-up Lambda en Cognito valida unicidad y documento requerido; expense, income y OTP rechazan documentNumber vacío. **Mensajes genéricos:** registro, OTP y expense/income devuelven mensajes que no revelan si un documento/teléfono/email existe (evita enumeración).

**Estado:** ⬜ Pendiente (sanitización profunda pendiente)

---

### 6. 🟡 MODERADO: Falta de headers de seguridad

**Descripción:** No hay configuración de Content Security Policy (CSP), X-Frame-Options, X-Content-Type-Options, etc. Estos normalmente se configuran en el servidor (CloudFront/S3).

**Impacto:** Mayor superficie de ataque para XSS, clickjacking, MIME sniffing.

**Estado:** ⬜ Pendiente

---

### 7. 🟡 MODERADO: secure: false en proxy de desarrollo

**Ubicación:** `vite.config.ts`

**Descripción:** El proxy de Vite usa `secure: false`, deshabilitando la verificación de certificados SSL. Aceptable para desarrollo local, pero asegurar que nunca se use en build de producción.

**Impacto:** Man-in-the-middle en entorno de desarrollo si se usa incorrectamente.

**Estado:** ⬜ Pendiente (verificar que solo aplique en dev)

---

### 8. 🟢 BAJO: Paths sensibles en código

**Ubicación:** `src/services/axiosInstance.ts`

**Descripción:** Paths como `otp53rv1c3-1`, `income53rv1c3/income` están codificados. Ofuscación por oscuridad.

**Estado:** ⬜ Pendiente (prioridad baja)

---

## Plan de Acción

### Fase 1: Urgente (1-2 semanas)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 1.1 | Rotar la API key actual (puede estar comprometida) | | ⬜ |
| 1.2 | Eliminar valor por defecto de API key en apiConfig.ts; fallar explícitamente si no está definida | | ⬜ |
| 1.3 | Ejecutar `npm audit fix` y resolver vulnerabilidades restantes | | ⬜ |
| 1.4 | Configurar headers de seguridad en CloudFront | | ⬜ |

---

### Fase 2: Corto plazo (2-4 semanas)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 2.1 | Evaluar migrar tokens a cookies httpOnly (requiere cambios en backend) | | ⬜ |
| 2.2 | Implementar validación robusta en formularios | | ⬜ |
| 2.3 | Rate limiting en cliente para login (evitar brute force) | | ⬜ |
| 2.4 | Revisar y endurecer Content Security Policy | | ⬜ |

---

### Fase 3: Medio plazo (1-2 meses)

| # | Acción | Responsable | Estado |
|---|--------|-------------|--------|
| 3.1 | Diseñar arquitectura para que la API key no se exponga al cliente (BFF/proxy) | | ⬜ |
| 3.2 | Integrar npm audit en CI/CD | | ⬜ |
| 3.3 | Auditoría de seguridad externa o pentesting | | ⬜ |
| 3.4 | Implementar refresh tokens y manejo de expiración de sesión | | ⬜ |

---

## Recomendaciones para comenzar

Guía práctica con pasos concretos para ejecutar los cambios. Orden sugerido de implementación.

### 1. Dependencias (empezar aquí — bajo riesgo)

**Tiempo estimado:** ~15 min

```bash
npm audit fix
npm audit   # Verificar qué queda pendiente
```

Si quedan vulnerabilidades, evaluar `npm audit fix --force` (puede introducir breaking changes; revisar changelogs).

---

### 2. API Key — eliminar valor por defecto

**Archivo:** `src/services/apiConfig.ts`

**Cambio sugerido:** Quitar el fallback hardcodeado y exigir la variable de entorno.

```typescript
// Antes:
export const API_KEY = getEnv('VITE_API_KEY', 'XltDmAkEaf73Pa63gQuPD9S8WCr83Ry73LF7g9wz');

// Después:
export const API_KEY = getEnv('VITE_API_KEY', '');
if (!API_KEY && import.meta.env.PROD) {
  console.error('VITE_API_KEY debe estar definida en producción');
}
```

**Preparación:** Asegurar que `.env` y CI/CD (GitHub Actions) definan `VITE_API_KEY` antes del build.

---

### 3. Validación de formularios — mejoras iniciales

**Archivos:** `src/components/AccumulationForm/AccumulationForm.tsx`, `src/components/RedemptionForm/RedemptionForm.tsx`

**Recomendaciones:**

- **Teléfono:** Validar longitud (ej. 10–15 dígitos) y solo números.
- **Valor/Puntos:** Límites mínimos y máximos, rechazar negativos.
- **Login:** Límite de longitud en campos (ej. 100 caracteres).

Ejemplo para teléfono:

```typescript
const digits = phoneNumber.replace(/\D/g, '');
if (digits.length < 10 || digits.length > 15) {
  toast.error('Número de teléfono inválido');
  return;
}
```

---

### 4. Headers de seguridad en CloudFront

**Dónde:** Consola AWS → CloudFront → Distribution → Behaviors → Response Headers Policy (o crear una nueva).

**Headers recomendados:**

| Header | Valor sugerido |
|--------|----------------|
| `X-Frame-Options` | `DENY` o `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Empezar restrictivo y ajustar según la app |

Ver documentación de AWS para Response Headers Policy.

---

### 5. Rate limiting en login (cliente)

**Archivo:** `src/pages/Login/Login.tsx`

**Idea:** Contar intentos fallidos y bloquear temporalmente (ej. 5 intentos → esperar 60 s).

- Guardar contador y timestamp en `sessionStorage`.
- Mostrar mensaje del tipo: "Demasiados intentos. Intenta de nuevo en X segundos."

---

### 6. npm audit en CI/CD

**Archivo:** `.github/workflows/deploy.yml` (o crear uno nuevo para CI)

**Añadir paso antes del build:**

```yaml
- name: Security audit
  run: npm audit --audit-level=high
```

Configurar para que falle el pipeline si hay vulnerabilidades de nivel high o critical.

---

### Orden de prioridad sugerido

1. **Dependencias** — sin cambios de negocio.
2. **API Key** — requiere definir la variable en .env/CI.
3. **Validación** — mejoras incrementales en formularios.
4. **CloudFront headers** — requiere acceso a AWS.
5. **Rate limiting** — mejora defensiva en login.
6. **CI/CD audit** — automatización de seguridad.

---

## Comandos Útiles

```bash
# Verificar vulnerabilidades
npm audit

# Intentar corrección automática
npm audit fix

# Corrección incluyendo actualizaciones breaking
npm audit fix --force
```

---

## Leyenda de Estados

- ⬜ Pendiente
- 🟦 En progreso
- ✅ Completado

---

## Historial de Cambios

| Fecha | Descripción |
|-------|-------------|
| 2025-02-09 | Documento inicial - Análisis de seguridad completo |
| 2025-02-09 | Añadida sección "Recomendaciones para comenzar" con pasos concretos |
