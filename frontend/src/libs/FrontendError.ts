/* eslint-disable no-console */

export class FrontendError extends Error {
  originalError: any | undefined

  constructor(message: string, originalError?: any) {
    super(message)

    this.originalError = originalError
  }
}
