import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { getReplayedDateTimeFromUrl, getUrlWithReplayedDateTime } from '../replayUrl'

const NOW = customDayjs('2026-11-25T12:00:00.000Z')
const MAP_URL = 'http://localhost:3000/#@-503013.39,6029552.02,9.00'

describe('PositionReplay/replayUrl', () => {
  it('getReplayedDateTimeFromUrl() Should read a past replayed date', () => {
    expect(getReplayedDateTimeFromUrl('http://localhost:3000/?replay=2026-11-20T10:30:00.000Z', NOW)).toEqual(
      '2026-11-20T10:30:00.000Z'
    )
  })

  it('getReplayedDateTimeFromUrl() Should ignore a missing, invalid or future date', () => {
    expect(getReplayedDateTimeFromUrl(MAP_URL, NOW)).toBeUndefined()
    expect(getReplayedDateTimeFromUrl('http://localhost:3000/?replay=yesterday', NOW)).toBeUndefined()
    expect(getReplayedDateTimeFromUrl('http://localhost:3000/?replay=2026-11-26T00:00:00.000Z', NOW)).toBeUndefined()
  })

  it('getUrlWithReplayedDateTime() Should set the replayed date and keep the map view', () => {
    expect(getUrlWithReplayedDateTime(MAP_URL, '2026-11-20T10:30:00.000Z')).toEqual(
      'http://localhost:3000/?replay=2026-11-20T10%3A30%3A00.000Z#@-503013.39,6029552.02,9.00'
    )
  })

  it('getUrlWithReplayedDateTime() Should remove the replayed date When quitting', () => {
    expect(
      getUrlWithReplayedDateTime('http://localhost:3000/?replay=2026-11-20T10%3A30%3A00.000Z#@1,2,3', undefined)
    ).toEqual('http://localhost:3000/#@1,2,3')
  })
})
