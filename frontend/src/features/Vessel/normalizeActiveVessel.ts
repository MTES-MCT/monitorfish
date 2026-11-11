import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { transform } from 'ol/proj'

import { ActivityType } from './schemas/ActiveVesselSchema'

import type { Vessel } from './Vessel.types'

function getOpenLayersCoordinates(longitude: number, latitude: number): number[] | null {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null
  }

  return transform([longitude, latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
}

/**
 * Rebuild the properties of an active vessel the API does not send, to lighten the payload.
 *
 * @param index Used as `id` when the API does not send one (it does only for the vessels of a vessel group)
 */
export function normalizeActiveVessel(vessel: Vessel.ActiveVesselFromApi, index: number): Vessel.ActiveVessel {
  const id = vessel.id ?? index

  if (vessel.activityType === ActivityType.LOGBOOK_BASED) {
    return {
      ...vessel,
      id,
      isFiltered: 0,
      // As previously built by the API for these vessels
      vesselFeatureId: `VESSELS:${getVesselCompositeIdentifier(vessel)}`
    }
  }

  return {
    ...vessel,
    coordinates: getOpenLayersCoordinates(vessel.longitude, vessel.latitude),
    hasAlert: vessel.alerts.length > 0,
    hasBeaconMalfunction: vessel.beaconMalfunctionId !== undefined && vessel.beaconMalfunctionId !== null,
    id,
    isFiltered: 0,
    lastPositionSentAt: Date.parse(vessel.dateTime),
    vesselFeatureId: `${MonitorFishMap.MonitorFishLayer.VESSELS}:${getVesselCompositeIdentifier(vessel)}`
  }
}
