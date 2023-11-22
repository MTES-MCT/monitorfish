/* eslint-disable no-console */

import { captureException, captureMessage, Scope } from '@sentry/react'

export class FrontendError extends Error {
  constructor(
    /** Technical error message for logs and debugging purpose. */
    public override message: string,
    /** Originally thrown error. */
    public originalError?: any,
    /** Extra context info. */
    public scope?: Scope
  ) {
    super(message)

    console.group('FrontendError')
    console.error('message', message)
    console.error('originalError', originalError)
    console.groupEnd()

    const controlledScope =
      scope ||
      (() => {
        const newScope = new Scope()
        newScope.setTags({
          side: 'frontend',
          type: 'api_error'
        })

        return newScope
      })

    captureMessage(message, controlledScope)
    if (originalError) {
      captureException(originalError, scope)
    }
  }
}
