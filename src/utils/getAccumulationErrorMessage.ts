export function getAccumulationErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Solicitud inválida';
      case 401: return 'No autorizado';
      case 403: return 'Acceso denegado';
      case 404: return 'Recurso no encontrado';
      default: return 'Ocurrió un error. Intenta nuevamente.';
    }
}