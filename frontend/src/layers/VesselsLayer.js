import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { v4 as uuidv4 } from 'uuid'
import Layers, { vesselIconIsLight } from '../domain/entities/layers'
import { getSVG, getVesselIconOpacity, getVesselImage, getVesselLabelStyle } from './styles/featuresStyles'
import {
  setSelectedVesselWasHiddenByFilter,
  setVesselsLayerSource,
  updateVesselFeatureAndIdentity,
  updateVesselLastPositionFeatureAndIdentity
} from '../domain/reducers/Vessel'
import {
  getVesselFeatureAndIdentity,
  getVesselIdentityFromFeature,
  TEMPORARY_VESSEL_TRACK,
  Vessel,
  VESSEL_ICON_STYLE,
  VESSEL_LABEL_STYLE,
  VESSEL_SELECTOR_STYLE,
  vesselAndVesselFeatureAreEquals,
  vesselsAreEquals
} from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { animateToVessel } from '../domain/reducers/Map'

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
  const { filters, nonFilteredVesselsAreHidden } = useSelector(state => state.filter)

  const [filteredVesselsFeaturesUids, setFilteredVesselsFeaturesUids] = useState([])

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
    const feature = buildNewVesselFeature()

    if (feature) {
      saveVesselLastPositionIfFound()

      dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(feature, getVesselIdentityFromFeature(feature))))
      if(!updatedFromCron) {
        showVesselIfHiddenByFilter(feature)
        dispatch(animateToVessel(true))
      }
    }
  }, [selectedVessel])

  useEffect(() => {
    movePreviouslySelectedVesselFeatureToLastKnownPositionWhenDeselected()
  }, [selectedVessel])

  useEffect(() => {
    addSelectorIconToSelectedVessel()
  }, [selectedVesselFeatureAndIdentity])

  useEffect(() => {
    addOrRemoveVesselLabelWhenZooming()
  }, [vesselLabelsShowedOnMap, map, vesselLabelsHiddenByZoom, isMoving, vesselLabel, filteredVesselsFeaturesUids])

  useEffect(() => {
    applyFilterToVessels(vectorSource.getFeatures(), rewriteVesselsStylesIfNoFilter).then(_ => {
      vectorSource.changed()
    })
  }, [filters, nonFilteredVesselsAreHidden, selectedBaseLayer])

  function saveVesselLastPositionIfFound () {
    const vesselLastPosition = vessels.find(vessel => vesselsAreEquals(vessel, selectedVessel))
    if(vesselLastPosition) {
      const vesselLastPositionFeature = buildFeature(vesselLastPosition, `${uuidv4()}`, false)
      dispatch(updateVesselLastPositionFeatureAndIdentity(getVesselFeatureAndIdentity(vesselLastPositionFeature, vesselLastPosition)))
    }
  }

  function showVesselIfHiddenByFilter (feature) {
    const foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
    const isLight = vesselIconIsLight(selectedBaseLayer)
    if (foundStyle) {
      if (!foundStyle.getImage().getOpacity()) {
        dispatch(setSelectedVesselWasHiddenByFilter(true))
      }

      const showedFilter = filters.find(filter => filter.showed)
      const filterColor = showedFilter ? showedFilter.color : null
      const colorToApply = filterColor && feature.getProperties().isShowedInFilter ? filterColor : null

      Vessel.setVesselFeatureImages(feature, colorToApply, isLight, foundStyle, true, vesselsLastPositionVisibility)
    }
  }

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
        .map((currentVessel, index) => buildFeature(currentVessel, index, true))
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

    const color = showedFilter ? showedFilter.color : null
    const isLight = vesselIconIsLight(selectedBaseLayer)

    dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
      .then(filteredVessels => {
        const filteredVesselsUids = filteredVessels.map(vessel => vessel.uid)
        setFilteredVesselsFeaturesUids(filteredVesselsUids)

        vesselsFeatures.forEach(feature => {
          Vessel.applyVesselFeatureFilterStyle(feature, filteredVesselsUids, color, isLight, nonFilteredVesselsAreHidden, vesselsLastPositionVisibility)
        })

        return resolve(vesselsFeatures)
      })
  })

  function rewriteVesselsStylesIfNoFilter () {
    const isLight = vesselIconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      const foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      if (foundStyle) {
        Vessel.setVesselFeatureImages(feature, null, isLight, foundStyle, vesselsLastPositionVisibility)
      }
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

  function buildNewVesselFeature () {
    if (selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const vesselFeatureAlreadyShowedInLayer = vectorSource.getFeatures().find(feature => {
        return vesselAndVesselFeatureAreEquals(selectedVessel, feature)
      })

      if (vesselFeatureAlreadyShowedInLayer) {
        let vesselToDraw = selectedVessel
        const vesselLastPosition = vessels.find(vessel => vesselsAreEquals(vessel, selectedVessel))
        if(vesselLastPosition &&
          selectedVessel.positions[selectedVessel.positions.length - 1].latitude === vesselLastPosition.latitude &&
          selectedVessel.positions[selectedVessel.positions.length - 1].longitude === vesselLastPosition.longitude) {
          vesselToDraw = vesselLastPosition
        }

        const feature = buildFeature(vesselToDraw, `${TEMPORARY_VESSEL_TRACK}:${uuidv4()}`, false)
        vectorSource.removeFeature(vesselFeatureAlreadyShowedInLayer)
        vectorSource.addFeature(feature)
        vectorSource.changed()

        return feature
      } else {
        const feature = buildFeature(selectedVessel, `${TEMPORARY_VESSEL_TRACK}:${uuidv4()}`, false)
        vectorSource.addFeature(feature)
        vectorSource.changed()

        return feature
      }
    }
  }

  function movePreviouslySelectedVesselFeatureToLastKnownPositionWhenDeselected () {
    if (!selectedVessel && !selectedVesselFeatureAndIdentity && selectedVesselLastPositionFeatureAndIdentity) {
      vectorSource.addFeature(selectedVesselLastPositionFeatureAndIdentity.feature)
    } else if(selectedVesselFeatureAndIdentity &&
      selectedVesselLastPositionFeatureAndIdentity &&
      !vesselsAreEquals(selectedVesselFeatureAndIdentity.identity, selectedVesselLastPositionFeatureAndIdentity.identity)) {
      vectorSource.addFeature(selectedVesselLastPositionFeatureAndIdentity.feature)
    }
  }

  function addVesselSelectorStyleAndUpdateFeature (feature) {
    const styles = feature.getStyle()
    const vesselAlreadyWithSelectorStyle = styles.find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)

    if (!vesselAlreadyWithSelectorStyle) {
      feature.setStyle([...styles, Vessel.getSelectedVesselStyle()])
      const vesselIdentity = getVesselIdentityFromFeature(feature)
      dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(feature, vesselIdentity)))
    }
  }

  function addSelectorIconToSelectedVessel () {
    if (selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.feature && !removeSelectedIconToFeature) {
      addVesselSelectorStyleAndUpdateFeature(selectedVesselFeatureAndIdentity.feature)
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
          Vessel.addVesselLabelToFeature(feature, vesselLabel)
        })
      }
    }
  }

  function addLabelForFeaturesInExtentAndIncludedInArray (extent, arrayOfUids) {
    vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
      const featureIndex = arrayOfUids.indexOf(feature.ol_uid)

      if (featureIndex !== NOT_FOUND) {
        Vessel.addVesselLabelToFeature(feature, vesselLabel, vesselsLastPositionVisibility)
      }
    })
  }

  function removeVesselLabelToAllFeatures () {
    vectorSource.getFeatures().forEach(feature => {
      Vessel.removeVesselLabelToFeature(feature)
    })
  }

  const buildFeature = (vesselFromAPI, id, isBuildingLastPositionVessels) => {
    const position = Vessel.getPosition(vesselFromAPI, selectedVesselFeatureAndIdentity, selectedVessel)

    const vessel = new Vessel(vesselFromAPI, position, id)

    const options = {
      selectedVesselFeatureAndIdentity: selectedVesselFeatureAndIdentity,
      vesselsLastPositionVisibility: vesselsLastPositionVisibility,
      isLight: vesselIconIsLight(selectedBaseLayer),
      temporaryVesselsToHighLightOnMap: temporaryVesselsToHighLightOnMap
    }
    vessel.setVesselStyle(options)

    if (vessel.isSelectedVessel(selectedVesselFeatureAndIdentity) && isBuildingLastPositionVessels) {
      dispatch(updateVesselLastPositionFeatureAndIdentity(getVesselFeatureAndIdentity(vessel.feature, vesselFromAPI)))

      return null
    }

    return vessel.feature
  }

  return null
}

export default VesselsLayer
