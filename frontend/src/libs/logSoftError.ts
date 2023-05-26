import { captureMessage } from '@sentry/react'

export function logSoftError(message: string, extraContext?: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.warn(message)

  captureMessage(message, {
    extra: extraContext || {},
    level: 'warning'
  })
}
