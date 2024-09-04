/* eslint-disable no-empty */

import { metrics, setMeasurement } from '@sentry/react'

type CustomSentryMeasurementValue = {
  id: string
  value: number
}

export enum CustomSentryMeasurementName {
  LOGBOOK_PRIOR_NOTIFICATION_FORM_SPINNER = 'LOGBOOK_PRIOR_NOTIFICATION_FORM_SPINNER',
  MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER = 'MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER',
  PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON = 'PRIOR_NOTIFICATION_CARD_DOWNLOAD_BUTTON'
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
      const key = `${name}-${id}`
      const value = Date.now()
      if (this.mesurements.has(key)) {
        return
      }

      this.mesurements.set(key, { id, value })
    } catch (_) {}
  }

  endMeasurement(name: CustomSentryMeasurementName, id: string) {
    try {
      const key = `${name}-${id}`
      const measurement = this.mesurements.get(key)
      if (!measurement) {
        return
      }

      setMeasurement(name, Date.now() - measurement.value, 'millisecond')
      metrics.distribution(name, measurement.value, {
        tags: { type: 'important' },
        unit: 'millisecond'
      })

      this.mesurements.delete(key)
    } catch (_) {}
  }
}

export const customSentry = new CustomSentry()
