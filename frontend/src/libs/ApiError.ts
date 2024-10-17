/* eslint-disable no-console */

/** @deprecated Use `FrontendApiError` class. */
export class ApiError extends Error {
  constructor(message: string, error: any) {
    super(message)

    console.error('message', message)
    console.error('error', error)
    console.groupEnd()
  }
}
