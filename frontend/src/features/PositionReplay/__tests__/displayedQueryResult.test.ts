import { describe, expect, it } from '@jest/globals'

import { selectDisplayedQueryResult } from '../hooks/useDisplayedQueryResult'
import { PositionReplayStatus } from '../slice'

const CURRENT = { data: ['current'], isError: false, isFetching: false }
const REPLAYED = { data: ['replayed'], isError: false, isFetching: true }

describe('PositionReplay/selectDisplayedQueryResult()', () => {
  it('Should select the current result When positions are not replayed', () => {
    expect(selectDisplayedQueryResult(PositionReplayStatus.OFF, CURRENT, REPLAYED)).toBe(CURRENT)
  })

  it('Should select the replayed result When a date is replayed', () => {
    expect(selectDisplayedQueryResult(PositionReplayStatus.REPLAYING, CURRENT, REPLAYED)).toBe(REPLAYED)
  })
})
