#!/usr/bin/env bash
# Build + publicación de la SPA en S3 Simulith (loyaleasy-dev).
# Ver docs/infrastructure/GUIA-DESPLIEGUE-SIMULITH.md
set -euo pipefail

export MSYS2_ARG_CONV_EXCL="${MSYS2_ARG_CONV_EXCL:-*}"

FRONTEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVERLESS_ROOT="${SERVERLESS_ROOT:-$(cd "$FRONTEND_ROOT/../loyalty-program-serverless" 2>/dev/null && pwd || true)}"
if [[ -n "$SERVERLESS_ROOT" && -f "$SERVERLESS_ROOT/scripts/simulith-env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$SERVERLESS_ROOT/scripts/simulith-env.sh"
fi
ENDPOINT="${ENDPOINT:-${SIMULITH_ENDPOINT:-http://127.0.0.1.sslip.io:4567}}"
SIMULITH_HOST_PORT="${SIMULITH_HOST_PORT:-4567}"
BUCKET="${S3_BUCKET:-loyaleasy-dev}"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

if [[ -z "${AWS_PROFILE:-}" ]]; then
  export AWS_PROFILE=simulith
fi
if [[ -n "$SERVERLESS_ROOT" && -f "$SERVERLESS_ROOT/.aws/config" ]]; then
  export AWS_CONFIG_FILE="${AWS_CONFIG_FILE:-$SERVERLESS_ROOT/.aws/config}"
  export AWS_SHARED_CREDENTIALS_FILE="${AWS_SHARED_CREDENTIALS_FILE:-$SERVERLESS_ROOT/.aws/credentials}"
fi
export AWS_SDK_LOAD_CONFIG=1

AWS_OPTS=(--region "$REGION" --endpoint-url "$ENDPOINT")

echo "=== Deploy frontend Simulith ==="
echo "  Root:     $FRONTEND_ROOT"
echo "  Endpoint: $ENDPOINT"
echo "  Bucket:   s3://$BUCKET"

POOL_ID="${VITE_COGNITO_USER_POOL_ID:-$(aws "${AWS_OPTS[@]}" ssm get-parameter \
  --name /LOYALEASY/DEV/COGNITO_USER_POOL_ID --query Parameter.Value --output text)}"
CLIENT_ID="${VITE_COGNITO_CLIENT_ID:-$(aws "${AWS_OPTS[@]}" ssm get-parameter \
  --name /LOYALEASY/DEV/COGNITO_CLIENT_ID --query Parameter.Value --output text)}"

ENV_FILE="$FRONTEND_ROOT/.env.simulith.local"
# Un solo hostname (SPA + APIs + Cognito) evita CORS en el navegador.
APP_ORIGIN="${APP_ORIGIN:-http://dev.loyaleasy.com:${SIMULITH_HOST_PORT}}"
cat > "$ENV_FILE" <<EOF
# Generado por deploy-frontend-simulith.sh — no commitear
VITE_API_BASE_AUTH=$APP_ORIGIN
VITE_API_BASE_APP=$APP_ORIGIN
VITE_PROGRAM_ID=PCM
VITE_COGNITO_USER_POOL_ID=$POOL_ID
VITE_COGNITO_CLIENT_ID=$CLIENT_ID
VITE_COGNITO_REGION=$REGION
VITE_COGNITO_ENDPOINT=$APP_ORIGIN
EOF
echo "  Env:      $ENV_FILE"

cd "$FRONTEND_ROOT"
if [[ ! -d node_modules ]]; then
  echo "=== npm ci ==="
  npm ci
fi

echo "=== npm run build:simulith ==="
npm run build:simulith

echo "=== aws s3 sync ==="
aws "${AWS_OPTS[@]}" s3 sync ./dist/ "s3://$BUCKET/" --delete

echo ""
echo "=== Listo ==="
echo "  URL:  $APP_ORIGIN/"
echo "  Usuarios: loyalty-program-serverless/docs/infrastructure/SEED_SIMULITH.md"
echo ""
echo "  hosts: 127.0.0.1 dev.loyaleasy.com"
echo "  web/ debe usar dev.simulith.tfvars (alias CloudFront = dev.loyaleasy.com)"
HOST_CHECK="${APP_ORIGIN#http://}"
HOST_CHECK="${HOST_CHECK%%/*}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --resolve "${HOST_CHECK}:127.0.0.1" \
  "${APP_ORIGIN}/" 2>/dev/null || echo "000")
echo "  curl check: HTTP $HTTP_CODE"
