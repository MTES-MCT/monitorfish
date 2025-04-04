import {
  filterNonSelectedVessels,
  getVesselFeaturesInExtent,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import { VESSEL_ALERT_LAYER, VESSEL_ALERT_VECTOR_SOURCE } from '@features/Vessel/layers/VesselAlertLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { getVesselLastPositionVisibilityDates, VesselFeature } from '@features/Vessel/types/vessel'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { throttle } from 'lodash-es'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import React, { useEffect } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { LayerProperties } from '../../../Map/constants'
import { monitorfishMap } from '../../../Map/monitorfishMap'

function UnmemoizedVesselAlertLayer({ mapMovingAndZoomEvent }) {
  const isSuperUser = useIsSuperUser()
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const numberOfVessels = useMainAppSelector(state => vesselSelectors.selectTotal(state.vessel.vessels))
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)
  const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

  useEffect(() => {
    if (isSuperUser) {
      monitorfishMap.getLayers().push(VESSEL_ALERT_LAYER)
    }

    return () => {
      monitorfishMap.removeLayer(VESSEL_ALERT_LAYER)
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
              feature.get('hasAlert') &&
              !feature.get('hasBeaconMalfunction') &&
              (areVesselsNotInVesselGroupsHidden ? isVesselGroupColorDefined(feature) : true) &&
              VesselFeature.getVesselOpacity(feature.get('dateTime'), vesselIsHidden, vesselIsOpacityReduced) !== 0
          )
          .filter(filterNonSelectedVessels(vesselsTracksShowed, hideNonSelectedVessels, selectedVesselIdentity))
          .map(feature => {
            const nextFeature = new Feature({
              geometry: new Point(feature.get('coordinates'))
            })
            nextFeature.setId(
              `${LayerProperties.VESSEL_ALERT.code}:${getVesselCompositeIdentifier(feature.getProperties())}`
            )

            return nextFeature
          })

        VESSEL_ALERT_VECTOR_SOURCE.clear(true)
        VESSEL_ALERT_VECTOR_SOURCE.addFeatures(features)
      }, 250)

      updateFeatures()

      return () => updateFeatures.cancel()
    }

    return undefined

    // vesselsLastPositionVisibility is enough for vesselIsHidden and vesselIsOpacityReduced variables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSuperUser,
    numberOfVessels,
    selectedVesselIdentity,
    vesselsTracksShowed,
    hideNonSelectedVessels,
    mapMovingAndZoomEvent,
    areVesselsNotInVesselGroupsHidden,
    vesselsLastPositionVisibility
  ])

  return null
}

export const VesselAlertLayer = React.memo(UnmemoizedVesselAlertLayer)
