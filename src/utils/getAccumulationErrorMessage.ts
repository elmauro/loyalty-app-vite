export function getAccumulationErrorMessage(status: number, errorData?: { error?: string }): string {
    if (status === 400 && errorData?.error?.toLowerCase().includes('tenant')) {
      return 'No tienes un tenant asignado. Inicia sesión con un usuario que tenga oficina/tenant configurado.';
    }
    switch (status) {
      case 400: return 'Solicitud inválida';
      case 401: return 'No autorizado';
      case 403: return 'Acceso denegado';
      case 404: return 'No se pudo completar la operación';
      case 429: return 'Demasiadas solicitudes. Intenta más tarde.';
      default: return 'Ocurrió un error. Intenta nuevamente.';
    }
}