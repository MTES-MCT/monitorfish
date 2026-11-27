import { MonitorFishMap } from '@features/Map/Map.types'
import { DataKind, isDataAvailableForVessel } from '@features/PositionReplay/replayableData'
import {
  FLEET_SEGMENTS_SECTION_HEIGHT,
  marginsWithoutAlert,
  HIDDEN_GROUPS_ROW_HEIGHT,
  VESSEL_GROUP_ROW_HEIGHT,
  VESSEL_GROUPS_SECTION_BASE_HEIGHT,
  WARNING_BANNER_HEIGHT
} from '@features/Vessel/components/VesselCardOverlay/constants'

import type Feature from 'ol/Feature'

export function isVesselFeature(feature: Feature | null | undefined): boolean {
  return !!feature?.getId()?.toString()?.startsWith(MonitorFishMap.MonitorFishLayer.VESSELS)
}

export function getOverlayMargins(yOffset: number) {
  return {
    ...marginsWithoutAlert,
    yBottom: marginsWithoutAlert.yBottom - yOffset,
    yMiddle: marginsWithoutAlert.yMiddle - yOffset / 2
  }
}

/**
 * Computes the vertical pixel offset from the base card height: superuser warning banners and vessel groups grow
 * the card downward, while a replayed vessel has no fleet segments section.
 * This offset must be subtracted from the overlay margins.
 */
export function computeYOffset(feature: Feature | null, isSuperUser: boolean): number {
  const numberOfWarnings = isSuperUser
    ? Number(feature?.get('hasAlert')) +
      Number(!!feature?.get('beaconMalfunctionId')) +
      Number(feature?.get('hasInfractionSuspicion'))
    : 0
  const groupsDisplayed = Number(feature?.get('groupsDisplayed')?.length)
  const numberOfGroupsHidden = Number(feature?.get('numberOfGroupsHidden'))

  const warningsOffset = numberOfWarnings * WARNING_BANNER_HEIGHT
  const groupsOffset =
    (groupsDisplayed > 0 || numberOfGroupsHidden > 0 ? VESSEL_GROUPS_SECTION_BASE_HEIGHT : 0) +
    groupsDisplayed * VESSEL_GROUP_ROW_HEIGHT
  const hiddenGroupsOffset = numberOfGroupsHidden > 0 ? HIDDEN_GROUPS_ROW_HEIGHT : 0

  const isFleetSegmentsSectionDisplayed = isDataAvailableForVessel(
    { isReplayed: feature?.get('isReplayed') },
    DataKind.FLEET_SEGMENTS
  )
  const fleetSegmentsOffset = isFleetSegmentsSectionDisplayed ? 0 : -FLEET_SEGMENTS_SECTION_HEIGHT

  return warningsOffset + groupsOffset + hiddenGroupsOffset + fleetSegmentsOffset
}
