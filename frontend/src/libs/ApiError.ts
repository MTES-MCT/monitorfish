/* eslint-disable no-console */

export class ApiError extends Error {
  constructor(message: string, error: any) {
    super(message)

    console.error('message', message)
    console.error('error', error)
    console.groupEnd()
  }
}
