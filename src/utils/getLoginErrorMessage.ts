export function getLoginErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Credenciales inválidas';
      case 403: return 'Acceso prohibido';
      case 404: return 'Usuario no encontrado';
      default: return 'Error desconocido. Intenta nuevamente.';
    }
}  