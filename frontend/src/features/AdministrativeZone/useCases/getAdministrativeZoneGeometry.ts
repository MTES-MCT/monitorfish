import { getAdministrativeZoneFromAPI } from '@api/geoserver'
import { layerActions } from '@features/Map/layer.slice'
import { addZoneSelected } from '@features/Vessel/components/VesselList/slice'

import type { MainAppThunk } from '@store'

export const getAdministrativeZoneGeometry =
  (administrativeZoneCode: string, subZoneCode: string | undefined, zoneName: string): MainAppThunk =>
  (dispatch, getState) => {
    const { administrativeZonesGeometryCache } = getState().layer
    const foundCache = administrativeZonesGeometryCache.find(
      zone => zone.key === `${administrativeZoneCode}:${subZoneCode}:${zoneName}`
    )
    if (foundCache) {
      dispatchZoneSelected(foundCache.value)
    }

    getAdministrativeZoneFromAPI(administrativeZoneCode, undefined, subZoneCode, getState().global.isBackoffice)
      .then(administrativeZoneFeature => {
        if (administrativeZoneFeature.numberReturned === 1) {
          dispatchZoneSelected(administrativeZoneFeature)
          dispatch(
            layerActions.addAdministrativeZoneGeometryToCache({
              key: `${administrativeZoneCode}:${subZoneCode}:${zoneName}`,
              value: administrativeZoneFeature
            })
          )
        } else {
          console.error(`Vector ${administrativeZoneFeature}:${subZoneCode} has
        ${administrativeZoneFeature.numberReturned} features. It should have only 1 feature.`)
        }
      })
      .catch(e => {
        console.warn(e.error)
      })

    function dispatchZoneSelected(feature) {
      dispatch(
        addZoneSelected({
          code: subZoneCode ?? administrativeZoneCode,
          feature,
          name: zoneName
        })
      )
    }
  }
