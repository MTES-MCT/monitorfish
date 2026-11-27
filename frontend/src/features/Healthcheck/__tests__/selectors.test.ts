import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { describe, expect, it } from '@jest/globals'

import { selectDisplayedHealthcheckTextWarning } from '../selectors'

import type { MainRootState } from '@store'

const WARNINGS = ['Nous ne recevons plus aucune position VMS depuis 3 heures.']

const getState = (status: PositionReplayStatus) =>
  ({ global: { healthcheckTextWarning: WARNINGS }, positionReplay: { status } }) as unknown as MainRootState

describe('Healthcheck/selectors.selectDisplayedHealthcheckTextWarning()', () => {
  it('Should display the live data warnings When not replaying', () => {
    expect(selectDisplayedHealthcheckTextWarning(getState(PositionReplayStatus.OFF))).toBe(WARNINGS)
  })

  it('Should mute the live data warnings When replaying', () => {
    expect(selectDisplayedHealthcheckTextWarning(getState(PositionReplayStatus.REPLAYING))).toEqual([])
  })
})
