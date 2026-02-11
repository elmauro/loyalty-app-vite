# Despliegue en AWS (S3 + CloudFront + Route 53)

Este proyecto incluye un flujo de GitHub Actions para desplegar la app en una infraestructura AWS: **S3** (bucket privado), **CloudFront**, **ACM** y **Route 53**.

---

## Pasos para configurar GitHub Actions

### 1. Usuario IAM en AWS

1. En **AWS Console** → **IAM** → **Users** → **Create user** (o usa uno existente).
2. Asigna una política que permita S3 (tu bucket) y CloudFront (invalidaciones). Ejemplo mínimo:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::TU-BUCKET",
        "arn:aws:s3:::TU-BUCKET/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::CUENTA:distribution/TU-DISTRIBUTION-ID"
    }
  ]
}
```

Sustituye `TU-BUCKET`, `CUENTA` y `TU-DISTRIBUTION-ID`.

### 2. Access key para el usuario

1. **IAM** → **Users** → tu usuario → **Security credentials**.
2. **Access keys** → **Create access key**.
3. Elige **Application running outside AWS** (u otra opción según tu caso).
4. Guarda **Access key ID** y **Secret access key** (esta última solo se muestra una vez).

### 3. Secrets en GitHub

1. Abre tu **repositorio** en GitHub.
2. **Settings** → **Secrets and variables** → **Actions**.
3. Pestaña **Secrets** → **New repository secret**.
4. Crea estos cuatro secrets (nombre exacto, valor tal cual):

| Secret | Valor |
|--------|--------|
| `AWS_ACCESS_KEY_ID` | Access key ID del paso 2 |
| `AWS_SECRET_ACCESS_KEY` | Secret access key del paso 2 |
| `S3_BUCKET` | Nombre del bucket S3 (ej. `mi-app-frontend`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront (ej. `E1ABC2DEF3GHI`) |

### 4. Variables (opcionales)

En **Settings** → **Secrets and variables** → **Actions** → pestaña **Variables**:

- **`AWS_REGION`**: región del bucket (ej. `us-east-1`). Si no la defines, se usa `us-east-1`.

Si en producción usas otras URLs o API keys, puedes añadir variables o secrets `VITE_*` (ver [Variables/Secrets para build](#variablessecrets-para-build-opcionales)). Para datos sensibles usa **secrets**, no variables.

### 5. Subir el workflow y probar

1. Asegúrate de que el archivo `.github/workflows/deploy.yml` está en el repo (en la rama que uses).
2. **Opción A – Manual:** **Actions** → **Deploy to AWS** → **Run workflow** → elige la rama → **Run workflow**.
3. **Opción B – Automático:** haz push a `main` o `master`; el workflow se ejecutará al detectar el push.

### 6. Revisar la ejecución

1. **Actions** → **Deploy to AWS** → abre la última ejecución.
2. Revisa el job **Build & Deploy**. Si algo falla, haz clic en el step que pone en rojo y revisa el log.
3. Errores frecuentes:
   - **Secrets no configurados:** comprueba que los cuatro secrets existen y no tienen espacios extra.
   - **Permisos IAM:** verifica la política del usuario (S3 + CloudFront).
   - **Bucket o distribución incorrectos:** confirma `S3_BUCKET` y `CLOUDFRONT_DISTRIBUTION_ID`.

Cuando el workflow termine en verde, el build estará en S3 y CloudFront invalidado. Comprueba tu dominio (Route 53) o la URL de la distribución.

---

## Flujo de despliegue

- **Trigger:** push a `main` o `master`, o ejecución manual (`workflow_dispatch`).
- **Pasos:** checkout → `npm ci` → `npm run build` → sync `dist/` a S3 → invalidación de caché en CloudFront.

El workflow está en [.github/workflows/deploy.yml](../.github/workflows/deploy.yml).

---

## Secrets y variables en GitHub

En el repositorio: **Settings → Secrets and variables → Actions**.

### Secrets (obligatorios)

| Secret | Descripción |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Access key de un usuario IAM con permisos sobre S3 y CloudFront |
| `AWS_SECRET_ACCESS_KEY` | Secret key asociada |
| `S3_BUCKET` | Nombre del bucket S3 donde se sube el build |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront |

### Variables (opcionales)

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `AWS_REGION` | Región AWS | `us-east-1` |

### Variables/Secrets para build (opcionales)

Si quieres override de env en producción, define **variables** o **secrets** con los nombres `VITE_*` (por ejemplo `VITE_API_BASE_AUTH`, `VITE_API_BASE_APP`, etc.). Ver [.env.example](../.env.example). Si no defines nada, se usan los fallbacks de `apiConfig.ts`.

**Para Cognito (login/registro/recuperación de contraseña):** define `VITE_COGNITO_USER_POOL_ID` y `VITE_COGNITO_CLIENT_ID` (y opcionalmente `VITE_COGNITO_REGION`). Sin ellos, el frontend usa solo el flujo tradicional (login con documento). Usa **secrets** para estos valores.

**Importante:** no pongas API keys sensibles en variables (son visibles en la UI). Usa **secrets** para `VITE_API_KEY` y datos sensibles.

---

## Permisos IAM del usuario de despliegue

El usuario cuya access key usas en GitHub debe tener al menos la siguiente política (ya referenciada en el **paso 1** de [Pasos para configurar GitHub Actions](#pasos-para-configurar-github-actions)):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::TU-BUCKET",
        "arn:aws:s3:::TU-BUCKET/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::CUENTA:distribution/TU-DISTRIBUTION-ID"
    }
  ]
}
```

Sustituye `TU-BUCKET`, `CUENTA` y `TU-DISTRIBUTION-ID` por tus valores.

---

## Configuración de S3 y CloudFront

### S3

- Bucket **privado** (sin acceso público).
- CloudFront accede vía **Origin Access Control (OAC)** o **Origin Access Identity (OAI)**.
- El workflow hace `aws s3 sync dist/ s3://...` y `aws s3 cp dist/index.html ...`; no se configura bloqueo de acceso público en el workflow.

### CloudFront

- **Origin:** tu bucket S3 (OAC/OAI configurado).
- **Alternate domain (CNAME):** el dominio de Route 53 (p. ej. `app.ejemplo.com`).
- **Certificado ACM:** asociado a ese dominio.
- **Error pages (SPA):** para que el enrutado del cliente funcione, configura respuestas de error personalizadas:
  - **403** → código 200, respuesta `/index.html`
  - **404** → código 200, respuesta `/index.html`

Así, rutas como `/login` o `/user` sirven `index.html` y React Router las maneja.

### Route 53

- Registra un **registro A** (o AAAA) **alias** apuntando a la distribución de CloudFront.  
- Opcional: CNAME al dominio de CloudFront si no usas alias.

---

## Caché

- **`index.html`:** `Cache-Control: public, max-age=0, must-revalidate` (siempre se revalida).
- **Assets con hash** (p. ej. `assets/index-xxx.js`): `Cache-Control: public, max-age=31536000, immutable`.
- Tras cada deploy se lanza una **invalidación** `/*` en CloudFront para que los edge actualicen el contenido de inmediato.

---

## Cómo ejecutar el despliegue

1. **Automático:** push a `main` o `master`.
2. **Manual:** **Actions → Deploy to AWS → Run workflow.**

Si faltan secrets obligatorios, el workflow fallará; revisa el job **Build & Deploy** en la pestaña Actions.

---

## Qué revisar en AWS cuando falla el deploy

Si el workflow llega a ejecutarse pero falla con *Internal server error* o errores de S3/CloudFront, revisa en AWS lo siguiente.

### 1. IAM (usuario de la access key)

- **Access key activa:** IAM → Users → tu usuario → Security credentials → Access keys. La key usada en GitHub no debe estar *Inactive* ni eliminada.
- **Permisos:** La política del usuario debe incluir al menos `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket` sobre tu bucket y `cloudfront:CreateInvalidation` (y opcionalmente `cloudfront:GetInvalidation`) sobre tu distribución. Ver [Permisos IAM del usuario de despliegue](#permisos-iam-del-usuario-de-despliegue).
- **Recursos correctos:** Los ARN de la política deben usar el mismo **nombre de bucket** que el secret `S3_BUCKET` y el mismo **distribution ID** que `CLOUDFRONT_DISTRIBUTION_ID`.

### 2. S3

- **Bucket existe** y el nombre coincide exactamente con el secret `S3_BUCKET` (sin espacios, mismo valor).
- **Región:** El bucket está en la región que usas en el workflow (por defecto `us-east-1` si no defines `AWS_REGION`).
- **OAC/OAI:** Si el bucket es privado, CloudFront debe tener configurado Origin Access Control (OAC) o Origin Access Identity (OAI) y el bucket policy debe permitir el acceso desde esa identidad. El deploy solo escribe en S3; este punto afecta a que la web se sirva bien, no al fallo del *sync*.

### 3. CloudFront

- **Distribución existe** y el **Distribution ID** (ej. `E1ABC2DEF3GHI`) coincide con el secret `CLOUDFRONT_DISTRIBUTION_ID`.
- **Límite de invalidaciones:** Solo pueden existir **3 invalidaciones en curso** a la vez. Si hay invalidaciones anteriores atascadas o muchas seguidas, una nueva puede fallar. En CloudFront → tu distribución → Invalidations: revisa si hay varias "In progress" y espera a que terminen antes de volver a desplegar.
- **Estado:** La distribución debe estar *Deployed*; si está en *In progress* por un cambio reciente, en raros casos puede afectar.

### 4. Errores y logs (opcional)

- **CloudWatch:** Si tienes logging de S3 o CloudFront, revisa si en la hora del deploy aparecen 5xx o errores de acceso.
- **IAM:** En IAM → Users → tu usuario → Access Advisor (o en CloudTrail) puedes ver si hubo llamadas denegadas a S3 o CloudFront en el momento del fallo.

### 5. Resumen rápido

| Revisión | Dónde |
|----------|--------|
| Access key activa y política con S3 + CloudFront | IAM → Users → Security credentials / Permissions |
| Nombre del bucket = `S3_BUCKET` | S3 → Buckets |
| Distribution ID = `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront → Distributions |
| Menos de 3 invalidaciones en curso | CloudFront → Invalidations |

---

## Cómo comprobar en AWS si la sincronización se ejecutó

Cuando un run del workflow falla (timeout, *Internal server error*, etc.), puedes comprobar en AWS si el job llegó a ejecutar el *sync* a S3 y la invalidación en CloudFront.

### 1. S3: fecha de última modificación

- **Consola:** S3 → tu bucket → abre la carpeta raíz y revisa la columna **Last modified** de `index.html` y de algunos archivos en `assets/`.
- **Qué indica:** Si la fecha/hora coincide con el momento de un **run fallido**, la sincronización sí se ejecutó (el fallo fue después, p. ej. en la invalidación o por timeout). Si la última modificación es de un **run exitoso** anterior (p. ej. "Add pagination to history component"), el run fallido **no llegó** al paso de S3 (por ejemplo, se quedó sin runner o hizo timeout antes).
- **CLI (opcional):**  
  `aws s3 ls s3://TU-BUCKET/ --recursive | head -20`  
  para ver fechas de los objetos.

### 2. CloudFront: historial de invalidaciones

- **Consola:** CloudFront → Distributions → tu distribución → pestaña **Invalidations**.
- **Qué indica:** Cada deploy exitoso crea una invalidación con path `/*`. Revisa la columna **Create time** y **Status**.
  - Si la invalidación más reciente es de hace días (cuando el último deploy en verde fue exitoso) y **no** hay una nueva invalidación en la hora del run fallido, ese run **no llegó** al paso "Invalidate CloudFront" (falló antes: sin runner, timeout en build o en S3, etc.).
  - Si aparece una invalidación nueva en la hora del fallo, el sync a S3 sí se completó y el fallo fue en o después de la invalidación (o la invalidación se creó pero el job falló por otro motivo).

### 3. Resumen rápido

| Si quieres saber… | Dónde mirar en AWS |
|------------------|--------------------|
| Si el *sync* a S3 se ejecutó en el run fallido | S3 → bucket → *Last modified* de `index.html` y assets |
| Si la invalidación se llegó a lanzar | CloudFront → tu distribución → Invalidations → *Create time* |

Con esto puedes distinguir si el fallo fue **antes** de tocar AWS (sin runner, timeout en build) o **durante** S3/CloudFront (sync o invalidación).

### 4. Opcional: CloudTrail

Si tienes **CloudTrail** con eventos de datos de S3 (y/o CloudFront) habilitados, en la consola de CloudTrail puedes filtrar por:
- **Event source:** `s3.amazonaws.com` (operaciones como `PutObject`, `DeleteObject`, `ListBucket`) y/o `cloudfront.amazonaws.com` (`CreateInvalidation`).
- **Time range:** la hora del run fallido.
- **User:** el usuario IAM que usa la access key del deploy.

Así ves si en ese intervalo hubo llamadas desde GitHub Actions a S3 y CloudFront; si no hay ninguna, el job no llegó a esos pasos.

---

## Resumen de archivos

| Archivo | Descripción |
|---------|-------------|
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | Workflow de GitHub Actions |
| [docs/DEPLOY-AWS.md](DEPLOY-AWS.md) | Esta documentación |
| [.env.example](../.env.example) | Variables de entorno (referencia para builds) |
