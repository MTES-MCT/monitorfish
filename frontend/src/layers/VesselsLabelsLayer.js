import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { getVesselFeatureIdFromVessel, getVesselLastPositionVisibilityDates, Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import VesselLabelOverlay from '../features/map/overlays/VesselLabelOverlay'
import LineString from 'ol/geom/LineString'
import { usePrevious } from '../hooks/usePrevious'
import { VesselLabelLine } from '../domain/entities/vesselLabelLine'
import { getLabelLineStyle } from './styles/vesselLabelLine.style'

const MAX_LABELS_DISPLAYED = 200
const MAX_LABELS_DISPLAYED_IN_PREVIEW = 400
const NOT_FOUND = -1

const VesselsLabelsLayer = ({ map, mapMovingAndZoomEvent }) => {
  const throttleDuration = 500 // ms

  const {
    vessels,
    hideNonSelectedVessels,
    selectedVessel,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)

  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const {
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselsLastPositionVisibility,
    vesselLabel,
    hideVesselsAtPort
  } = useSelector(state => state.map)

  const {
    /** @type {VesselFilter[]} filters */
    filters,
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const [featuresAndLabels, setFeaturesAndLabels] = useState([])
  const previousMapZoom = useRef('')
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)
  const [vesselToCoordinates, setVesselToCoordinates] = useState(new Map())
  const [vesselToRiskFactorDetailsShowed, setVesselToRiskFactorDetailsShowed] = useState(new Map())
  const isThrottled = useRef(false)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 7,
    source: vectorSource,
    zIndex: Layers.VESSELS_LABEL.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: getLabelLineStyle
  }))

  const vesselsLayerSource = useRef(null)
  const [currentLabels, setCurrentLabels] = useState(null)

  useEffect(() => {
    if (map) {
      layer.name = Layers.VESSELS_LABEL.code
      map.getLayers().push(layer)

      const vesselsLayer = map.getLayers().getArray()?.find((ollayer) => {
        return ollayer.name === Layers.VESSELS.code
      })
      vesselsLayerSource.current = vesselsLayer?.getSource()
    }

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
    }
  })

  useEffect(() => {
    if (previousFeaturesAndLabels && featuresAndLabels) {
      const previousFeatureIdsList = previousFeaturesAndLabels.map(({ identity }) => VesselLabelLine.getFeatureId(identity))
      const featureIdsList = featuresAndLabels.map(({ identity }) => VesselLabelLine.getFeatureId(identity))

      previousFeatureIdsList.forEach(id => {
        if (featureIdsList.indexOf(id) === NOT_FOUND) {
          const feature = vectorSource.getFeatureById(id)
          if (feature) {
            vectorSource.removeFeature(feature)
          }
        }
      })

      function moveVesselLabelLine (featureId, coordinates, nextCoordinates, offset) {
        if (vesselToCoordinates.has(featureId)) {
          const existingLabelLineFeature = vectorSource.getFeatureById(featureId)
          if (existingLabelLineFeature) {
            existingLabelLineFeature.setGeometry(new LineString([coordinates, nextCoordinates]))
          }
        } else {
          const labelLineFeature = VesselLabelLine.getFeature(
            coordinates,
            nextCoordinates,
            featureId)

          vectorSource.addFeature(labelLineFeature)
        }

        const nextVesselToCoordinates = vesselToCoordinates
        nextVesselToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
        setVesselToCoordinates(nextVesselToCoordinates)
      }
      // TODO: use only one useEffect to directly render labels in one .map
      const labels = featuresAndLabels.map(({ identity, label, offset, featureId, opacity, trackIsShown }) => {
        return <VesselLabelOverlay
          map={map}
          key={identity.key}
          featureId={featureId}
          triggerShowRiskDetails={triggerShowRiskDetails}
          moveLine={moveVesselLabelLine}
          text={label?.labelText}
          riskFactor={label?.riskFactor}
          riskFactorDetailsShowed={vesselToRiskFactorDetailsShowed.get(featureId)}
          underCharter={label?.underCharter}
          flagState={identity.flagState}
          offset={offset}
          coordinates={identity.coordinates}
          zoomHasChanged={previousMapZoom.current}
          opacity={opacity}
          trackIsShown={trackIsShown}
          previewFilteredVesselsMode={previewFilteredVesselsMode}
        />
      })
      setCurrentLabels(labels)
    }
  }, [
    featuresAndLabels,
    previousMapZoom,
    previousMapZoom,
    vesselToRiskFactorDetailsShowed,
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselsLastPositionVisibility,
    vesselLabel,
    hideVesselsAtPort
  ])

  useEffect(() => {
    if (!riskFactorShowedOnMap) {
      setVesselToRiskFactorDetailsShowed(new Map())
    }
  }, [riskFactorShowedOnMap])

  useEffect(() => {
    if (isThrottled.current || !vessels) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      addVesselLabelToAllFeaturesInExtent()
      isThrottled.current = false
    }, throttleDuration)
  }, [
    vessels,
    mapMovingAndZoomEvent,
    filters,
    nonFilteredVesselsAreHidden,
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap,
    vesselLabel,
    vesselsLastPositionVisibility,
    hideNonSelectedVessels,
    vesselsTracksShowed,
    hideVesselsAtPort
  ])

  // useEffect(() => {
  //   if (vesselsLayerSource) {
  //     const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)

  //     vesselsLayerSource.forEachFeatureInExtent(map.getView().calculateExtent(), vesselFeature => {
  //       const opacity = Vessel.getVesselOpacity(vesselFeature.dateTime, vesselIsHidden, vesselIsOpacityReduced)
  //       const labelLineFeatureId = VesselLabelLine.getFeatureId(vesselFeature)

  //       const feature = vectorSource.getFeatureById(labelLineFeatureId)
  //       if (feature) {
  //         feature.set(VesselLabelLine.opacityProperty, opacity)
  //       }
  //     })
  //   }
  // }, [vesselsLayerSource, vesselsLastPositionVisibility])

  useEffect(() => {
    const currentZoom = map.getView().getZoom().toFixed(2)
    if (currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom
    }
  }, [map, mapMovingAndZoomEvent])

  // -----------

  function addVesselLabelToAllFeaturesInExtent () {
    if (!vesselLabelsShowedOnMap && !riskFactorShowedOnMap) {
      setFeaturesAndLabels([])
      vectorSource.clear()
      return
    }

    const featuresInExtent = vesselsLayerSource?.current?.getFeaturesInExtent(map.getView().calculateExtent()) || []
    const filterShowed = filters.find(filter => filter.showed)

    const isFiltered = filterShowed && nonFilteredVesselsAreHidden // && filteredVesselsFeaturesUids?.length FIXME: if filterShowed, is it really necessary to check filteredVesselsFeaturesUids ?

    let featuresRequireringLabel
    if (hideNonSelectedVessels) {
      const selectedVesselId = selectedVessel && Vessel.getVesselId(selectedVessel)
      const showedFeaturesIdentities = Object.keys(vesselsTracksShowed)
      featuresRequireringLabel = featuresInExtent.filter(feature => (selectedVessel && feature.getId() === selectedVesselId) || showedFeaturesIdentities.find(identity => feature?.getId()?.toString()?.includes(identity)))
    } else if (previewFilteredVesselsMode) {
      featuresRequireringLabel = featuresInExtent.filter(feature => feature.get('filterPreview'))
    } else if (isFiltered) {
      featuresRequireringLabel = featuresInExtent.filter(feature => feature.get('isFiltered'))
    } else {
      featuresRequireringLabel = featuresInExtent
    }
    const maxLabelsDisplayed = previewFilteredVesselsMode ? MAX_LABELS_DISPLAYED_IN_PREVIEW : MAX_LABELS_DISPLAYED
    if (featuresRequireringLabel.length < maxLabelsDisplayed) {
      addLabelToFeatures(featuresRequireringLabel)
    } else {
      setFeaturesAndLabels([])
      vectorSource.clear()
    }
  }

  function drawMovedLabelIfFoundAndReturnOffset (labelLineFeatureId, feature) {
    let offset = null

    if (vesselToCoordinates.has(labelLineFeatureId)) {
      const coordinatesAndOffset = vesselToCoordinates.get(labelLineFeatureId)
      offset = coordinatesAndOffset.offset

      const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
      if (existingLabelLineFeature) {
        existingLabelLineFeature.getGeometry().setCoordinates([feature.getGeometry().getCoordinates(), coordinatesAndOffset.coordinates])
      } else {
        const labelLineFeature = VesselLabelLine.getFeature(
          feature.getGeometry().getCoordinates(),
          coordinatesAndOffset.coordinates,
          labelLineFeatureId)

        vectorSource.addFeature(labelLineFeature)
      }
    }

    return offset
  }

  function addLabelToFeatures (features) {
    const { vesselIsHidden, vesselIsOpacityReduced } = getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    const showedTracksVesselsIdentities = Object.keys(vesselsTracksShowed)

    const nextFeaturesAndLabels = features
      .map(feature => {
        const featureProperties = feature.getProperties()
        const label = Vessel.getVesselFeatureLabel(featureProperties, {
          vesselLabel,
          vesselsLastPositionVisibility,
          riskFactorShowedOnMap,
          vesselLabelsShowedOnMap,
          hideVesselsAtPort
        })
        const labelLineFeatureId = VesselLabelLine.getFeatureId(featureProperties)
        const offset = drawMovedLabelIfFoundAndReturnOffset(labelLineFeatureId, feature)
        const trackIsShown = showedTracksVesselsIdentities.includes(getVesselFeatureIdFromVessel(featureProperties))

        return {
          identity: {
            key: feature.ol_uid,
            flagState: featureProperties.flagState,
            coordinates: feature.getGeometry().getCoordinates(),
            internalReferenceNumber: featureProperties.internalReferenceNumber,
            ircs: featureProperties.ircs,
            externalReferenceNumber: featureProperties.externalReferenceNumber
          },
          trackIsShown,
          opacity: Vessel.getVesselOpacity(featureProperties.dateTime, vesselIsHidden, vesselIsOpacityReduced),
          label,
          offset,
          featureId: labelLineFeatureId
        }
      })

    setFeaturesAndLabels(nextFeaturesAndLabels)
  }

  function triggerShowRiskDetails (featureId) {
    const previousValue = vesselToRiskFactorDetailsShowed.get(featureId)

    const nextVesselToRiskFactorDetailsShowed = vesselToRiskFactorDetailsShowed
    nextVesselToRiskFactorDetailsShowed.set(featureId, !previousValue)

    setVesselToRiskFactorDetailsShowed(nextVesselToRiskFactorDetailsShowed)
  }
  return (<>
    { currentLabels }
     <div /> { /* returns at least a div */ }
  </>)
}

export default VesselsLabelsLayer
