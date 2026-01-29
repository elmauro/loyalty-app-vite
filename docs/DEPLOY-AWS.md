# Despliegue en AWS (S3 + CloudFront + Route 53)

Este proyecto incluye un flujo de GitHub Actions para desplegar la app en una infraestructura AWS: **S3** (bucket privado), **CloudFront**, **ACM** y **Route 53**.

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

**Importante:** no pongas API keys sensibles en variables (son visibles en la UI). Usa **secrets** para `VITE_API_KEY` y datos sensibles.

---

## Permisos IAM del usuario de despliegue

El usuario cuya access key usas en GitHub debe tener al menos:

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

## Resumen de archivos

| Archivo | Descripción |
|---------|-------------|
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | Workflow de GitHub Actions |
| [docs/DEPLOY-AWS.md](DEPLOY-AWS.md) | Esta documentación |
| [.env.example](../.env.example) | Variables de entorno (referencia para builds) |
