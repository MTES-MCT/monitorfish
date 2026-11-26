import { isReplayedVessel } from '@features/PositionReplay/replayedVessel'
import { asArray } from 'ol/color'

import type { VesselGroupDisplayInformation } from '../../../../workers/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

const NO_VESSEL_GROUP_DISPLAYED: VesselGroupDisplayInformation = {
  groupColor: [0, 0, 0],
  groupsDisplayed: [],
  numberOfGroupsHidden: 0
}

/**
 * Cheap enough to run on the main thread: sending the vessels to the web worker and back would cost much more.
 */
export function getDisplayedVesselGroups(
  vessel: Vessel.ActiveVesselEmittingPosition | Vessel.ReplayedVessel,
  vesselGroupsIdsDisplayed: number[],
  vesselGroupsIdsPinned: number[],
  vesselGroupsIdsFiltered: number[]
): VesselGroupDisplayInformation {
  // The vessel groups are computed with current data
  if (isReplayedVessel(vessel)) {
    return NO_VESSEL_GROUP_DISPLAYED
  }

  const pinnedAndDisplayedVesselGroups = vesselGroupsIdsDisplayed.filter(groupId =>
    vesselGroupsIdsPinned.includes(groupId)
  )
  const unpinnedAndDisplayedVesselGroups = vesselGroupsIdsDisplayed.filter(
    groupId => !vesselGroupsIdsPinned.includes(groupId)
  )
  const orderedDisplayedVesselGroups = pinnedAndDisplayedVesselGroups.concat(unpinnedAndDisplayedVesselGroups)

  const filteredVesselGroups = orderedDisplayedVesselGroups.filter(groupId => vesselGroupsIdsFiltered.includes(groupId))

  const groupsDisplayed = filteredVesselGroups
    .map(id => vessel.vesselGroups.find(group => group.id === id))
    .filter((group): group is Vessel.VesselGroupOfActiveVessel => !!group)
    // Priority groups are displayed first (label icons and layer group color)
    .sort((a, b) => Number(Boolean(b.isPriorityGroup)) - Number(Boolean(a.isPriorityGroup)))

  const numberOfGroupsHidden =
    vessel.vesselGroups.length > groupsDisplayed.length ? vessel.vesselGroups.length - groupsDisplayed.length : 0

  const firstGroupDisplayed = groupsDisplayed[0]
  const groupColor = firstGroupDisplayed?.color ? asArray(firstGroupDisplayed.color) : [0, 0, 0]

  return {
    groupColor,
    groupsDisplayed,
    numberOfGroupsHidden
  }
}
