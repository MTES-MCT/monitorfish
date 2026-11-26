import { AIS_POSITIONS_RETENTION_IN_MONTHS } from '@features/PositionReplay/constants'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { Dayjs, ManipulateType } from 'dayjs'

export type DateTimeStep = {
  amount: number
  label: string
  unit: ManipulateType
}

const DAY_STEP: DateTimeStep = { amount: 1, label: '1j', unit: 'day' }
const HOUR_STEP: DateTimeStep = { amount: 1, label: '1h', unit: 'hour' }

export const DATE_TIME_STEPS: DateTimeStep[] = [DAY_STEP, HOUR_STEP]

/** ←/→ step by one hour, Shift+←/→ by one day. */
export function getKeyboardStep(
  key: string,
  isShiftPressed: boolean
): { dateTimeStep: DateTimeStep; direction: 1 | -1 } | undefined {
  const dateTimeStep = isShiftPressed ? DAY_STEP : HOUR_STEP

  switch (key) {
    case 'ArrowLeft':
      return { dateTimeStep, direction: -1 }
    case 'ArrowRight':
      return { dateTimeStep, direction: 1 }
    default:
      return undefined
  }
}

/** The backend expects whole seconds in UTC (`yyyy-MM-dd'T'HH:mm:ss.000X`). */
export function toReplayedDateTime(dateTime: string | Dayjs): string {
  return customDayjs(dateTime).utc().startOf('second').toISOString()
}

/** Steps from the replayed date, or from now when none is picked yet, without going past now. */
export function stepReplayedDateTime(
  dateTime: string | undefined,
  step: DateTimeStep,
  direction: 1 | -1,
  now: Dayjs
): string {
  const nextDateTime = (dateTime ? customDayjs(dateTime) : now).add(direction * step.amount, step.unit)

  return toReplayedDateTime(nextDateTime.isAfter(now) ? now : nextDateTime)
}

export function canStepForward(dateTime: string | undefined, step: DateTimeStep, now: Dayjs): boolean {
  return !!dateTime && !customDayjs(dateTime).add(step.amount, step.unit).isAfter(now)
}

export function isOlderThanAISRetention(dateTime: string | undefined, now: Dayjs): boolean {
  return !!dateTime && customDayjs(dateTime).isBefore(now.subtract(AIS_POSITIONS_RETENTION_IN_MONTHS, 'month'))
}
