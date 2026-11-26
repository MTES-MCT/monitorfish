import { describe, expect, it } from '@jest/globals'

import {
  formatAgeAtPositionsDate,
  formatSignalDateTime,
  getOpacityReducedEpochMilli,
  getSignalLabel
} from '../positionsDateTime'

describe('PositionReplay/positionsDateTime', () => {
  it('formatAgeAtPositionsDate() Should be relative to the replayed date When positions are replayed', () => {
    expect(formatAgeAtPositionsDate('2026-11-20T08:00:00.000Z', '2026-11-20T10:00:00.000Z')).toEqual('il y a 2 heures')
  })

  it('formatAgeAtPositionsDate() Should be relative to now When positions are not replayed', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

    expect(formatAgeAtPositionsDate(twoDaysAgo, undefined)).toEqual('il y a 2 jours')
  })

  it('formatSignalDateTime() Should display the date of the position When positions are replayed', () => {
    expect(formatSignalDateTime('2026-11-20T08:05:00.000Z', '2026-11-20T10:00:00.000Z')).toEqual(
      '20/11/2026 à 08h05 UTC'
    )
  })

  it('formatSignalDateTime() Should display the age of the position When positions are not replayed', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

    expect(formatSignalDateTime(twoDaysAgo, undefined)).toEqual('il y a 2 jours')
  })

  it('getOpacityReducedEpochMilli() Should be relative to the replayed date When replaying', () => {
    expect(getOpacityReducedEpochMilli('2026-11-20T02:00:00.000Z')).toEqual(
      new Date('2026-11-19T23:00:00.000Z').valueOf()
    )
  })

  it('getSignalLabel() Should not call the replayed position the last one', () => {
    expect(getSignalLabel(undefined, 'VMS')).toEqual('Dernier signal VMS')
    expect(getSignalLabel('2026-11-20T02:00:00.000Z', 'AIS')).toEqual('Signal AIS')
    expect(getSignalLabel(undefined, undefined)).toEqual('Dernier signal')
  })
})
