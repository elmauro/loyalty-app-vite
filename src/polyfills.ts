// Polyfills para paquetes Node que asumen un entorno browser-compatible.
// buffer (usado por amazon-cognito-identity-js) usa "global", que existe en Node pero no en el navegador.
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}
