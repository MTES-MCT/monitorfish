import { describe, expect, it } from '@jest/globals'

import {
  selectIsPositionReplayActive,
  selectIsPositionReplayHeadbandDisplayed,
  selectPositionsDateTime
} from '../selectors'
import { positionReplayActions, positionReplayReducer } from '../slice'

import type { UnknownAction } from '@reduxjs/toolkit'
import type { MainRootState } from '@store'

const REPLAYED_DATE_TIME = '2026-11-20T02:00:00.000Z'

const getStateAfter = (...actions: UnknownAction[]) =>
  ({
    positionReplay: actions.reduce(positionReplayReducer, positionReplayReducer(undefined, { type: 'INIT' }))
  }) as unknown as MainRootState

describe('PositionReplay/selectors', () => {
  it('Should display the current positions When the replay is off', () => {
    const state = getStateAfter()

    expect(selectIsPositionReplayActive(state)).toBe(false)
    expect(selectPositionsDateTime(state)).toBeUndefined()
    expect(selectIsPositionReplayHeadbandDisplayed(state)).toBe(false)
  })

  it('Should not have any positions date While the date is picked', () => {
    const state = getStateAfter(positionReplayActions.start())

    expect(selectIsPositionReplayActive(state)).toBe(true)
    expect(selectPositionsDateTime(state)).toBeUndefined()
    expect(selectIsPositionReplayHeadbandDisplayed(state)).toBe(false)
  })

  it('Should have the replayed date as positions date When a date is picked', () => {
    const state = getStateAfter(positionReplayActions.start(), positionReplayActions.setDateTime(REPLAYED_DATE_TIME))

    expect(selectPositionsDateTime(state)).toEqual(REPLAYED_DATE_TIME)
    expect(selectIsPositionReplayHeadbandDisplayed(state)).toBe(true)
  })

  it('Should ignore a date When the replay is off', () => {
    const state = getStateAfter(positionReplayActions.setDateTime(REPLAYED_DATE_TIME))

    expect(selectIsPositionReplayActive(state)).toBe(false)
    expect(selectPositionsDateTime(state)).toBeUndefined()
  })

  it('Should go back to picking a date When the date is cleared', () => {
    const state = getStateAfter(
      positionReplayActions.start(),
      positionReplayActions.setDateTime(REPLAYED_DATE_TIME),
      positionReplayActions.setDateTime(undefined)
    )

    expect(selectIsPositionReplayActive(state)).toBe(true)
    expect(selectPositionsDateTime(state)).toBeUndefined()
  })

  it('Should be off again When quitting', () => {
    const state = getStateAfter(
      positionReplayActions.start(),
      positionReplayActions.setDateTime(REPLAYED_DATE_TIME),
      positionReplayActions.reset()
    )

    expect(selectIsPositionReplayActive(state)).toBe(false)
  })
})
