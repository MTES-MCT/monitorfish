import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { getVesselIdentityFromFeature, Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import VesselLabelOverlay from '../components/overlays/VesselLabelOverlay'
import LineString from 'ol/geom/LineString'
import { usePrevious } from '../hooks/usePrevious'
import { VesselLabelLine } from '../domain/entities/vesselLabel'
import { VESSELS_UPDATE_EVENT } from './VesselsLayer'
import { labelLineStyle } from './styles/vesselLabelLine.style'

const MAX_LABELS_DISPLAYED = 150
const NOT_FOUND = -1

const VesselsLabelsLayer = ({ map, mapMovingAndZoomEvent }) => {
  const throttleDuration = 500 // ms

  const {
    filteredVesselsFeaturesUids,
    vesselsLayerSource
  } = useSelector(state => state.vessel)

  const {
    vesselLabelsShowedOnMap,
    vesselsLastPositionVisibility,
    vesselLabel
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
  const isThrottled = useRef(false)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 7,
    className: Layers.VESSELS_LABEL.code,
    source: vectorSource,
    zIndex: Layers.VESSELS_LABEL.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    style: labelLineStyle
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    if (previousFeaturesAndLabels && featuresAndLabels) {
      const previousFeatureIdsList = previousFeaturesAndLabels.map(({ feature }) => VesselLabelLine.getFeatureId(getVesselIdentityFromFeature(feature)))
      const featureIdsList = featuresAndLabels.map(({ feature }) => VesselLabelLine.getFeatureId(getVesselIdentityFromFeature(feature)))

      previousFeatureIdsList.forEach(id => {
        if (featureIdsList.indexOf(id) === NOT_FOUND) {
          const feature = vectorSource.getFeatureById(id)
          if (feature) {
            vectorSource.removeFeature(feature)
          }
        }
      })
    }
  }, [featuresAndLabels])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  useEffect(() => {
    if (isThrottled.current || !vesselsLayerSource) {
      return
    }

    vesselsLayerSource.on(VESSELS_UPDATE_EVENT, () => {
      addVesselLabelToAllFeaturesInExtent()
    })

    isThrottled.current = true
    setTimeout(() => {
      addVesselLabelToAllFeaturesInExtent()
      isThrottled.current = false
    }, throttleDuration)
  }, [vesselsLayerSource, mapMovingAndZoomEvent, filters, nonFilteredVesselsAreHidden, vesselLabelsShowedOnMap, vesselLabel])

  useEffect(() => {
    const currentZoom = map.getView().getZoom().toFixed(2)
    if (currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom
    }
  }, [mapMovingAndZoomEvent])

  function moveVesselLabelLine (featureId, coordinates, nextCoordinates, offset) {
    if (vesselToCoordinates.has(featureId)) {
      const existingLabelLineFeature = vectorSource.getFeatureById(featureId)
      if (existingLabelLineFeature) {
        existingLabelLineFeature.setGeometry(new LineString([coordinates, nextCoordinates]))
      }
    } else {
      const labelLineFeature = new VesselLabelLine(
        coordinates,
        nextCoordinates,
        featureId)

      vectorSource.addFeature(labelLineFeature)
    }

    const nextVesselToCoordinates = vesselToCoordinates
    nextVesselToCoordinates.set(featureId, { coordinates: nextCoordinates, offset })
    setVesselToCoordinates(nextVesselToCoordinates)
  }

  function addVesselLabelToAllFeaturesInExtent () {
    if (!vesselLabelsShowedOnMap) {
      setFeaturesAndLabels([])
      vectorSource.clear()
      return
    }

    const features = vesselsLayerSource.getFeaturesInExtent(map.getView().calculateExtent())
    const filterShowed = filters.find(filter => filter.showed)

    if (filterShowed && nonFilteredVesselsAreHidden) {
      addLabelToFilteredFeatures(features)
    } else if (features.length < MAX_LABELS_DISPLAYED) {
      addLabelToFeatures(features)
    } else {
      setFeaturesAndLabels([])
      vectorSource.clear()
    }
  }

  function addLabelToFilteredFeatures (features) {
    const filteredFeatures = features.filter(feature => {
      return isIncludedInFilterList(feature, filteredVesselsFeaturesUids)
    })

    if (filteredFeatures.length < MAX_LABELS_DISPLAYED) {
      addLabelToFeatures(filteredFeatures)
    }
  }

  function isIncludedInFilterList (feature, arrayOfUids) {
    return arrayOfUids && arrayOfUids.length && arrayOfUids.indexOf(feature.ol_uid) !== NOT_FOUND
  }

  function drawMovedLabelIfFoundAndReturnOffset (labelLineFeatureId, feature) {
    let offset = null

    if (vesselToCoordinates.has(labelLineFeatureId)) {
      const coordinatesAndOffset = vesselToCoordinates.get(labelLineFeatureId)
      offset = coordinatesAndOffset.offset

      const existingLabelLineFeature = vectorSource.getFeatureById(labelLineFeatureId)
      if (existingLabelLineFeature) {
        existingLabelLineFeature.setGeometry(new LineString([feature.getGeometry().getCoordinates(), coordinatesAndOffset.coordinates]))
      } else {
        const labelLineFeature = new VesselLabelLine(
          feature.getGeometry().getCoordinates(),
          coordinatesAndOffset.coordinates,
          labelLineFeatureId)

        vectorSource.addFeature(labelLineFeature)
      }
    }

    return offset
  }

  function addLabelToFeatures (features) {
    const nextFeaturesAndLabels = features.map(feature => {
      const label = Vessel.getVesselFeatureLabel(feature, vesselLabel, vesselsLastPositionVisibility)
      const identity = getVesselIdentityFromFeature(feature)
      const labelLineFeatureId = VesselLabelLine.getFeatureId(identity)
      const offset = drawMovedLabelIfFoundAndReturnOffset(labelLineFeatureId, feature)

      return {
        feature,
        label,
        offset,
        featureId: labelLineFeatureId
      }
    }).filter(object => object)

    setFeaturesAndLabels(nextFeaturesAndLabels)
  }

  return (<>
    {
      featuresAndLabels.map(({ feature, label, offset, featureId }) => {
        return <VesselLabelOverlay
          map={map}
          key={feature.ol_uid}
          featureId={featureId}
          moveVesselLabelLine={moveVesselLabelLine}
          text={label}
          flagState={feature.getProperties().flagState}
          offset={offset}
          coordinates={feature.getGeometry().getCoordinates()}
          zoomHasChanged={previousMapZoom.current}
        />
      })
    }
    <div />
  </>)
}

export default VesselsLabelsLayer
