/* eslint-disable no-console */

import { captureMessage } from '@sentry/react'

export function logSoftError(message: string, extraContext?: Record<string, any>) {
  console.warn(message)
  console.debug('extraContext', extraContext)

  captureMessage(message, {
    extra: extraContext || {},
    level: 'warning'
  })
}
