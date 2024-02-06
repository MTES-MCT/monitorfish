export function rethrowErrorIfDefined(error: any): void {
  if (error !== null && error !== undefined) {
    throw error
  }
}
