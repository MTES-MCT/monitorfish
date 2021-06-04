import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { v4 as uuidv4 } from 'uuid'
import Layers, { vesselIconIsLight } from '../domain/entities/layers'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Point from 'ol/geom/Point'
import { getSVG, getVesselIconOpacity, getVesselImage, getVesselLabelStyle } from './styles/featuresStyles'
import {
  setSelectedVesselWasHiddenByFilter,
  setVesselsLayerSource,
  updateVesselFeatureAndIdentity
} from '../domain/reducers/Vessel'
import {
  getVesselFeatureAndIdentity,
  getVesselIdentityFromFeature, TEMPORARY_VESSEL_TRACK,
  Vessel,
  VESSEL_ICON_STYLE,
  VESSEL_LABEL_STYLE,
  VESSEL_SELECTOR_STYLE,
  vesselAndVesselFeatureAreEquals,
  vesselsAreEquals
} from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'
import { animateToVessel, setUpdatedFromCron } from '../domain/reducers/Map'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 8
const NOT_FOUND_INDEX = -1

const VesselsLayer = ({ map }) => {
  const vessels = useSelector(state => state.vessel.vessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const removeSelectedIconToFeature = useSelector(state => state.vessel.removeSelectedIconToFeature)
  const selectedVesselFeatureAndIdentity = useSelector(state => state.vessel.selectedVesselFeatureAndIdentity)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const vesselLabelsHiddenByZoom = useSelector(state => state.map.vesselLabelsHiddenByZoom)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
  const updatedFromCron = useSelector(state => state.map.updatedFromCron)
  const extent = useSelector(state => state.map.extent)
  const { filters, nonFilteredVesselsAreHidden } = useSelector(state => state.filter)
  const isMoving = useSelector(state => state.map.isMoving)
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
  const vesselLabel = useSelector(state => state.map.vesselLabel)

  const [selectedVesselLastPosition, setSelectedVesselLastPosition] = useState(null)
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
    const feature = moveExistingGeometryToVesselLastPositionOrBuildNewFeature()

    if (feature) {
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

      setVesselImages(feature, colorToApply, isLight, foundStyle, true)
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
        .map((currentVessel, index) => buildFeature(currentVessel, index))
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
        const uids = filteredVessels.map(vessel => vessel.uid)
        setFilteredVesselsFeaturesUids(uids)

        vesselsFeatures.forEach(feature => {
          setVesselStyle(feature, uids, color, isLight)
        })

        return resolve(vesselsFeatures)
      })
  })

  function setVesselStyle (feature, uids, color, isLight) {
    const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)

    const isShowedInFilterProperty = 'isShowedInFilter'
    if (vesselIconStyle) {
      const featureIndex = uids.indexOf(feature.ol_uid)

      if (featureIndex !== NOT_FOUND_INDEX) {
        setVesselImages(feature, color, isLight, vesselIconStyle)
        feature.set(isShowedInFilterProperty, true)
      } else if (nonFilteredVesselsAreHidden) {
        hideVesselImages(feature, vesselIconStyle)
        feature.set(isShowedInFilterProperty, false)
      } else {
        setVesselImages(feature, null, isLight, vesselIconStyle)
        feature.set(isShowedInFilterProperty, false)
      }
    }
  }

  function hideVesselImages (feature, vesselIconStyle) {
    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(0)
    }

    vesselIconStyle.getImage().setOpacity(0)
  }

  function setVesselImages (feature, color, isLight, vesselIconStyle, withoutOpacity) {
    const vesselImage = getVesselImage({
      speed: feature.getProperties().speed,
      course: feature.getProperties().course
    }, isLight, color)

    vesselIconStyle.setImage(vesselImage)
    if(!withoutOpacity) {
      const opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
      vesselIconStyle.getImage().setOpacity(opacity)
    }

    const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(1)
    }
  }

  function rewriteVesselsStylesIfNoFilter () {
    const isLight = vesselIconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      const foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      if (foundStyle) {
        setVesselImages(feature, null, isLight, foundStyle)
      }
    })
  }

  function highLightVesselsOnMap () {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      const temporaryVesselsToHighLightOnMapUids = temporaryVesselsToHighLightOnMap.map(vessel => vessel.uid)

      vectorSource.getFeatures().filter(feature => {
        const featureIndex = temporaryVesselsToHighLightOnMapUids.indexOf(feature.ol_uid)

        return featureIndex === NOT_FOUND_INDEX
      }).forEach(featureToHide => {
        hideVessel(featureToHide)
      })

      vectorSource.changed()
    }
  }

  function hideVessel (featureToHide) {
    const vesselIconStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
    if (vesselIconStyle) {
      vesselIconStyle.getImage().setOpacity(0)
    }
    const vesselLabelStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
    if (vesselLabelStyle) {
      vesselLabelStyle.getImage().setOpacity(0)
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

  function moveExistingGeometryToVesselLastPositionOrBuildNewFeature () {
    if (selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const featureToModify = vectorSource.getFeatures().find(feature => {
        return vesselAndVesselFeatureAreEquals(selectedVessel, feature)
      })

      if (featureToModify) {
        // TODO Build a new image withthe course and not only the change the geometry
        moveFeatureToNewPosition(featureToModify)

        return featureToModify
      } else {
        const feature = buildFeature(selectedVessel, `${TEMPORARY_VESSEL_TRACK}:${uuidv4()}`)
        vectorSource.addFeature(feature)

        return feature
      }
    }
  }

  function movePreviouslySelectedVesselFeatureToLastKnownPositionWhenDeselected () {
    if (!selectedVessel && selectedVesselLastPosition) {
      const featureToModify = vectorSource.getFeatures().find(feature => {
        return vesselAndVesselFeatureAreEquals(selectedVesselLastPosition, feature)
      })

      if (featureToModify) {
        featureToModify.setGeometry(selectedVesselLastPosition.geometry)
      }
      setSelectedVesselLastPosition(null)
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
          addVesselLabelToVesselFeature(feature, vesselLabel)
        })
      }
    }
  }

  function addLabelForFeaturesInExtentAndIncludedInArray (extent, arrayOfUids) {
    vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
      const featureIndex = arrayOfUids.indexOf(feature.ol_uid)

      if (featureIndex !== NOT_FOUND_INDEX) {
        addVesselLabelToVesselFeature(feature, vesselLabel)
      }
    })
  }

  function addVesselLabelToVesselFeature (feature, vesselLabel) {
    const vesselDate = new Date(feature.getProperties().dateTime)
    const vesselIsHidden = new Date()
    vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

    if (vesselDate > vesselIsHidden) {
      getSVG(feature, vesselLabel).then(svg => {
        if (svg) {
          const style = getVesselLabelStyle(svg.showedText, svg.imageElement)

          const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
          if (!vesselLabelStyle || vesselLabelStyle.getImage() !== svg.imageElement) {
            const stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_LABEL_STYLE)

            feature.setStyle([...stylesWithoutVesselName, style])
          }
        }
      })
    }
  }

  function removeVesselLabelToAllFeatures () {
    vectorSource.getFeatures().forEach(feature => {
      const stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_LABEL_STYLE)
      feature.setStyle([...stylesWithoutVesselName])
    })
  }

  function moveFeatureToNewPosition (featureToModify) {
    const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]
    const newCoordinates = transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    setSelectedVesselLastPosition({
      internalReferenceNumber: featureToModify.getProperties().internalReferenceNumber,
      externalReferenceNumber: featureToModify.getProperties().externalReferenceNumber,
      ircs: featureToModify.getProperties().ircs,
      geometry: featureToModify.getGeometry()
    })
    addVesselSelectorStyleAndUpdateFeature(featureToModify)
    featureToModify.setGeometry(new Point(newCoordinates))
  }

  const buildFeature = (vesselFromAPI, id) => {
    const position = Vessel.getPosition(vesselFromAPI, selectedVesselFeatureAndIdentity, selectedVessel)

    const vessel = new Vessel(vesselFromAPI, position, id)

    const options = {
      selectedVesselFeatureAndIdentity: selectedVesselFeatureAndIdentity,
      vesselsLastPositionVisibility: vesselsLastPositionVisibility,
      isLight: vesselIconIsLight(selectedBaseLayer),
      temporaryVesselsToHighLightOnMap: temporaryVesselsToHighLightOnMap
    }
    vessel.setVesselStyle(options)

    if (vessel.isSelectedVessel(selectedVesselFeatureAndIdentity)) {
      dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(vessel.feature, selectedVesselFeatureAndIdentity.identity)))
    }

    return vessel.feature
  }

  return null
}

export default VesselsLayer
