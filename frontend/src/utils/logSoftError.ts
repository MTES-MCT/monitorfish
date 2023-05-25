/* eslint-disable no-console */

import { captureMessage } from '@sentry/react'

export function logSoftError(message: string) {
  console.warn(message)

  captureMessage(message, 'warning')
}
