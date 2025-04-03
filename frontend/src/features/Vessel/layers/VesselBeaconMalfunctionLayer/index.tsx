import {
  filterNonSelectedVessels,
  getVesselFeaturesInExtent,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import {
  VESSEL_BEACON_MALFUNCTION_LAYER,
  VESSEL_BEACON_MALFUNCTION_VECTOR_SOURCE
} from '@features/Vessel/layers/VesselBeaconMalfunctionLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { throttle } from 'lodash-es'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import React, { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { LayerProperties } from '../../../Map/constants'
import { monitorfishMap } from '../../../Map/monitorfishMap'

function UnmemoizedVesselBeaconMalfunctionLayer({ mapMovingAndZoomEvent }) {
  const isSuperUser = useIsSuperUser()
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const numberOfVessels = useMainAppSelector(state => vesselSelectors.selectTotal(state.vessel.vessels))

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_BEACON_MALFUNCTION_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_BEACON_MALFUNCTION_LAYER)
    }
  }, [isSuperUser])

  useEffect(() => {
    if (isSuperUser && numberOfVessels > 0) {
      const updateFeatures = throttle(() => {
        const vesselsFeaturesInExtent = getVesselFeaturesInExtent()

        const features = vesselsFeaturesInExtent
          .filter(
            feature =>
              feature.get('isFiltered') &&
              feature.get('hasBeaconMalfunction') &&
              !feature.get('hasAlert') &&
              (areVesselsNotInVesselGroupsHidden ? isVesselGroupColorDefined(feature) : true)
          )
          .filter(filterNonSelectedVessels(vesselsTracksShowed, hideNonSelectedVessels, selectedVesselIdentity))
          .map(feature => {
            const nextFeature = new Feature({
              geometry: new Point(feature.get('coordinates'))
            })
            nextFeature.setId(
              `${LayerProperties.VESSEL_BEACON_MALFUNCTION.code}:${getVesselCompositeIdentifier(
                feature.getProperties()
              )}`
            )

            return nextFeature
          })

        VESSEL_BEACON_MALFUNCTION_VECTOR_SOURCE.clear(true)
        VESSEL_BEACON_MALFUNCTION_VECTOR_SOURCE.addFeatures(features)
      }, 250)

      updateFeatures()

      return () => updateFeatures.cancel()
    }

    return undefined
  }, [
    isSuperUser,
    numberOfVessels,
    selectedVesselIdentity,
    vesselsTracksShowed,
    hideNonSelectedVessels,
    mapMovingAndZoomEvent,
    areVesselsNotInVesselGroupsHidden
  ])

  return null
}

export const VesselBeaconMalfunctionLayer = React.memo(UnmemoizedVesselBeaconMalfunctionLayer)
