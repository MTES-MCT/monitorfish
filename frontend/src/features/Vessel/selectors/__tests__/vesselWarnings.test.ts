import { PositionReplayStatus } from '@features/PositionReplay/slice'
import { describe, expect, it } from '@jest/globals'

import {
  selectAreVesselAlertsAndBeaconMalfunctionsDisplayed,
  selectAreVesselInfractionSuspicionsDisplayed
} from '../vesselWarnings'

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

describe('Vessel/selectors/vesselWarnings', () => {
  it.each(
    Object.entries({
      selectAreVesselAlertsAndBeaconMalfunctionsDisplayed,
      selectAreVesselInfractionSuspicionsDisplayed
    })
  )('%s() Should be true only When not replaying', (_, selector) => {
    expect(selector(getState(false, false))).toBe(true)
    expect(selector(getState(false, true))).toBe(false)
  })
})
