import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers, { vesselIconIsLight } from '../domain/entities/layers'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {
  getSVG,
  getVesselIconOpacity,
  getVesselImage,
  getVesselLabelStyle,
  selectedVesselStyle,
  setVesselIconStyle,
  VESSEL_ICON_STYLE,
  VESSEL_LABEL_STYLE,
  VESSEL_SELECTOR_STYLE
} from './styles/featuresStyles'
import { toStringHDMS } from 'ol/coordinate'
import { setVesselsLayerSource, updateVesselFeatureAndIdentity } from '../domain/reducers/Vessel'
import {
  getVesselFeatureAndIdentity,
  getVesselIdentityFromFeature,
  vesselAndVesselFeatureAreEquals,
  vesselsAreEquals
} from '../domain/entities/vessel'
import { getVesselObjectFromFeature } from '../components/vessel_list/dataFormatting'
import getFilteredVessels from '../domain/use_cases/getFilteredVessels'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_LABELS = 7.5
const NOT_FOUND_INDEX = -1

const VesselsLayer = ({ map }) => {
  const vessels = useSelector(state => state.vessel.vessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const removeSelectedIconToFeature = useSelector(state => state.vessel.removeSelectedIconToFeature)
  const selectedVesselFeatureAndIdentity = useSelector(state => state.vessel.selectedVesselFeatureAndIdentity)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const vesselLabelsHiddenByZoom = useSelector(state => state.map.vesselLabelsHiddenByZoom)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
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
    rewriteVesselsIcons()
  }, [selectedBaseLayer])

  useEffect(() => {
    highLightVesselsOnMap()
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    showBackVesselsIconsWhenClosingVesselsHighLight()
  }, [vesselsLastPositionVisibility, temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    moveSelectedFeatureToVesselLastPosition()
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
    applyFilterToVessels(vectorSource.getFeatures(), rewriteVesselsIcons).then(_ => {
      vectorSource.changed()
    })
  }, [filters, nonFilteredVesselsAreHidden])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels && vessels.length) {
      const vesselsFeaturesPromise = getVesselsFeaturesPromise()

      Promise.all(vesselsFeaturesPromise).then(vesselsFeatures => {
        applyFilterToVessels(vesselsFeatures, () => {}).then(features => {
          vectorSource.clear(true)
          vectorSource.addFeatures(features)
          vectorSource.dispatchEvent({
            type: VESSELS_UPDATE_EVENT,
            features: features
          })

          addVesselLabelToAllFeaturesInExtent(extent)
        })
      })
    }
  }

  const applyFilterToVessels = (vesselsFeatures, noFilterFunction) => new Promise(resolve => {
    if(!filters || !filters.length) {
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
    dispatch(getFilteredVessels(vesselsObjects, showedFilter.filters))
      .then(filteredVessels => {
        const uids = filteredVessels.map(vessel => vessel.uid)
        setFilteredVesselsFeaturesUids(uids)

        vesselsFeatures.forEach(feature => {
          const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)

          if (vesselIconStyle) {
            const featureIndex = uids.indexOf(feature.ol_uid)

            if (featureIndex !== NOT_FOUND_INDEX) {
              modifyVesselIcon(feature, color, false, vesselIconStyle)
            } else if (nonFilteredVesselsAreHidden) {
              const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
              if (vesselLabelStyle) {
                vesselLabelStyle.getImage().setOpacity(0)
              }

              vesselIconStyle.getImage().setOpacity(0)
            } else {
              modifyVesselIcon(feature, null, false, vesselIconStyle)
            }
          }
        })

        return resolve(vesselsFeatures)
      })
  })

  function modifyVesselIcon (feature, color, isLight, vesselIconStyle) {
    const vesselImage = getVesselImage({
      speed: feature.getProperties().speed,
      course: feature.getProperties().course
    }, isLight, color)

    vesselIconStyle.setImage(vesselImage)
    const opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
    vesselIconStyle.getImage().setOpacity(opacity)
  }

  function getVesselsFeaturesPromise () {
    return vessels
      .filter(vessel => vessel)
      .map((currentVessel, index) => {
        return buildFeature(currentVessel, index)
          .then(feature => feature)
      }).filter(vessel => vessel)
  }

  function rewriteVesselsIcons () {
    const isLight = vesselIconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      const foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      if (foundStyle) {
        modifyVesselIcon(feature, null, isLight, foundStyle)
      }
    })

    vectorSource.changed()
  }

  function highLightVesselsOnMap () {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      vectorSource.getFeatures().filter(feature => {
        const vesselToCompare = {
          internalReferenceNumber: feature.getProperties().internalReferenceNumber,
          externalReferenceNumber: feature.getProperties().externalReferenceNumber,
          ircs: feature.getProperties().ircs
        }

        return !temporaryVesselsToHighLightOnMap.some(vessel => {
          return vesselsAreEquals(vessel, vesselToCompare)
        })
      }).forEach(featureToHide => {
        const vesselIconStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if (vesselIconStyle) {
          vesselIconStyle.getImage().setOpacity(0)
        }
        const vesselLabelStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
        if (vesselLabelStyle) {
          vesselLabelStyle.getImage().setOpacity(0)
        }
      })

      vectorSource.changed()
    }
  }

  function showBackVesselsIconsWhenClosingVesselsHighLight () {
    if (vesselsLastPositionVisibility && (!temporaryVesselsToHighLightOnMap || !temporaryVesselsToHighLightOnMap.length) && map) {
      vectorSource.getFeatures().forEach(feature => {
        const opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        const vesselIconStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if (vesselIconStyle) {
          vesselIconStyle.getImage().setOpacity(opacity)
        }
        const vesselLabelStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_LABEL_STYLE)
        if (vesselLabelStyle) {
          vesselLabelStyle.getImage().setOpacity(1)
        }
      })
      vectorSource.changed()
    }
  }

  function moveSelectedFeatureToVesselLastPosition () {
    if (selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const featureToModify = vectorSource.getFeatures().find(feature => {
        return vesselAndVesselFeatureAreEquals(selectedVessel, feature)
      })

      if (featureToModify) {
        moveFeatureToNewPosition(featureToModify)
      }
    }
  }

  function movePreviouslySelectedVesselFeatureToLastKnownPositionWhenDeselected () {
    if (!selectedVessel && selectedVesselLastPosition) {
      const featureToModify = vectorSource.getFeatures().find(feature => {
        return vesselAndVesselFeatureAreEquals(selectedVesselLastPosition, feature)
      })

      featureToModify.setGeometry(selectedVesselLastPosition.geometry)
      setSelectedVesselLastPosition(null)
    }
  }

  function addSelectorIconToSelectedVessel () {
    if (selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.feature && !removeSelectedIconToFeature) {
      const style = selectedVesselFeatureAndIdentity.feature.getStyle()
      const vesselAlreadyWithSelectorStyle = selectedVesselFeatureAndIdentity.feature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
      if (!vesselAlreadyWithSelectorStyle) {
        selectedVesselFeatureAndIdentity.feature.setStyle([...style, selectedVesselStyle])
        const vesselIdentity = getVesselIdentityFromFeature(selectedVesselFeatureAndIdentity.feature)
        dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(selectedVesselFeatureAndIdentity.feature, vesselIdentity)))
      }
    }
  }

  function addOrRemoveVesselLabelWhenZooming () {
    if (map) {
      const extent = map.getView().calculateExtent(map.getSize())

      if (vesselLabelsHiddenByZoom === undefined) {
        return
      }

      if (vesselLabelsShowedOnMap && !vesselLabelsHiddenByZoom && isVesselLabelMinimumZoom()) {
        addVesselLabelToAllFeaturesInExtent(null)
      } else if (vesselLabelsShowedOnMap && vesselLabelsHiddenByZoom && isVesselLabelMaximumZoom()) {
        removeVesselLabelToAllFeatures()
      } else if (!vesselLabelsShowedOnMap) {
        removeVesselLabelToAllFeatures()
      }
    }
  }

  function isVesselLabelMinimumZoom () {
    return map && map.getView().getZoom() > MIN_ZOOM_VESSEL_LABELS
  }

  function isVesselLabelMaximumZoom () {
    return map && map.getView().getZoom() <= MIN_ZOOM_VESSEL_LABELS
  }

  function addVesselLabelToAllFeaturesInExtent (extent) {
    const vesselLabelsIsShowedOnMap = vesselLabelsHiddenByZoom === undefined
      ? false
      : vesselLabelsShowedOnMap && !vesselLabelsHiddenByZoom

    if (vesselLabelsIsShowedOnMap) {
      extent = extent || mapRef.current.getView().calculateExtent()

      const filterShowed = filters.find(filter => filter.showed)

      if (filterShowed && nonFilteredVesselsAreHidden) {
        vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
          const featureIndex = filteredVesselsFeaturesUids.indexOf(feature.ol_uid)

          if (featureIndex !== NOT_FOUND_INDEX) {
            addVesselLabelToVesselFeature(feature, vesselLabel)
          }
        })
      } else {
        vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
          addVesselLabelToVesselFeature(feature, vesselLabel)
        })
      }
    }
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
    featureToModify.getStyle().push(selectedVesselStyle)
    featureToModify.setGeometry(new Point(newCoordinates))
  }

  const buildFeature = (currentVessel, index) => new Promise(resolve => {
    let transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    if (currentVessel &&
      selectedVesselFeatureAndIdentity &&
      selectedVesselFeatureAndIdentity.feature &&
      vesselAndVesselFeatureAreEquals(currentVessel, selectedVesselFeatureAndIdentity.feature)) {
      const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]
      if (lastPosition && lastPosition.longitude && lastPosition.latitude) {
        transformedCoordinates = transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
      }
    }

    const feature = new Feature({
      geometry: new Point(transformedCoordinates),
      internalReferenceNumber: currentVessel.internalReferenceNumber,
      externalReferenceNumber: currentVessel.externalReferenceNumber,
      mmsi: currentVessel.mmsi,
      flagState: currentVessel.flagState,
      vesselName: currentVessel.vesselName,
      coordinates: toStringHDMS(transformedCoordinates),
      course: currentVessel.course,
      positionType: currentVessel.positionType,
      speed: currentVessel.speed,
      ircs: currentVessel.ircs,
      dateTime: currentVessel.dateTime,
      emissionPeriod: currentVessel.emissionPeriod,
      lastErsDateTime: currentVessel.lastErsDateTime,
      departureDateTime: currentVessel.departureDateTime,
      width: currentVessel.width,
      length: currentVessel.length,
      registryPortLocode: currentVessel.registryPortLocode,
      registryPortName: currentVessel.registryPortName,
      district: currentVessel.district,
      districtCode: currentVessel.districtCode,
      gearOnboard: currentVessel.gearOnboard,
      segments: currentVessel.segments,
      speciesOnboard: currentVessel.speciesOnboard,
      totalWeightOnboard: currentVessel.totalWeightOnboard
    })

    feature.setId(`${Layers.VESSELS.code}:${index}`)

    const isLight = vesselIconIsLight(selectedBaseLayer)

    const options = {
      selectedVesselFeatureAndIdentity: selectedVesselFeatureAndIdentity,
      vesselsLastPositionVisibility: vesselsLastPositionVisibility,
      isLight: isLight,
      temporaryVesselsToHighLightOnMap: temporaryVesselsToHighLightOnMap,
    }

    setVesselIconStyle(currentVessel, feature, options).then(newSelectedVesselFeature => {
      if (newSelectedVesselFeature) {
        dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(newSelectedVesselFeature, selectedVesselFeatureAndIdentity.identity)))
      }

      resolve(feature)
    })
  })

  return null
}

export default VesselsLayer
