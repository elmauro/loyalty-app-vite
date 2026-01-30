/**
 * Extracts HTTP status code from an unknown error (e.g. Axios error).
 * Returns undefined if the error has no response status.
 */
export function getErrorStatus(err: unknown): number | undefined {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    typeof (err as { response?: { status?: unknown } }).response?.status === 'number'
  ) {
    return (err as { response: { status: number } }).response.status;
  }
  return undefined;
}
