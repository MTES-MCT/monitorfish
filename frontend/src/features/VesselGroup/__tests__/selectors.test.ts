import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { describe, expect, it } from '@jest/globals'

import { selectAreVesselsNotInVesselGroupsHidden } from '../selectors'

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
      status: isPositionReplayActive ? PositionReplayStatus.PICKING_DATE : PositionReplayStatus.OFF
    },
    vesselGroup: { areVesselsNotInVesselGroupsHidden: isUserPreferenceEnabled }
  }) as unknown as MainRootState

describe('VesselGroup/selectors', () => {
  it.each(Object.entries({ selectAreVesselsNotInVesselGroupsHidden }))(
    '%s() Should follow the user preference When not replaying',
    (_, selector) => {
      expect(selector(getState(true, false))).toBe(true)
      expect(selector(getState(false, false))).toBe(false)
    }
  )

  it.each(Object.entries({ selectAreVesselsNotInVesselGroupsHidden }))(
    '%s() Should be false When replaying',
    (_, selector) => {
      expect(selector(getState(true, true))).toBe(false)
    }
  )
})
