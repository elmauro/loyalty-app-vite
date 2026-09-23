import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

const simulithBackend = process.env.CYPRESS_BACKEND === 'simulith';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVERLESS_ROOT = path.resolve(__dirname, '../loyalty-program-serverless');
const SIMULITH_ENDPOINT = process.env.SIMULITH_ENDPOINT ?? 'http://127.0.0.1.sslip.io:4567';

function simulithAwsEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    AWS_PROFILE: process.env.AWS_PROFILE ?? 'simulith',
    AWS_CONFIG_FILE: process.env.AWS_CONFIG_FILE ?? path.join(SERVERLESS_ROOT, '.aws/config'),
    AWS_SHARED_CREDENTIALS_FILE:
      process.env.AWS_SHARED_CREDENTIALS_FILE ?? path.join(SERVERLESS_ROOT, '.aws/credentials'),
  };
}

function otpDocumentKey(documentNumber: string, identificationTypeId = 1): string {
  return `${identificationTypeId}#${documentNumber}`;
}

function runAwsDynamo(args: string[]): string {
  return execFileSync('aws', args, { encoding: 'utf8', env: simulithAwsEnv() }).trim();
}

export default defineConfig({
  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL ??
      (simulithBackend
        ? 'http://dev.loyaleasy.com:51730'
        : 'http://localhost:51730'),
    env: {
      BACKEND: process.env.CYPRESS_BACKEND ?? 'msw',
    },
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor());

      on('task', {
        getSimulithOtp({
          documentNumber,
          identificationTypeId = 1,
        }: {
          documentNumber: string;
          identificationTypeId?: number;
        }) {
          const key = otpDocumentKey(documentNumber, identificationTypeId);

          try {
            const code = runAwsDynamo([
              '--endpoint-url',
              SIMULITH_ENDPOINT,
              'dynamodb',
              'get-item',
              '--table-name',
              'loyaleasy_otp',
              '--key',
              JSON.stringify({ documentNumber: { S: key } }),
              '--query',
              'Item.code.N',
              '--output',
              'text',
            ]);
            if (!code || code === 'None') {
              throw new Error(`OTP not found for ${key}`);
            }
            return code;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error(`getSimulithOtp failed for ${key}: ${message}`);
          }
        },

        deleteSimulithOtp({
          documentNumber,
          identificationTypeId = 1,
        }: {
          documentNumber: string;
          identificationTypeId?: number;
        }) {
          const key = otpDocumentKey(documentNumber, identificationTypeId);
          runAwsDynamo([
            '--endpoint-url',
            SIMULITH_ENDPOINT,
            'dynamodb',
            'delete-item',
            '--table-name',
            'loyaleasy_otp',
            '--key',
            JSON.stringify({ documentNumber: { S: key } }),
          ]);
          return null;
        },
      });

      return config;
    },
  },
});
