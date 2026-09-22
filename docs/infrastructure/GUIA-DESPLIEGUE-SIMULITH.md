# Despliegue del frontend en Simulith (local)

SPA React/Vite servida desde **S3 + CloudFront simulados** en Simulith.

> **Un solo hostname:** SPA, APIs y Cognito usan **`dev.loyaleasy.com:4567`** (instancia Loyaleasy; dev Simulith repo usa `:4566`). En Simulith, el módulo `web/` debe aplicarse con **`dev.simulith.tfvars`** (no `dev.tfvars`, que apunta a `dev.points.loyaleasy.com` en AWS). Usar dos hostnames distintos provoca **CORS** en el login Cognito desde el navegador.

> **Prerrequisitos (en orden):**
> 1. [Infra Terraform](../../../loyalty-program-serverless/docs/infrastructure/GUIA_DESPLIEGUE_SIMULITH.md) pasos 0–11
> 2. [Seed DynamoDB + usuarios](../../../loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md)
> 3. [Backend Serverless](../../../loyalty-program-serverless/docs/infrastructure/GUIA_DESPLIEGUE_BACKEND_SIMULITH.md) B1–B11

---

## Mapa del stack local

```
Simulith :4567 (Loyaleasy)
├── S3 loyaleasy-dev/          ← esta guía (SPA estática)
├── API Gateway dev.loyaleasy.com  ← backend Serverless
├── Cognito User Pool          ← bootstrap 3 usuarios
└── DynamoDB loyaleasy_*       ← seed-simulith.sh
```

---

## Antes de empezar

| Requisito | Check |
| --- | --- |
| Simulith Loyaleasy en `:4567` | `source ../loyalty-program-serverless/scripts/simulith-env.sh && curl -s "$ENDPOINT/health"` |
| Infra `web/` aplicada | bucket `loyaleasy-dev` existe |
| Backend desplegado | auth-api + APIs que vayas a probar |
| Seed usuarios (3 roles) | [SEED_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md) |
| Node.js 20 | `node -v` |
| Entrada hosts | `127.0.0.1 dev.loyaleasy.com` |
| CloudFront alias | `dev.loyaleasy.com` (`web/dev.simulith.tfvars`) |

---

## Sesión Git Bash (cada terminal nueva)

```bash
cd /c/Projects/loyalty-app-ui-vite/loyalty-app-vite

export AWS_PROFILE=simulith
export AWS_SDK_LOAD_CONFIG=1
export AWS_DEFAULT_REGION=us-east-1
export AWS_CONFIG_FILE="/c/Projects/loyalty-app-ui-vite/loyalty-program-serverless/.aws/config"
export AWS_SHARED_CREDENTIALS_FILE="/c/Projects/loyalty-app-ui-vite/loyalty-program-serverless/.aws/credentials"
export MSYS2_ARG_CONV_EXCL="*"
source /c/Projects/loyalty-app-ui-vite/loyalty-program-serverless/scripts/simulith-env.sh

unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_ENDPOINT_URL
```

---

## Opción A — Script automatizado (recomendado)

Desde la raíz de `loyalty-app-vite`:

```bash
# Sesión de arriba
npm run deploy:simulith
```

El script `scripts/deploy-frontend-simulith.sh`:

1. Lee `COGNITO_USER_POOL_ID` y `COGNITO_CLIENT_ID` desde SSM
2. Genera `.env.simulith.local`
3. Ejecuta `npm run build:simulith`
4. Sincroniza `dist/` → `s3://loyaleasy-dev/`

---

## Opción B — Paso a paso manual

### F0 — CloudFront alias (Simulith, una vez)

Si aplicaste `web/` con `dev.tfvars`, CloudFront apunta a `dev.points.loyaleasy.com` y el login falla por CORS. Re-aplica con el tfvars de Simulith:

```bash
cd /c/Projects/loyalty-app-ui-vite/loyalty-program-serverless/infrastructure/web
terraform init -backend-config=../backend.simulith.hcl -reconfigure
terraform apply -var-file=dev.simulith.tfvars -parallelism=1
```

Esto cambia el alias CloudFront a **`dev.loyaleasy.com`** (mismo host que API Gateway y Cognito).

Si falla con `UpdateOriginAccessControl ... 404` (límite Simulith), recrea OAC y distribución:

```bash
terraform apply -var-file=dev.simulith.tfvars -parallelism=1 \
  -replace='aws_cloudfront_origin_access_control.oac["dev"]' \
  -replace='aws_cloudfront_distribution.cdn["dev"]'
```

### F1 — Hosts (Windows, una vez)

Archivo: `C:\Windows\System32\drivers\etc\hosts`

```text
127.0.0.1 dev.loyaleasy.com
```

### F2 — IDs de Cognito (SSM)

```bash
source /c/Projects/loyalty-app-ui-vite/loyalty-program-serverless/scripts/simulith-env.sh

POOL_ID=$(aws --endpoint-url "$ENDPOINT" ssm get-parameter \
  --name /LOYALEASY/DEV/COGNITO_USER_POOL_ID --query Parameter.Value --output text)
CLIENT_ID=$(aws --endpoint-url "$ENDPOINT" ssm get-parameter \
  --name /LOYALEASY/DEV/COGNITO_CLIENT_ID --query Parameter.Value --output text)

echo "POOL_ID=$POOL_ID"
echo "CLIENT_ID=$CLIENT_ID"
```

### F3 — Variables de entorno (build)

Copia `env.simulith.example` → `.env.simulith.local` y sustituye los IDs:

```bash
cp env.simulith.example .env.simulith.local
# Editar .env.simulith.local con POOL_ID y CLIENT_ID
```

Contenido de referencia:

```env
VITE_API_BASE_AUTH=http://dev.loyaleasy.com:4567
VITE_API_BASE_APP=http://dev.loyaleasy.com:4567
VITE_PROGRAM_ID=PCM
VITE_COGNITO_USER_POOL_ID=<POOL_ID>
VITE_COGNITO_CLIENT_ID=<CLIENT_ID>
VITE_COGNITO_REGION=us-east-1
VITE_COGNITO_ENDPOINT=http://dev.loyaleasy.com:4567
```

> Vite carga `.env.simulith.local` cuando usas `--mode simulith`.

### F4 — Instalar dependencias y build

```bash
cd /c/Projects/loyalty-app-ui-vite/loyalty-app-vite
npm ci
npm run build:simulith
```

Verificar que existe `dist/index.html`.

### F5 — Publicar en S3 (Simulith)

```bash
aws --endpoint-url "$ENDPOINT" s3 sync ./dist/ s3://loyaleasy-dev/ --delete
```

**Verificar bucket:**

```bash
aws --endpoint-url "$ENDPOINT" s3 ls s3://loyaleasy-dev/ | head
```

### F6 — Probar en el navegador

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://dev.loyaleasy.com:4567/
# Esperado: 200
```

Abrir **http://dev.loyaleasy.com:4567/** e iniciar sesión:

| Rol | Email | Contraseña | Ruta tras login |
| --- | --- | --- | --- |
| Tenant Admin | `tenant.admin@loyaleasy.test` | `Test1234!` | `/administration` |
| Program Admin | `program.admin@loyaleasy.test` | `Test1234!` | `/program-administration` |
| Customer | `customer@loyaleasy.test` | `Test1234!` | `/user` |

(Usuarios creados por `bootstrap-test-users-simulith.sh` — ver [SEED_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md).)

---

## Desarrollo con Vite dev server (alternativa)

Para iterar UI sin subir a S3 en cada cambio:

```bash
cp env.simulith.example .env.simulith.local
# Completar Cognito IDs
npm run dev
```

Abrir `http://127.0.0.1:51730` (proxy Vite). Para paridad con producción local usa **Opción A/B** (S3 + dominio custom).

---

## Problemas frecuentes

| Síntoma | Solución |
| --- | --- |
| **Network error / CORS** en login | SPA y Cognito deben compartir **`dev.loyaleasy.com`** — re-aplicar `web/` con `dev.simulith.tfvars`, no abrir `dev.points.loyaleasy.com` |
| Login Cognito falla | `VITE_COGNITO_ENDPOINT` = mismo origen que la SPA (`http://dev.loyaleasy.com:4567`) |
| APIs 404 | Backend no desplegado o URL base incorrecta en `.env.simulith.local` |
| SPA 404 en rutas (`/administration`) | Re-sync S3; CloudFront custom errors sirven `index.html` |
| Build sin Cognito | `.env.simulith.local` ausente o modo incorrecto — usar `build:simulith` |

---

## Referencias

| Tema | Ubicación |
| --- | --- |
| Seed 3 usuarios | [SEED_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md) |
| Backend Simulith | [GUIA_DESPLIEGUE_BACKEND_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/GUIA_DESPLIEGUE_BACKEND_SIMULITH.md) |
| Infra Terraform | [GUIA_DESPLIEGUE_SIMULITH.md](../../../loyalty-program-serverless/docs/infrastructure/GUIA_DESPLIEGUE_SIMULITH.md) |
| Plantilla env | `env.simulith.example` |
| Script deploy | `scripts/deploy-frontend-simulith.sh` |
| AWS producción | [GUIA-DESPLIEGUE-AWS-FRONTEND.md](GUIA-DESPLIEGUE-AWS-FRONTEND.md) |
