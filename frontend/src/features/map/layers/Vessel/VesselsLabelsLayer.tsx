import { usePrevious } from '@mtes-mct/monitor-ui'
import LineString from 'ol/geom/LineString'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { AuthorizationContext } from '../../../../context/AuthorizationContext'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { drawMovedLabelLineIfFoundAndReturnOffset } from '../../../../domain/entities/vessel/label'
import {
  getVesselCompositeIdentifier,
  getVesselLastPositionVisibilityDates,
  Vessel
} from '../../../../domain/entities/vessel/vessel'
import { VesselLabelLine } from '../../../../domain/entities/vesselLabelLine'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { VesselLabelOverlay } from '../../overlays/VesselLabelOverlay'
import { getLabelLineStyle } from '../styles/vesselLabelLine.style'

import type { VesselLastPositionFeature } from '../../../../domain/entities/vessel/types'
import type { VectorLayerWithName } from '../../../../domain/types/layer'
import type { MutableRefObject } from 'react'

const MAX_LABELS_DISPLAYED = 200
const MAX_LABELS_DISPLAYED_IN_PREVIEW = 400
const NOT_FOUND = -1

export function VesselsLabelsLayer({ map, mapMovingAndZoomEvent }) {
  const throttleDuration = 250 // ms

  const isSuperUser = useContext(AuthorizationContext)

  const { hideNonSelectedVessels, selectedVessel, vessels, vesselsTracksShowed } = useMainAppSelector(
    state => state.vessel
  )
  const { areVesselsDisplayed } = useMainAppSelector(state => state.displayedComponent)
  const { previewFilteredVesselsMode } = useMainAppSelector(state => state.global)

  const {
    hideVesselsAtPort,
    riskFactorShowedOnMap,
    vesselLabel,
    vesselLabelsShowedOnMap,
    vesselsLastPositionVisibility
  } = useMainAppSelector(state => state.map)

  const { filters, nonFilteredVesselsAreHidden } = useMainAppSelector(state => state.filter)

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
  const layerRef = useRef() as MutableRefObject<VectorLayerWithName>
  const [currentLabels, setCurrentLabels] = useState<JSX.Element[]>([])

  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
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
    if (map) {
      getLayer().name = LayerProperties.VESSELS_LABEL.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map, getLayer])

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
          flagState={identity.flagState}
          identity={identity}
          map={map}
          moveLine={moveVesselLabelLine}
          offset={offset}
          opacity={opacity}
          previewFilteredVesselsMode={previewFilteredVesselsMode}
          riskFactor={label?.riskFactor}
          riskFactorDetailsShowed={vesselToRiskFactorDetailsShowed.get(featureId)}
          text={label?.labelText}
          trackIsShown={trackIsShown}
          triggerShowRiskDetails={showLabelRiskFactorDetails}
          underCharter={label?.underCharter}
          zoomHasChanged={previousMapZoom.current}
        />
      ))
      setCurrentLabels(labels)
    }
  }, [
    map,
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

    const vesselsLayer = map
      .getLayers()
      .getArray()
      ?.find(olLayer => olLayer.name === LayerProperties.VESSELS_POINTS.code)
      ?.getSource()
    vesselsLayer?.current?.forEachFeatureInExtent(map.getView().calculateExtent(), vesselFeature => {
      const { vesselProperties } = vesselFeature as VesselLastPositionFeature
      const opacity = Vessel.getVesselOpacity(vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)
      const labelLineFeatureId = VesselLabelLine.getFeatureId(vesselProperties)
      const feature = vectorSourceRef?.current?.getFeatureById(labelLineFeatureId)
      if (feature) {
        feature.set(VesselLabelLine.opacityProperty, opacity)
      }
    })
  }, [map, vesselsLastPositionVisibility])

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
        const { vesselProperties } = feature
        const label = Vessel.getVesselFeatureLabel(vesselProperties, {
          hideVesselsAtPort,
          isRiskFactorShowed: isSuperUser && riskFactorShowedOnMap,
          vesselLabel,
          vesselLabelsShowedOnMap,
          vesselsLastPositionVisibility
        })
        const labelLineFeatureId = VesselLabelLine.getFeatureId(vesselProperties)
        const opacity =
          Vessel.getVesselOpacity(vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced) ||
          vesselProperties?.beaconMalfunctionId
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
            externalReferenceNumber: vesselProperties.externalReferenceNumber,
            flagState: vesselProperties.flagState,
            internalReferenceNumber: vesselProperties.internalReferenceNumber,
            ircs: vesselProperties.ircs,
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

      const vesselsLayer = map
        .getLayers()
        .getArray()
        ?.find(olLayer => olLayer.name === LayerProperties.VESSELS_POINTS.code)
        ?.getSource()
      const featuresInExtent = vesselsLayer?.getFeaturesInExtent(map.getView().calculateExtent()) || []

      const filterShowed = filters.find(filter => filter.showed)
      const isFiltered = filterShowed && nonFilteredVesselsAreHidden // && filteredVesselsFeaturesUids?.length FIXME: if filterShowed, is it really necessary to check filteredVesselsFeaturesUids ?
      let featuresRequiringLabel
      if (hideNonSelectedVessels) {
        const selectedVesselId = selectedVessel && Vessel.getVesselFeatureId(selectedVessel)
        const showedFeaturesIdentities = Object.keys(vesselsTracksShowed)
        featuresRequiringLabel = featuresInExtent.filter(
          feature =>
            (selectedVessel && feature.getId() === selectedVesselId) ||
            showedFeaturesIdentities.find(identity => feature?.getId()?.toString()?.includes(identity))
        )
      } else if (previewFilteredVesselsMode) {
        featuresRequiringLabel = featuresInExtent.filter(feature => feature.get('filterPreview'))
      } else if (isFiltered) {
        featuresRequiringLabel = featuresInExtent.filter(feature => feature.get('isFiltered'))
      } else {
        featuresRequiringLabel = featuresInExtent
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
    map,
    vessels,
    selectedVessel,
    mapMovingAndZoomEvent,
    filters,
    nonFilteredVesselsAreHidden,
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
    areVesselsDisplayed
  ])

  useEffect(() => {
    if (!riskFactorShowedOnMap) {
      setVesselToRiskFactorDetailsShowed(new Map())
    }
  }, [riskFactorShowedOnMap])

  useEffect(() => {
    const currentZoom = map.getView().getZoom().toFixed(2)
    if (currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom
    }
  }, [map, mapMovingAndZoomEvent])

  return (
    <>
      {currentLabels}
      <div /> {/* returns at least a div */}
    </>
  )
}
