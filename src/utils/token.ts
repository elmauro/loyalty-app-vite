// utils/token.ts
export function getAuthToken(): string | null {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData)?.token : null;
}
  