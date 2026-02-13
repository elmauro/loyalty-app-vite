export function getAccumulationErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Solicitud inválida';
      case 401: return 'No autorizado';
      case 403: return 'Acceso denegado';
      case 404: return 'No se pudo completar la operación';
      case 429: return 'Demasiadas solicitudes. Intenta más tarde.';
      default: return 'Ocurrió un error. Intenta nuevamente.';
    }
}