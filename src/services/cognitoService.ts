/**
 * Servicio de autenticación con Amazon Cognito (amazon-cognito-identity-js).
 * Wrappers con Promises para signUp, signIn, forgotPassword, changePassword, etc.
 */
import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import {
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  COGNITO_REGION,
  isCognitoEnabled,
  PROGRAM_ID,
} from './apiConfig';
import { formatPhoneWithCountryCode } from '@/utils/formatPhone';

function getPool(): CognitoUserPool {
  if (!isCognitoEnabled()) {
    throw new Error('Cognito no está configurado (VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID)');
  }
  return new CognitoUserPool({
    UserPoolId: COGNITO_USER_POOL_ID,
    ClientId: COGNITO_CLIENT_ID,
  });
}

function getCognitoUser(username: string): CognitoUser {
  const pool = getPool();
  return new CognitoUser({
    Username: username,
    Pool: pool,
  });
}

/** Registro de usuario */
export async function signUp(params: {
  email: string;
  password: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  /** Tipo identificación: 1 = Cédula de Ciudadanía. Default 1 */
  identTypeId?: string;
  /** Número de documento (requerido, no puede estar vacío) */
  docNumber?: string;
  /** Programa (default: VITE_PROGRAM_ID) */
  programId?: string;
  /** Es cliente: 1 = sí. Default 1 */
  isCustomer?: string;
  /** Términos aceptados: 1 = sí, 0 = no. Default según formulario */
  termsaccepted?: string;
  /** Rol: 2 = cliente. Default 2 */
  roles?: string;
}): Promise<{ userSub: string; userConfirmed: boolean }> {
  const pool = getPool();
  const attributes: CognitoUserAttribute[] = [
    new CognitoUserAttribute({ Name: 'email', Value: params.email }),
    // email_verified: atributo inmutable, Cognito lo pone en true al confirmar con el código
  ];
  if (params.givenName) {
    attributes.push(new CognitoUserAttribute({ Name: 'given_name', Value: params.givenName }));
  }
  if (params.familyName) {
    attributes.push(new CognitoUserAttribute({ Name: 'family_name', Value: params.familyName }));
  }
  if (params.phoneNumber) {
    // Cognito exige formato E.164: +[código país][número]
    const e164 = `+${formatPhoneWithCountryCode(params.phoneNumber)}`;
    attributes.push(new CognitoUserAttribute({ Name: 'phone_number', Value: e164 }));
  }

  const docTrimmed = (params.docNumber ?? '').trim();
  if (!docTrimmed) {
    throw new Error('DOCUMENT_REQUIRED');
  }

  // Atributos custom (deben existir en el User Pool de Cognito)
  const customAttrs: Array<[string, string]> = [
    ['custom:identTypeId', params.identTypeId ?? '1'],
    ['custom:docNumber', docTrimmed],
    ['custom:programId', params.programId ?? PROGRAM_ID],
    ['custom:isCustomer', params.isCustomer ?? '1'],
    ['custom:termsaccepted', params.termsaccepted ?? '0'],
    ['custom:roles', params.roles ?? '2'],
  ];
  for (const [name, value] of customAttrs) {
    if (value !== '') {
      attributes.push(new CognitoUserAttribute({ Name: name, Value: value }));
    }
  }

  return new Promise((resolve, reject) => {
    pool.signUp(params.email, params.password, attributes, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result) {
        reject(new Error('No result from signUp'));
        return;
      }
      resolve({
        userSub: result.userSub,
        userConfirmed: result.userConfirmed,
      });
    });
  });
}

/** Confirmar registro con código enviado por email */
export async function confirmSignUp(email: string, code: string): Promise<void> {
  const cognitoUser = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Reenviar código de confirmación */
export async function resendConfirmationCode(email: string): Promise<void> {
  const cognitoUser = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/** Iniciar sesión - retorna IdToken para enviar al backend */
export async function signIn(email: string, password: string): Promise<string> {
  const cognitoUser = getCognitoUser(email);
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        resolve(idToken);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(new Error('NEW_PASSWORD_REQUIRED'));
      },
      mfaRequired: () => {
        reject(new Error('MFA_REQUIRED'));
      },
    });
  });
}

/** Solicitar recuperación de contraseña (envía código al email) */
export async function forgotPassword(email: string): Promise<void> {
  const cognitoUser = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Confirmar nueva contraseña con el código recibido */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  const cognitoUser = getCognitoUser(email);
  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

/** Cambiar contraseña (usuario autenticado) */
export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const cognitoUser = getCognitoUser(email);
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: oldPassword,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => {
        cognitoUser.changePassword(oldPassword, newPassword, (err) => {
          if (err) reject(err);
          else resolve();
        });
      },
      onFailure: (err) => reject(err),
    });
  });
}

/** Usuario actual en sesión (si existe) */
export function getCurrentUser(): CognitoUser | null {
  if (!isCognitoEnabled()) return null;
  const pool = getPool();
  return pool.getCurrentUser();
}

/** Cerrar sesión en Cognito */
export function signOut(): void {
  if (!isCognitoEnabled()) return;
  const user = getCurrentUser();
  if (user) {
    user.signOut();
  }
}

export { isCognitoEnabled, COGNITO_REGION };
