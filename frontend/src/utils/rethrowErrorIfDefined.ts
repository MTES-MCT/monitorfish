export function rethrowErrorIfDefined(error: any): asserts error is null | undefined {
  if (error !== null && error !== undefined) {
    throw error
  }
}
