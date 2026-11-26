import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import {
  canStepForward,
  DATE_TIME_STEPS,
  getKeyboardStep,
  isOlderThanAISRetention,
  stepReplayedDateTime,
  toReplayedDateTime
} from '../replayedDateTime'

const [ONE_DAY, ONE_HOUR] = DATE_TIME_STEPS as [(typeof DATE_TIME_STEPS)[0], (typeof DATE_TIME_STEPS)[0]]
const NOW = customDayjs('2026-11-23T12:00:30.123Z')

describe('PositionReplay/replayedDateTime', () => {
  it('toReplayedDateTime() Should return a UTC date without milliseconds', () => {
    expect(toReplayedDateTime('2026-11-20T03:04:05.678+01:00')).toEqual('2026-11-20T02:04:05.000Z')
  })

  it('stepReplayedDateTime() Should step from the replayed date', () => {
    expect(stepReplayedDateTime('2026-11-20T02:00:00.000Z', ONE_DAY, -1, NOW)).toEqual('2026-11-19T02:00:00.000Z')
    expect(stepReplayedDateTime('2026-11-20T02:00:00.000Z', ONE_HOUR, 1, NOW)).toEqual('2026-11-20T03:00:00.000Z')
  })

  it('stepReplayedDateTime() Should step from now When no date is replayed', () => {
    expect(stepReplayedDateTime(undefined, ONE_HOUR, -1, NOW)).toEqual('2026-11-23T11:00:30.000Z')
  })

  it('stepReplayedDateTime() Should not go past now', () => {
    expect(stepReplayedDateTime('2026-11-23T11:30:00.000Z', ONE_HOUR, 1, NOW)).toEqual('2026-11-23T12:00:30.000Z')
  })

  it('canStepForward() Should be false When no date is replayed or when it would go past now', () => {
    expect(canStepForward(undefined, ONE_HOUR, NOW)).toBe(false)
    expect(canStepForward('2026-11-23T11:30:00.000Z', ONE_HOUR, NOW)).toBe(false)
    expect(canStepForward('2026-11-23T10:00:00.000Z', ONE_HOUR, NOW)).toBe(true)
  })

  it('isOlderThanAISRetention() Should be true When the date is older than one month', () => {
    expect(isOlderThanAISRetention(undefined, NOW)).toBe(false)
    expect(isOlderThanAISRetention('2026-11-01T00:00:00.000Z', NOW)).toBe(false)
    expect(isOlderThanAISRetention('2026-10-01T00:00:00.000Z', NOW)).toBe(true)
  })

  it('getKeyboardStep() Should step by one hour with the arrows, and one day with Shift', () => {
    expect(getKeyboardStep('ArrowLeft', false)).toEqual({ dateTimeStep: ONE_HOUR, direction: -1 })
    expect(getKeyboardStep('ArrowRight', true)).toEqual({ dateTimeStep: ONE_DAY, direction: 1 })
    expect(getKeyboardStep('Enter', false)).toBeUndefined()
  })
})
