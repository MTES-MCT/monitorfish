/* eslint-disable no-console */

import { HttpStatusCode } from '@api/constants'
import { captureException, Scope } from '@sentry/react'

import type { CustomResponseError } from '@api/types'

const IGNORED_HTTP_STATUS = [HttpStatusCode.FORBIDDEN, HttpStatusCode.UNAUTHORIZED]

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

    if (this.shouldBeIgnored()) {
      return
    }

    this.logConsoleError()
    this.logSentryError()
  }

  /**
   * Each time a user must re-login, a 401 or 403 http status will be thrown, we do not want to track these
   * as it is a normal behavior.
   */
  private shouldBeIgnored() {
    return (
      isCustomResponseError(this.originalError) &&
      typeof this.originalError.status === 'number' &&
      IGNORED_HTTP_STATUS.includes(this.originalError.status as number)
    )
  }

  logConsoleError() {
    console.group(this.name)
    console.error('message', this.message)
    console.info('originalError', this.originalError)
    console.groupEnd()
  }

  logSentryError() {
    captureException(new Error(this.message, { cause: this.originalError }), this.scope)
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

const isCustomResponseError = (value: CustomResponseError): value is CustomResponseError => !!value?.status
