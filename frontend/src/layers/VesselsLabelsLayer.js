import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { Vessel } from '../domain/entities/vessel'
import { Vector } from 'ol/layer'
import VesselLabelOverlay from '../components/overlays/VesselLabelOverlay'

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
  const isThrottled = useRef(false)

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 7,
    className: Layers.VESSELS.code,
    source: vectorSource,
    zIndex: Layers.VESSELS.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  function addLayerToMap () {
    if (map) {
      map.getLayers().push(layer)
    }
  }

  useEffect(() => {
    if (isThrottled.current || !vesselsLayerSource) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      addVesselLabelToAllFeaturesInExtent()
      isThrottled.current = false
    }, throttleDuration)
  }, [vesselsLayerSource, mapMovingAndZoomEvent, filters, nonFilteredVesselsAreHidden])

  function addVesselLabelToAllFeaturesInExtent () {
    if (!vesselLabelsShowedOnMap) {
      setFeaturesAndLabels([])
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

  function addLabelToFeatures (features) {
    const nextFeaturesAndLabels = features.map(feature => {
      const label = Vessel.getVesselFeatureLabel(feature, vesselLabel, vesselsLastPositionVisibility)

      return {
        feature,
        label
      }
    }).filter(object => object)

    setFeaturesAndLabels(nextFeaturesAndLabels)
  }

  return (<>
    {
      featuresAndLabels.map(({ feature, label }) => {
        return <VesselLabelOverlay
          map={map}
          key={feature.ol_uid}
          text={label}
          flagState={feature.getProperties().flagState}
          coordinates={feature.getGeometry().getCoordinates()}
        />
      })
    }
    <div />
  </>)
}

export default VesselsLabelsLayer
