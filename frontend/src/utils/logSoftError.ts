/* eslint-disable no-console */
import { captureMessage } from '@sentry/react'

export function logSoftError({
  callback = () => {},
  context = {},
  message,
  originalError
}: {
  callback?: () => void
  context?: Record<string, any>
  isSideWindowError?: boolean
  message: string
  originalError?: any
}) {
  console.group(`Soft Error: ${message}`)
  console.debug('context', context)
  console.debug('originalError', originalError)
  console.groupEnd()

  const extra = originalError
    ? {
        ...context,
        originalError
      }
    : { ...context }
  captureMessage(message, {
    extra,
    level: 'warning'
  })

  if (callback) {
    callback()
  }
}
