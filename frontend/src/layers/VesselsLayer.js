import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import {
  setVesselsLayerSource,
  updateVesselLastPositionFeature,
  updateVesselLastPositionFeatureAndIdentity
} from '../domain/reducers/Vessel'
import { getVesselFeatureAndIdentity, Vessel, vesselAndVesselFeatureAreEquals } from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8
const NOT_FOUND = -1

const VesselsLayer = ({ map }) => {
  const {
    vessels,
    selectedVessel,
    removeSelectedIconToFeature,
    selectedVesselFeatureAndIdentity,
    selectedVesselLastPositionFeatureAndIdentity,
    temporaryVesselsToHighLightOnMap
  } = useSelector(state => state.vessel)
  const {
    vesselLabelsHiddenByZoom,
    vesselLabelsShowedOnMap,
    updatedFromCron,
    extent,
    isMoving,
    selectedBaseLayer,
    vesselsLastPositionVisibility,
    vesselLabel
  } = useSelector(state => state.map)
  const {
    /** @type {VesselFilter[]} filters */
    filters,
    nonFilteredVesselsAreHidden
  } = useSelector(state => state.filter)

  const [filteredVesselsFeaturesUids, setFilteredVesselsFeaturesUids] = useState([])

  const getFilterColor = useCallback(() => {
    const showedFilter = filters.find(filter => filter.showed)
    return showedFilter ? showedFilter.color : null
  }, [filters])

  const dispatch = useDispatch()

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

  useEffect(() => {
    addVesselsFeaturesToMap()
  }, [vessels, map])

  useEffect(() => {
    highLightVesselsOnMap()
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    showBackVesselsIconsWhenClosingVesselsHighLight()
  }, [vesselsLastPositionVisibility, temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    addOrRemoveVesselLabelWhenZooming()
  }, [vesselLabelsShowedOnMap, map, vesselLabelsHiddenByZoom, isMoving, vesselLabel, filteredVesselsFeaturesUids])

  useEffect(() => {
    applyFilterToVessels(vectorSource.getFeatures(), rewriteVesselsStylesIfNoFilter).then(_ => {
      vectorSource.changed()
    })
  }, [filters, nonFilteredVesselsAreHidden, selectedBaseLayer])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  function getSelectedFeature () {
    let featureToKeep = null
    if (selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.feature) {
      const selectedVesselFeatureId = selectedVesselFeatureAndIdentity.feature.getId()
      featureToKeep = vectorSource.getFeatureById(selectedVesselFeatureId)
    }
    return featureToKeep
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels && vessels.length) {
      const vesselsFeatures = vessels
        .filter(vessel => vessel)
        .map((currentVessel, index) => buildLastPositionFeature(currentVessel, index))
        .filter(vessel => vessel)

      applyFilterToVessels(vesselsFeatures, () => {}).then(features => {
        const featureToReDraw = getSelectedFeature()
        vectorSource.clear(true)

        if (featureToReDraw) {
          vectorSource.addFeature(featureToReDraw)
        }
        vectorSource.addFeatures(features)
        vectorSource.dispatchEvent({
          type: VESSELS_UPDATE_EVENT,
          features: features
        })

        addVesselLabelToAllFeaturesInExtent(extent)
      })
    }
  }

  const applyFilterToVessels = (vesselsFeatures, noFilterFunction) => new Promise(resolve => {
    if (!filters || !filters.length) {
      return resolve(vesselsFeatures)
    }

    const showedFilter = filters.find(filter => filter.showed)
    if (!showedFilter) {
      noFilterFunction()
      return resolve(vesselsFeatures)
    }

    const vesselsObjects = vesselsFeatures.map(feature => {
      const coordinates = [...feature.getGeometry().getCoordinates()]

      return getVesselObjectFromFeature(feature, coordinates)
    })

    dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
      .then(filteredVessels => {
        const filteredVesselsUids = filteredVessels.map(vessel => vessel.uid)
        setFilteredVesselsFeaturesUids(filteredVesselsUids)

        vesselsFeatures.forEach(feature => {
          Vessel.applyVesselFeatureFilterStyle(
            feature,
            {
              filteredVesselsUids,
              color: getFilterColor(),
              isLight: Vessel.iconIsLight(selectedBaseLayer),
              nonFilteredVesselsAreHidden,
              vesselsLastPositionVisibility
            })

          if(selectedVesselLastPositionFeatureAndIdentity &&
            vesselAndVesselFeatureAreEquals(selectedVesselLastPositionFeatureAndIdentity.identity, feature)) {
            dispatch(updateVesselLastPositionFeature(feature))
          }
        })
        return resolve(vesselsFeatures)
      })
  })

  function rewriteVesselsStylesIfNoFilter () {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      Vessel.setVesselFeatureImages(
        feature,
        {
          isLight,
          vesselsLastPositionVisibility
        })
    })
  }

  function highLightVesselsOnMap () {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      const temporaryVesselsToHighLightOnMapUids = temporaryVesselsToHighLightOnMap.map(vessel => vessel.uid)

      vectorSource.getFeatures().filter(feature => {
        const featureIndex = temporaryVesselsToHighLightOnMapUids.indexOf(feature.ol_uid)

        return featureIndex === NOT_FOUND
      }).forEach(featureToHide => {
        Vessel.hideVesselFeature(featureToHide)
      })

      vectorSource.changed()
    }
  }

  function showBackVesselsIconsWhenClosingVesselsHighLight () {
    if (vesselsLastPositionVisibility && (!temporaryVesselsToHighLightOnMap || !temporaryVesselsToHighLightOnMap.length) && map) {
      const features = vectorSource.getFeatures()

      applyFilterToVessels(features, () => {}).then(_ => {
        vectorSource.changed()
      })
    }
  }

  function addOrRemoveVesselLabelWhenZooming () {
    if (map) {
      if (vesselLabelsHiddenByZoom === undefined) {
        return
      }

      if (vesselLabelsShowedOnMap && !vesselLabelsHiddenByZoom && isVesselLabelMinimumZoom()) {
        addVesselLabelToAllFeaturesInExtent(null)
      } else if (vesselLabelsShowedOnMap && vesselLabelsHiddenByZoom) {
        removeVesselLabelToAllFeatures()
      } else if (!vesselLabelsShowedOnMap) {
        removeVesselLabelToAllFeatures()
      }
    }
  }

  function isVesselLabelMinimumZoom () {
    return map && map.getView().getZoom() > MIN_ZOOM_VESSEL_LABELS
  }

  function addVesselLabelToAllFeaturesInExtent (extent) {
    const vesselLabelsIsShowedOnMap = vesselLabelsHiddenByZoom === undefined
      ? false
      : vesselLabelsShowedOnMap && !vesselLabelsHiddenByZoom

    if (vesselLabelsIsShowedOnMap) {
      extent = extent || map.getView().calculateExtent()

      const filterShowed = filters.find(filter => filter.showed)

      if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
        const temporaryVesselsToHighLightOnMapUids = temporaryVesselsToHighLightOnMap.map(vessel => vessel.uid)

        addLabelForFeaturesInExtentAndIncludedInArray(extent, temporaryVesselsToHighLightOnMapUids)
      } else if (filterShowed && nonFilteredVesselsAreHidden) {
        addLabelForFeaturesInExtentAndIncludedInArray(extent, filteredVesselsFeaturesUids)
      } else {
        vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
          Vessel.addLabelToVesselFeature(feature, vesselLabel, vesselsLastPositionVisibility)
        })
      }
    }
  }

  function addLabelForFeaturesInExtentAndIncludedInArray (extent, arrayOfUids) {
    vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
      const featureIndex = arrayOfUids.indexOf(feature.ol_uid)

      if (featureIndex !== NOT_FOUND) {
        Vessel.addLabelToVesselFeature(feature, vesselLabel, vesselsLastPositionVisibility)
      }
    })
  }

  function removeVesselLabelToAllFeatures () {
    vectorSource.getFeatures().forEach(feature => {
      Vessel.removeLabelToVesselFeature(feature)
    })
  }

  const buildLastPositionFeature = (vesselFromAPI, id) => {
    const vesselOptions = {
      selectedVesselFeatureAndIdentity,
      selectedVessel,
      id,
      vesselsLastPositionVisibility,
      isLight: Vessel.iconIsLight(selectedBaseLayer),
      temporaryVesselsToHighLightOnMap
    }
    const vessel = new Vessel(vesselFromAPI, vesselOptions)

    if (vessel.isSelectedVessel(selectedVesselFeatureAndIdentity)) {
      Vessel.setVesselAsSelected(vessel)
      dispatch(updateVesselLastPositionFeatureAndIdentity(getVesselFeatureAndIdentity(vessel.feature, vesselFromAPI)))
    }

    return vessel.feature
  }

  return null
}

export default VesselsLayer
