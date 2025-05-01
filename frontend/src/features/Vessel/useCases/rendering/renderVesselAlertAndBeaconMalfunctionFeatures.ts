import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  filterNonSelectedVessels,
  getVesselFeatures,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import { VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/constants'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import type { MainAppThunk } from '@store'

export const renderVesselAlertAndBeaconMalfunctionFeatures = (): MainAppThunk => async (_, getState) => {
  const isLayerFound = monitorfishMap
    .getLayers()
    .getArray()
    // @ts-ignore
    ?.find(layer => layer.name === MonitorFishMap.MonitorFishLayer.VESSEL_ALERT_AND_BEACON_MALFUNCTION)
  if (!isLayerFound) {
    return
  }

  const { selectedVesselIdentity, vesselsTracksShowed } = getState().vessel
  const { areVesselGroupsDisplayed } = getState().displayedComponent

  const numberOfVessels = vesselSelectors.selectTotal(getState().vessel.vessels)
  if (!numberOfVessels) {
    return
  }

  const vesselsFeatures = getVesselFeatures()
  /* eslint-disable no-underscore-dangle */
  const {
    areVesselsNotInVesselGroupsHidden,
    hideNonSelectedVessels,
    vesselIsHiddenTimeThreshold,
    vesselIsOpacityReducedTimeThreshold
    // @ts-ignore there is no other way to access the style variables
  } = VESSELS_VECTOR_LAYER.styleVariables_
  /* eslint-enable no-underscore-dangle */

  const features = vesselsFeatures
    .filter(
      feature =>
        feature.get('isFiltered') &&
        feature.get('hasBeaconMalfunction') &&
        feature.get('hasAlert') &&
        (areVesselsNotInVesselGroupsHidden && areVesselGroupsDisplayed ? isVesselGroupColorDefined(feature) : true) &&
        VesselFeature.getVesselOpacityWithTimestamp(
          feature.get('dateTime'),
          vesselIsHiddenTimeThreshold,
          vesselIsOpacityReducedTimeThreshold
        ) !== 0
    )
    .filter(filterNonSelectedVessels(vesselsTracksShowed, !!hideNonSelectedVessels, selectedVesselIdentity))
    .map(feature => {
      const nextFeature = new Feature({
        geometry: new Point(feature.get('coordinates'))
      })
      nextFeature.setId(
        `${LayerProperties.VESSEL_ALERT_AND_BEACON_MALFUNCTION.code}:${getVesselCompositeIdentifier(
          feature.getProperties()
        )}`
      )

      return nextFeature
    })

  VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE.clear(true)
  VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE.addFeatures(features)
}
