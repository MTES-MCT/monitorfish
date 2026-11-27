import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { describe, expect, it } from '@jest/globals'

import { selectArePinnedReportingsDisplayed, selectIsReportingLayerDisplayed } from '../selectors'

import type { MainRootState } from '@store'

const getState = (isUserPreferenceEnabled: boolean, isPositionReplayActive: boolean) =>
  ({
    displayedComponent: {
      isMissionsLayerDisplayed: isUserPreferenceEnabled,
      isReportingLayerDisplayed: isUserPreferenceEnabled
    },
    map: {
      riskFactorShowedOnMap: isUserPreferenceEnabled,
      showingVesselsEstimatedPositions: isUserPreferenceEnabled
    },
    positionReplay: {
      status: isPositionReplayActive ? PositionReplayStatus.REPLAYING : PositionReplayStatus.OFF
    },
    vesselGroup: { areVesselsNotInVesselGroupsHidden: isUserPreferenceEnabled }
  }) as unknown as MainRootState

describe('Reporting/selectors', () => {
  it.each(Object.entries({ selectIsReportingLayerDisplayed }))(
    '%s() Should follow the user preference When not replaying',
    (_, selector) => {
      expect(selector(getState(true, false))).toBe(true)
      expect(selector(getState(false, false))).toBe(false)
    }
  )

  it.each(Object.entries({ selectIsReportingLayerDisplayed }))('%s() Should be false When replaying', (_, selector) => {
    expect(selector(getState(true, true))).toBe(false)
  })
})

describe('Reporting/selectors.selectArePinnedReportingsDisplayed()', () => {
  it('Should be true only When not replaying', () => {
    expect(selectArePinnedReportingsDisplayed(getState(false, false))).toBe(true)
    expect(selectArePinnedReportingsDisplayed(getState(false, true))).toBe(false)
  })
})
