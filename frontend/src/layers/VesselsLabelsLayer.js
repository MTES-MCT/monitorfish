import LineString from 'ol/geom/LineString'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import Layers from '../domain/entities/layers'
import { getVesselId, getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { drawMovedLabelIfFoundAndReturnOffset, VesselLabelLine } from '../domain/entities/vesselLabelLine'
import VesselLabelOverlay from '../features/map/overlays/VesselLabelOverlay'
import { usePrevious } from '../hooks/usePrevious'
import { getLabelLineStyle } from './styles/vesselLabelLine.style'

const MAX_LABELS_DISPLAYED = 200
const MAX_LABELS_DISPLAYED_IN_PREVIEW = 400
const NOT_FOUND = -1

function VesselsLabelsLayer({ map, mapMovingAndZoomEvent }) {
  const throttleDuration = 250 // ms

  const { hideNonSelectedVessels, selectedVessel, vessels, vesselsTracksShowed } = useSelector(state => state.vessel)

  const { adminRole, previewFilteredVesselsMode } = useSelector(state => state.global)

  const {
    hideVesselsAtPort,
    riskFactorShowedOnMap,
    vesselLabel,
    vesselLabelsShowedOnMap,
    vesselsLastPositionVisibility,
  } = useSelector(state => state.map)

  const {
    /** @type {VesselFilter[]} filters */
    filters,
    nonFilteredVesselsAreHidden,
  } = useSelector(state => state.filter)

  const [featuresAndLabels, setFeaturesAndLabels] = useState([])
  const previousMapZoom = useRef('')
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)
  const [vesselToCoordinates, setVesselToCoordinates] = useState(new Map())
  const [vesselToRiskFactorDetailsShowed, setVesselToRiskFactorDetailsShowed] = useState(new Map())
  const isThrottled = useRef(false)

  const vectorSourceRef = useRef(null)
  const layerRef = useRef(null)
  const vesselsLayerSourceRef = useRef(null)
  const [currentLabels, setCurrentLabels] = useState(null)

  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false,
      })
    }

    return vectorSourceRef.current
  }

  function getLayer() {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 7,
        source: getVectorSource(),
        style: getLabelLineStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.VESSELS_LABEL.zIndex,
      })
    }

    return layerRef.current
  }

  useEffect(() => {
    if (map) {
      getLayer().name = Layers.VESSELS_LABEL.code
      map.getLayers().push(getLayer())

      const vesselsLayer = map
        .getLayers()
        .getArray()
        ?.find(olLayer => olLayer.name === Layers.VESSELS.code)
      vesselsLayerSourceRef.current = vesselsLayer?.getSource()
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map])

  useEffect(() => {
    if (previousFeaturesAndLabels && featuresAndLabels) {
      const previousFeatureIdsList = previousFeaturesAndLabels.map(({ identity }) =>
        VesselLabelLine.getFeatureId(identity),
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

      function moveVesselLabelLine(featureId, fromCoordinates, toCoordinates, offset, opacity) {
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
      }

      function triggerShowRiskDetails(featureId) {
        const previousValue = vesselToRiskFactorDetailsShowed.get(featureId)
        const nextVesselToRiskFactorDetailsShowed = vesselToRiskFactorDetailsShowed
        nextVesselToRiskFactorDetailsShowed.set(featureId, !previousValue)
        setVesselToRiskFactorDetailsShowed(nextVesselToRiskFactorDetailsShowed)
      }

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
          triggerShowRiskDetails={triggerShowRiskDetails}
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
  ])

  useEffect(() => {
    if (vesselsLayerSourceRef) {
      const { vesselIsHidden, vesselIsOpacityReduced } =
        getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

      vesselsLayerSourceRef?.current?.forEachFeatureInExtent(map.getView().calculateExtent(), vesselFeature => {
        const { vesselProperties } = vesselFeature
        const opacity = Vessel.getVesselOpacity(vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced)
        const labelLineFeatureId = VesselLabelLine.getFeatureId(vesselProperties)
        const feature = vectorSourceRef?.current?.getFeatureById(labelLineFeatureId)
        if (feature) {
          feature.set(VesselLabelLine.opacityProperty, opacity)
        }
      })
    }
  }, [map, vesselsLayerSourceRef, vesselsLastPositionVisibility])

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
        showedTracksVesselsIdentities.push(getVesselId(selectedVessel))
      }

      const nextFeaturesAndLabels = features.map(feature => {
        const { vesselProperties } = feature
        const label = Vessel.getVesselFeatureLabel(vesselProperties, {
          adminRole,
          hideVesselsAtPort,
          riskFactorShowedOnMap,
          vesselLabel,
          vesselLabelsShowedOnMap,
          vesselsLastPositionVisibility,
        })
        const labelLineFeatureId = VesselLabelLine.getFeatureId(vesselProperties)
        const opacity =
          Vessel.getVesselOpacity(vesselProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced) ||
          vesselProperties?.beaconMalfunctionId
            ? 1
            : 0
        const offset = drawMovedLabelIfFoundAndReturnOffset(
          getVectorSource(),
          vesselToCoordinates,
          labelLineFeatureId,
          feature,
          opacity,
        )
        const trackIsShown = showedTracksVesselsIdentities.includes(getVesselId(vesselProperties))

        return {
          featureId: labelLineFeatureId,
          identity: {
            coordinates: feature.getGeometry().getCoordinates(),
            flagState: vesselProperties.flagState,
            externalReferenceNumber: vesselProperties.externalReferenceNumber,
            internalReferenceNumber: vesselProperties.internalReferenceNumber,
            ircs: vesselProperties.ircs,
            key: feature.ol_uid,
            vesselIdentifier: vesselProperties.vesselIdentifier,
            vesselName: vesselProperties.vesselName,
          },
          label,
          offset,
          opacity,
          trackIsShown,
        }
      })

      setFeaturesAndLabels(nextFeaturesAndLabels)
    }

    function addVesselLabelToAllFeaturesInExtent() {
      const doNotShowLabels =
        (adminRole && !vesselLabelsShowedOnMap && !riskFactorShowedOnMap) || (!adminRole && !vesselLabelsShowedOnMap)
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

      const featuresInExtent =
        vesselsLayerSourceRef?.current?.getFeaturesInExtent(map.getView().calculateExtent()) || []
      const filterShowed = filters.find(filter => filter.showed)
      const isFiltered = filterShowed && nonFilteredVesselsAreHidden // && filteredVesselsFeaturesUids?.length FIXME: if filterShowed, is it really necessary to check filteredVesselsFeaturesUids ?
      let featuresRequiringLabel
      if (hideNonSelectedVessels) {
        const selectedVesselId = selectedVessel && Vessel.getVesselFeatureId(selectedVessel)
        const showedFeaturesIdentities = Object.keys(vesselsTracksShowed)
        featuresRequiringLabel = featuresInExtent.filter(
          feature =>
            (selectedVessel && feature.getId() === selectedVesselId) ||
            showedFeaturesIdentities.find(identity => feature?.getId()?.toString()?.includes(identity)),
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
    adminRole,
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

export default VesselsLabelsLayer
