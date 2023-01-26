/* eslint-disable no-console */

export class FrontendError extends Error {
  scope: string

  constructor(message: string, scope: string, err?: any) {
    super(message)

    this.scope = scope

    // TODO Create an error handler (surely an Error Boundary for fatal cases)
    console.error(`[${scope}]`, message, err)
    console.debug(err)
  }
}
