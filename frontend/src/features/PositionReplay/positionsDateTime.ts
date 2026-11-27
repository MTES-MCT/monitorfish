import { customDayjs } from '@mtes-mct/monitor-ui'
import * as timeago from 'timeago.js'

import { timeagoFrenchLocale } from '../../utils'

// @ts-expect-error — timeago.js ships no locale type definitions
timeago.register('fr', timeagoFrenchLocale)

const OPACITY_REDUCED_AFTER_HOURS = 3

export function formatAgeAtPositionsDate(dateTime: string | number, positionsDateTime: string | undefined): string {
  return timeago.format(dateTime, 'fr', positionsDateTime ? { relativeDate: positionsDateTime } : undefined)
}

export function getOpacityReducedEpochMilli(positionsDateTime: string | undefined): number {
  return customDayjs(positionsDateTime).subtract(OPACITY_REDUCED_AFTER_HOURS, 'hour').valueOf()
}

/**
 * While replaying, the exact date of the position: its age would be read as an age relative to now.
 */
export function formatSignalDateTime(dateTime: string | number, positionsDateTime: string | undefined): string {
  if (!positionsDateTime) {
    return formatAgeAtPositionsDate(dateTime, positionsDateTime)
  }

  return customDayjs.utc(dateTime).format('DD/MM/YYYY à HH[h]mm [UTC]')
}

/** A replayed position is the one at the replayed date, not the last one. */
export function getSignalLabel(positionsDateTime: string | undefined, positionType: string | undefined): string {
  const label = positionsDateTime ? 'Signal' : 'Dernier signal'

  return positionType ? `${label} ${positionType}` : label
}
