/* eslint-disable no-console */

export class FrontendError extends Error {
  scope: string

  constructor(message: string, scope?: string | undefined, err?: any) {
    super(message)

    this.scope = scope || 'Unknown Scope'

    // TODO Create an error handler (surely an Error Boundary for fatal cases)
    console.error(`[${this.scope}]`, message, err)
    console.debug(err)
  }
}
