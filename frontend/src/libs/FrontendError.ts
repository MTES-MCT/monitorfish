/* eslint-disable no-console */

import { captureException, captureMessage, Scope } from '@sentry/react'

export class FrontendError extends Error {
  #scope: Scope | undefined

  constructor(
    /** Technical error message for logs and debugging purpose. */
    public override message: string,
    /** Originally thrown error. */
    public originalError?: any,
    /** Extra context info. */
    scope?: Scope
  ) {
    super(message)

    this.name = 'FrontendError'
    this.#scope = scope

    this.logConsoleError()
    this.logSentryError()
  }

  logConsoleError() {
    console.group(this.name)
    console.error('message', this.message)
    console.info('originalError', this.originalError)
    console.groupEnd()
  }

  logSentryError() {
    captureMessage(this.message, this.scope)
    if (this.originalError) {
      captureException(this.originalError, this.scope)
    }
  }

  get scope() {
    if (this.#scope) {
      return this.#scope
    }

    const newScope = new Scope()
    newScope.setTags({
      side: 'frontend',
      type: 'error'
    })

    return newScope
  }
}
