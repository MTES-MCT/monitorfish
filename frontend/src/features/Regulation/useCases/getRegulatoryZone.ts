import { geoserverApi } from '@api/geoserverApi'

import { getIrretrievableRegulatoryZoneError } from '../../../api/geoserver'

import type { RegulatoryZoneName } from '@api/geoserverApi'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type { Regulation } from '@features/Regulation/Regulation.types'
import type { HybridAppThunk } from '@store/types'

/**
 * The zones displayed together (e.g. the zones of a layer) are fetched in a single request:
 * on a satellite connection, each request costs seconds.
 */
export const getRegulatoryZone =
  (
    regulatoryZone: MonitorFishMap.ShowedLayer,
    zonesFetchedTogether: MonitorFishMap.ShowedLayer[] = [regulatoryZone]
  ): HybridAppThunk<Promise<Regulation.RegulatoryZoneGeoJsonFeature>> =>
  async (dispatch, getState) => {
    if (!regulatoryZone.topic || !regulatoryZone.zone) {
      throw getIrretrievableRegulatoryZoneError("Le nom de la couche ou de la zone n'est pas renseigné", regulatoryZone)
    }

    // Only the names, so that the same zones always share the same cache entry
    const zones = zonesFetchedTogether.filter(isRegulatoryZoneName).map(({ topic, zone }) => ({ topic, zone }))
    const request = dispatch(
      geoserverApi.endpoints.getRegulatoryZones.initiate({ fromBackoffice: getState().global.isBackoffice, zones })
    )
    try {
      const { data, error } = await request
      if (!data) {
        throw getIrretrievableRegulatoryZoneError(JSON.stringify(error), regulatoryZone)
      }

      const features = data.filter(
        feature =>
          feature.properties?.topic === regulatoryZone.topic && feature.properties?.zone === regulatoryZone.zone
      )
      // There must be only one feature per regulation
      if (features.length !== 1 || !features[0]) {
        throw getIrretrievableRegulatoryZoneError(`${features.length} features found for this zone`, regulatoryZone)
      }

      return features[0]
    } finally {
      // Lets RTK Query remove the zones from its cache after a while
      request.unsubscribe()
    }
  }

function isRegulatoryZoneName(
  zone: MonitorFishMap.ShowedLayer
): zone is MonitorFishMap.ShowedLayer & RegulatoryZoneName {
  return !!zone.topic && !!zone.zone
}
