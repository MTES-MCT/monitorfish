/* eslint-disable no-empty */

import { ONE_MINUTE } from '@constants/index'
import { captureMessage, Scope, startInactiveSpan, type Span } from '@sentry/react'

type CustomSentryMeasurementValue = {
  span: Span
  /** Epoch in ms */
  startDate: number
}

export enum CustomSentryMeasurementName {
  LOGBOOK_PRIOR_NOTIFICATION_FORM_SPINNER = 'LOGBOOK_PRIOR_NOTIFICATION_FORM_SPINNER',
  MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER = 'MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER',
  PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON = 'PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON',
  PRIOR_NOTIFICATION_LIST_BODY_SPINNER = 'PRIOR_NOTIFICATION_LIST_BODY_SPINNER'
}

class CustomSentry {
  mesurements: Map<string, CustomSentryMeasurementValue> = new Map()

  clearMeasurement(name: CustomSentryMeasurementName, id: string) {
    try {
      const key = `${name}-${id}`
      if (!this.mesurements.has(key)) {
        return
      }

      this.mesurements.delete(key)
    } catch (_) {}
  }

  startMeasurement(name: CustomSentryMeasurementName, id: string) {
    try {
      const startDate = Date.now()
      const key = `${name}-${id}`
      if (this.mesurements.has(key)) {
        return
      }

      const newScope = new Scope()
      newScope.setTags({
        side: 'frontend',
        type: 'performance'
      })
      const newSpan = startInactiveSpan({ name: key, scope: newScope })
      if (!newSpan) {
        return
      }

      this.mesurements.set(key, { span: newSpan, startDate })

      // Delete the key after 1m in case `endMeasurement()` is never called
      setTimeout(() => {
        this.clearMeasurement(name, id)
      }, ONE_MINUTE)
    } catch (_) {}
  }

  endMeasurement(name: CustomSentryMeasurementName, id: string, maxExpectedDurationInMs?: number) {
    try {
      const key = `${name}-${id}`
      const measurement = this.mesurements.get(key)
      if (!measurement) {
        return
      }

      measurement.span.end()

      const durationInMs = Date.now() - measurement.startDate
      if (maxExpectedDurationInMs !== undefined && durationInMs > maxExpectedDurationInMs) {
        const messageScope = new Scope()
        messageScope.setTags({
          side: 'frontend',
          type: 'performance'
        })

        const message = `${name} took more than ${maxExpectedDurationInMs / 1000}s.`
        captureMessage(message, {
          level: 'warning',
          tags: {
            side: 'frontend',
            type: 'performance'
          }
        })

        console.warn('[MonitorFish]', message)
      }

      this.mesurements.delete(key)
    } catch (_) {}
  }
}

export const customSentry = new CustomSentry()
