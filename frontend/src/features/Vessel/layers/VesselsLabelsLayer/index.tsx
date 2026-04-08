import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  filterNonSelectedVessels,
  getVesselFeaturesInExtent,
  isVesselGroupColorDefined
} from '@features/Vessel/layers/utils/utils'
import {
  VESSELS_LABEL_VECTOR_LAYER,
  VESSELS_LABEL_VECTOR_SOURCE
} from '@features/Vessel/layers/VesselsLabelsLayer/constants'
import { getLabelFromFeatures } from '@features/Vessel/layers/VesselsLabelsLayer/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import LineString from 'ol/geom/LineString'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { VesselLabelOverlay } from '../../components/VesselLabelOverlay'
import { vesselSelectors } from '../../slice'
import { VesselLabelLine } from '../../types/vesselLabelLine'

const MAX_LABELS_DISPLAYED = 150
const MAX_LABELS_DISPLAYED_IN_PREVIEW = 400
const NOT_FOUND = -1

export function VesselsLabelsLayer({ mapMovingAndZoomEvent }) {
  const throttleDuration = 250 // ms

  const isSuperUser = useIsSuperUser()

  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const numberOfVessels = useMainAppSelector(state => vesselSelectors.selectTotal(state.vessel.vessels))
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const areVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselsDisplayed)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const vesselGroupsIdsDisplayed = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsDisplayed)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)

  const [featuresAndLabels, setFeaturesAndLabels] = useState<
    {
      featureId: string
      identity: Record<string, any>
      label: Record<string, any>
      offset: number[] | null
      trackIsShown: boolean
    }[]
  >([])
  const previousMapZoom = useRef('')
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)
  const [vesselToCoordinates, setVesselToCoordinates] = useState(new Map())
  const [vesselToRiskFactorDetailsShowed, setVesselToRiskFactorDetailsShowed] = useState(new Map())
  const isThrottled = useRef(false)
  const [currentLabels, setCurrentLabels] = useState<JSX.Element[]>([])

  useMapLayer(VESSELS_LABEL_VECTOR_LAYER)

  const moveVesselLabelLine = useCallback(
    (featureId, fromCoordinates, toCoordinates, offset) => {
      if (vesselToCoordinates.has(featureId)) {
        const existingLabelLineFeature = VESSELS_LABEL_VECTOR_SOURCE.getFeatureById(featureId)
        if (existingLabelLineFeature) {
          existingLabelLineFeature.setGeometry(new LineString([fromCoordinates, toCoordinates]))
        }
      } else {
        const labelLineFeature = VesselLabelLine.getFeature(fromCoordinates, toCoordinates, featureId)

        VESSELS_LABEL_VECTOR_SOURCE.addFeature(labelLineFeature)
      }

      const nextVesselToCoordinates = vesselToCoordinates
      nextVesselToCoordinates.set(featureId, { coordinates: toCoordinates, offset })
      setVesselToCoordinates(nextVesselToCoordinates)
    },
    [vesselToCoordinates]
  )

  const showLabelRiskFactorDetails = useCallback(
    featureId => {
      const previousValue = vesselToRiskFactorDetailsShowed.get(featureId)

      const nextVesselToRiskFactorDetailsShowed = vesselToRiskFactorDetailsShowed
      nextVesselToRiskFactorDetailsShowed.set(featureId, !previousValue)

      setVesselToRiskFactorDetailsShowed(nextVesselToRiskFactorDetailsShowed)
    },
    [vesselToRiskFactorDetailsShowed]
  )

  useEffect(() => {
    if (previousFeaturesAndLabels && featuresAndLabels) {
      const previousFeatureIdsList = previousFeaturesAndLabels.map(({ identity }) =>
        VesselLabelLine.getFeatureId(identity)
      )
      const featureIdsList = featuresAndLabels.map(({ identity }) => VesselLabelLine.getFeatureId(identity))

      previousFeatureIdsList.forEach(id => {
        if (featureIdsList.indexOf(id) === NOT_FOUND) {
          const feature = VESSELS_LABEL_VECTOR_SOURCE.getFeatureById(id)
          if (feature) {
            VESSELS_LABEL_VECTOR_SOURCE.removeFeature(feature)
          }
        }
      })

      const labels = featuresAndLabels.map(({ featureId, identity, label, offset, trackIsShown }) => (
        <VesselLabelOverlay
          key={identity.key}
          coordinates={identity.coordinates}
          featureId={featureId}
          identity={identity}
          label={label}
          moveLine={moveVesselLabelLine}
          offset={offset}
          previewFilteredVesselsMode={previewFilteredVesselsMode}
          riskFactorDetailsShowed={vesselToRiskFactorDetailsShowed.get(featureId)}
          trackIsShown={trackIsShown}
          triggerShowRiskDetails={showLabelRiskFactorDetails}
          zoomHasChanged={previousMapZoom.current}
        />
      ))
      setCurrentLabels(labels)
    }
  }, [
    previewFilteredVesselsMode,
    featuresAndLabels,
    vesselToCoordinates,
    previousMapZoom,
    vesselToRiskFactorDetailsShowed,
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselLabel,
    moveVesselLabelLine,
    previousFeaturesAndLabels,
    showLabelRiskFactorDetails
  ])

  useEffect(() => {
    if (isThrottled.current || !numberOfVessels) {
      return
    }

    function addVesselLabelToAllFeaturesInExtent() {
      const doNotShowLabels =
        (isSuperUser && !vesselLabelsShowedOnMap && !riskFactorShowedOnMap) ||
        (!isSuperUser && !vesselLabelsShowedOnMap) ||
        !areVesselsDisplayed

      if (doNotShowLabels) {
        setFeaturesAndLabels([])
        VESSELS_LABEL_VECTOR_SOURCE.clear()

        return
      }

      if (!vesselLabelsShowedOnMap && !riskFactorShowedOnMap) {
        setFeaturesAndLabels([])
        VESSELS_LABEL_VECTOR_SOURCE.clear()

        return
      }

      const featuresInExtent = getVesselFeaturesInExtent()
        .filter(
          feature =>
            feature.get('isFiltered') && (areVesselsNotInVesselGroupsHidden ? isVesselGroupColorDefined(feature) : true)
        )
        .filter(filterNonSelectedVessels(vesselsTracksShowed, hideNonSelectedVessels, selectedVesselIdentity))

      const maxLabelsDisplayed = previewFilteredVesselsMode ? MAX_LABELS_DISPLAYED_IN_PREVIEW : MAX_LABELS_DISPLAYED
      if (featuresInExtent.length < maxLabelsDisplayed) {
        const features = getLabelFromFeatures(featuresInExtent, {
          areVesselsNotInVesselGroupsHidden,
          isSuperUser,
          riskFactorShowedOnMap,
          selectedVessel,
          vesselLabel,
          vesselLabelsShowedOnMap,
          vesselsTracksShowed,
          vesselToCoordinates
        })
        setFeaturesAndLabels(features)
      } else {
        setFeaturesAndLabels([])
        VESSELS_LABEL_VECTOR_SOURCE.clear()
      }
    }
    // End of functions definition

    isThrottled.current = true
    setTimeout(() => {
      addVesselLabelToAllFeaturesInExtent()
      isThrottled.current = false
    }, throttleDuration)

    // vesselsLastPositionVisibility is enough for vesselIsHidden and vesselIsOpacityReduced variables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isSuperUser,
    numberOfVessels,
    selectedVessel,
    selectedVesselIdentity,
    mapMovingAndZoomEvent,
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselLabel,
    vesselToCoordinates,
    previewFilteredVesselsMode,
    hideNonSelectedVessels,
    vesselsTracksShowed,
    areVesselsDisplayed,
    areVesselsNotInVesselGroupsHidden,
    vesselGroupsIdsDisplayed
  ])

  useEffect(() => {
    if (!riskFactorShowedOnMap) {
      setVesselToRiskFactorDetailsShowed(new Map())
    }
  }, [riskFactorShowedOnMap])

  useEffect(() => {
    const currentZoom = monitorfishMap.getView().getZoom()?.toFixed(2)
    if (currentZoom !== previousMapZoom.current) {
      // @ts-ignore
      previousMapZoom.current = currentZoom
    }
  }, [mapMovingAndZoomEvent])

  return (
    <>
      {currentLabels}
      <div /> {/* returns at least a div */}
    </>
  )
}
