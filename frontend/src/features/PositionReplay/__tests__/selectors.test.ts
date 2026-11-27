import { describe, expect, it } from '@jest/globals'

import { selectIsPositionReplayActive, selectPositionsDateTime } from '../selectors'
import { positionReplayActions, positionReplayReducer } from '../slice'

import type { UnknownAction } from '@reduxjs/toolkit'
import type { MainRootState } from '@store'

const REPLAYED_DATE_TIME = '2026-11-20T02:00:00.000Z'
const NEXT_REPLAYED_DATE_TIME = '2026-11-20T03:00:00.000Z'

const getStateAfter = (...actions: UnknownAction[]) =>
  ({
    positionReplay: actions.reduce(positionReplayReducer, positionReplayReducer(undefined, { type: 'INIT' }))
  }) as unknown as MainRootState

describe('PositionReplay/selectors', () => {
  it('Should display the current positions When the replay is off', () => {
    const state = getStateAfter()

    expect(selectIsPositionReplayActive(state)).toBe(false)
    expect(selectPositionsDateTime(state)).toBeUndefined()
  })

  it('Should have the replayed date as positions date When the replay is started', () => {
    const state = getStateAfter(positionReplayActions.start(REPLAYED_DATE_TIME))

    expect(selectIsPositionReplayActive(state)).toBe(true)
    expect(selectPositionsDateTime(state)).toEqual(REPLAYED_DATE_TIME)
  })

  it('Should have the new date as positions date When the date is changed', () => {
    const state = getStateAfter(
      positionReplayActions.start(REPLAYED_DATE_TIME),
      positionReplayActions.setDateTime(NEXT_REPLAYED_DATE_TIME)
    )

    expect(selectPositionsDateTime(state)).toEqual(NEXT_REPLAYED_DATE_TIME)
  })

  it('Should ignore a date When the replay is off', () => {
    const state = getStateAfter(positionReplayActions.setDateTime(REPLAYED_DATE_TIME))

    expect(selectIsPositionReplayActive(state)).toBe(false)
    expect(selectPositionsDateTime(state)).toBeUndefined()
  })

  it('Should be off again When quitting', () => {
    const state = getStateAfter(positionReplayActions.start(REPLAYED_DATE_TIME), positionReplayActions.reset())

    expect(selectIsPositionReplayActive(state)).toBe(false)
    expect(selectPositionsDateTime(state)).toBeUndefined()
  })
})
