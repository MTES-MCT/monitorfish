import { LayerProperties } from '@features/Map/constants'
import { getLabelLineStyle } from '@features/Map/layers/styles/labelLine.style'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { drawMovedLabelLineIfFoundAndReturnOffset } from '@features/Vessel/label.utils'
import { getVesselFeaturesInExtent, isVesselGroupColorDefined } from '@features/Vessel/layers/utils/utils'
import { getVesselLastPositionVisibilityDates, VesselFeature } from '@features/Vessel/types/vessel'
import { extractVesselPropertiesFromFeature, getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import LineString from 'ol/geom/LineString'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { VesselLabelOverlay } from '../components/VesselLabelOverlay'
import { vesselSelectors } from '../slice'
import { VesselLabelLine } from '../types/vesselLabelLine'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type { MutableRefObject } from 'react'

const MAX_LABELS_DISPLAYED = 200
const MAX_LABELS_DISPLAYED_IN_PREVIEW = 400
const NOT_FOUND = -1

export function VesselsLabelsLayer({ mapMovingAndZoomEvent }) {
  const throttleDuration = 250 // ms

  const isSuperUser = useIsSuperUser()

  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const vessels = useMainAppSelector(state => vesselSelectors.selectAll(state.vessel.vessels))

  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const areVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselsDisplayed)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )
  const hideVesselsAtPort = useMainAppSelector(state => state.map.hideVesselsAtPort)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)

  const [featuresAndLabels, setFeaturesAndLabels] = useState<
    {
      featureId: string
      identity: Record<string, any>
      label: Record<string, any>
      offset: number[] | null
      opacity: number
      trackIsShown: boolean
    }[]
  >([])
  const previousMapZoom = useRef('')
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)
  const [vesselToCoordinates, setVesselToCoordinates] = useState(new Map())
  const [vesselToRiskFactorDetailsShowed, setVesselToRiskFactorDetailsShowed] = useState(new Map())
  const isThrottled = useRef(false)

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const layerRef = useRef() as MutableRefObject<MonitorFishMap.VectorLayerWithName>
  const [currentLabels, setCurrentLabels] = useState<JSX.Element[]>([])

  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource<Feature<Geometry>>({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const getLayer = useCallback(() => {
    if (layerRef.current === undefined) {
      layerRef.current = new Vector({
        renderBuffer: 7,
        source: getVectorSource(),
        style: getLabelLineStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.VESSELS_LABEL.zIndex
      })
    }

    return layerRef.current
  }, [getVectorSource])

  useEffect(() => {
    getLayer().name = LayerProperties.VESSELS_LABEL.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  const moveVesselLabelLine = useCallback(
    (featureId, fromCoordinates, toCoordinates, offset, opacity) => {
      if (vesselToCoordinates.has(featureId)) {
        const existingLabelLineFeature = getVectorSource().getFeatureById(featureId)
        if (existingLabelLineFeature) {
          existingLabelLineFeature.setGeometry(new LineString([fromCoordinates, toCoordinates]))
        }
      } else {
        const labelLineFeature = VesselLabelLine.getFeature(fromCoordinates, toCoordinates, featureId, opacity)

        getVectorSource().addFeature(labelLineFeature)
      }

      const nextVesselToCoordinates = vesselToCoordinates
      nextVesselToCoordinates.set(featureId, { coordinates: toCoordinates, offset })
      setVesselToCoordinates(nextVesselToCoordinates)
    },
    [vesselToCoordinates, getVectorSource]
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
          const feature = getVectorSource().getFeatureById(id)
          if (feature) {
            getVectorSource().removeFeature(feature)
          }
        }
      })

      const labels = featuresAndLabels.map(({ featureId, identity, label, offset, opacity, trackIsShown }) => (
        <VesselLabelOverlay
          key={identity.key}
          coordinates={identity.coordinates}
          featureId={featureId}
          identity={identity}
          label={label}
          moveLine={moveVesselLabelLine}
          offset={offset}
          opacity={opacity}
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
    hideVesselsAtPort,
    moveVesselLabelLine,
    previousFeaturesAndLabels,
    showLabelRiskFactorDetails,
    getVectorSource
  ])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } =
      getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

    const vesselsLayer = monitorfishMap
      .getLayers()
      .getArray()
      // @ts-ignore
      ?.find(olLayer => olLayer.name === MonitorFishMap.MonitorFishLayer.VESSELS)
      // @ts-ignore
      ?.getSource()
    vesselsLayer?.current?.forEachFeatureInExtent(monitorfishMap.getView().calculateExtent(), vesselFeature => {
      const opacity = VesselFeature.getVesselOpacity(
        vesselFeature.get('dateTime'),
        vesselIsHidden,
        vesselIsOpacityReduced
      )
      const identity = {
        externalReferenceNumber: vesselFeature.get('externalReferenceNumber'),
        internalReferenceNumber: vesselFeature.get('internalReferenceNumber'),
        ircs: vesselFeature.get('ircs')
      }
      const labelLineFeatureId = VesselLabelLine.getFeatureId(identity)
      const feature = vectorSourceRef?.current?.getFeatureById(labelLineFeatureId)
      if (feature) {
        feature.set(VesselLabelLine.opacityProperty, opacity)
      }
    })
  }, [vesselsLastPositionVisibility])

  useEffect(() => {
    if (isThrottled.current || !vessels) {
      return
    }

    // functions definition
    function addLabelToFeatures(features) {
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
      const showedTracksVesselsIdentities = Object.keys(vesselsTracksShowed)
      if (selectedVessel) {
        showedTracksVesselsIdentities.push(getVesselCompositeIdentifier(selectedVessel))
      }

      const nextFeaturesAndLabels = features.map(feature => {
        const vesselProperties = extractVesselPropertiesFromFeature(feature, [
          'beaconMalfunctionId',
          'dateTime',
          'detectabilityRiskFactor',
          'flagState',
          'groupsDisplayed',
          'impactRiskFactor',
          'internalReferenceNumber',
          'isAtPort',
          'lastControlDateTime',
          'probabilityRiskFactor',
          'riskFactor',
          'segments',
          'underCharter',
          'vesselId',
          'vesselIdentifier',
          'vesselName'
        ])
        const label = VesselFeature.getVesselFeatureLabel(vesselProperties, {
          areVesselsNotInVesselGroupsHidden,
          hideVesselsAtPort,
          isRiskFactorShowed: isSuperUser && riskFactorShowedOnMap,
          vesselLabel,
          vesselLabelsShowedOnMap,
          vesselsLastPositionVisibility
        })
        const identity = {
          externalReferenceNumber: feature.get('externalReferenceNumber'),
          internalReferenceNumber: feature.get('internalReferenceNumber'),
          ircs: feature.get('ircs')
        }
        const labelLineFeatureId = VesselLabelLine.getFeatureId(identity)
        const opacity =
          VesselFeature.getVesselOpacity(vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced) ||
          vesselProperties.beaconMalfunctionId
            ? 1
            : 0
        const offset = drawMovedLabelLineIfFoundAndReturnOffset(
          getVectorSource(),
          vesselToCoordinates,
          labelLineFeatureId,
          feature,
          opacity
        )
        const trackIsShown = showedTracksVesselsIdentities.includes(getVesselCompositeIdentifier(vesselProperties))

        return {
          featureId: labelLineFeatureId,
          identity: {
            coordinates: feature.getGeometry().getCoordinates(),
            externalReferenceNumber: identity.externalReferenceNumber,
            flagState: vesselProperties.flagState,
            internalReferenceNumber: identity.internalReferenceNumber,
            ircs: identity.ircs,
            key: feature.ol_uid,
            vesselId: vesselProperties.vesselId,
            vesselIdentifier: vesselProperties.vesselIdentifier,
            vesselName: vesselProperties.vesselName
          },
          label,
          offset,
          opacity,
          trackIsShown
        }
      })

      setFeaturesAndLabels(nextFeaturesAndLabels)
    }

    function addVesselLabelToAllFeaturesInExtent() {
      const doNotShowLabels =
        (isSuperUser && !vesselLabelsShowedOnMap && !riskFactorShowedOnMap) ||
        (!isSuperUser && !vesselLabelsShowedOnMap) ||
        !areVesselsDisplayed

      if (doNotShowLabels) {
        setFeaturesAndLabels([])
        getVectorSource().clear()

        return
      }

      if (!vesselLabelsShowedOnMap && !riskFactorShowedOnMap) {
        setFeaturesAndLabels([])
        getVectorSource().clear()

        return
      }

      const featuresInExtent = getVesselFeaturesInExtent()

      let featuresRequiringLabel
      if (hideNonSelectedVessels) {
        const selectedVesselId = selectedVessel && VesselFeature.getVesselFeatureId(selectedVessel)
        const showedFeaturesIdentities = Object.keys(vesselsTracksShowed)
        featuresRequiringLabel = featuresInExtent.filter(
          feature =>
            (!!selectedVessel && feature.getId() === selectedVesselId) ||
            showedFeaturesIdentities.find(identity => feature?.getId()?.toString()?.includes(identity))
        )
      } else {
        featuresRequiringLabel = featuresInExtent.filter(feature =>
          areVesselsNotInVesselGroupsHidden ? isVesselGroupColorDefined(feature) : feature.get('isFiltered')
        )
      }

      const maxLabelsDisplayed = previewFilteredVesselsMode ? MAX_LABELS_DISPLAYED_IN_PREVIEW : MAX_LABELS_DISPLAYED
      if (featuresRequiringLabel.length < maxLabelsDisplayed) {
        addLabelToFeatures(featuresRequiringLabel)
      } else {
        setFeaturesAndLabels([])
        getVectorSource().clear()
      }
    }
    // End of functions definition

    isThrottled.current = true
    setTimeout(() => {
      addVesselLabelToAllFeaturesInExtent()
      isThrottled.current = false
    }, throttleDuration)
  }, [
    isSuperUser,
    vessels,
    selectedVessel,
    mapMovingAndZoomEvent,
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselLabel,
    vesselToCoordinates,
    vesselsLastPositionVisibility,
    previewFilteredVesselsMode,
    hideNonSelectedVessels,
    vesselsTracksShowed,
    hideVesselsAtPort,
    getVectorSource,
    areVesselsDisplayed,
    areVesselsNotInVesselGroupsHidden
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
