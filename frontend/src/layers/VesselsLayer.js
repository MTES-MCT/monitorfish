import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import LayersEnum, { vesselIconIsLight } from '../domain/entities/layers'
import { transform } from 'ol/proj'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {
  getSVG,
  getVesselIconOpacity,
  getVesselImage,
  getVesselNameStyle,
  selectedVesselStyle,
  setVesselIconStyle,
  VESSEL_ICON_STYLE,
  VESSEL_NAME_STYLE,
  VESSEL_SELECTOR_STYLE
} from './styles/featuresStyles'
import { toStringHDMS } from 'ol/coordinate'
import {
  setVesselsLayerSource,
  updateVesselFeatureAndIdentity
} from '../domain/reducers/Vessel'
import {
  getVesselFeatureAndIdentity,
  getVesselIdentityFromFeature,
  vesselAndVesselFeatureAreEquals
} from '../domain/entities/vessel'

export const VESSELS_UPDATE_EVENT = 'UPDATE'
export const MIN_ZOOM_VESSEL_NAMES = 9

const VesselsLayer = ({ map, mapRef }) => {
  const vessels = useSelector(state => state.vessel.vessels)
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const removeSelectedIconToFeature = useSelector(state => state.vessel.removeSelectedIconToFeature)
  const selectedVesselFeatureAndIdentity = useSelector(state => state.vessel.selectedVesselFeatureAndIdentity)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const vesselNamesHiddenByZoom = useSelector(state => state.map.vesselNamesHiddenByZoom)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
  const isMoving = useSelector(state => state.map.isMoving)
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
  const vesselLabel = useSelector(state => state.map.vesselLabel)

  const [selectedVesselLastPosition, setSelectedVesselLastPosition] = useState(null)

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
    modifyVesselIconWhenBaseLayerChange()
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
  }, [vesselLabelsShowedOnMap, map, vesselNamesHiddenByZoom, isMoving, vesselLabel])

  function addLayerToMap () {
    if (map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }

  function addVesselsFeaturesToMap () {
    if (map && vessels && vessels.length) {
      let vesselsFeaturesPromise = getVesselsFeaturesPromise()

      Promise.all(vesselsFeaturesPromise).then(vesselsFeatures => {
        vectorSource.clear(true)
        vectorSource.addFeatures(vesselsFeatures)
        vectorSource.dispatchEvent({
          type: VESSELS_UPDATE_EVENT,
          features: vesselsFeatures
        })
      })
    }
  }

  function getVesselsFeaturesPromise () {
    return vessels
      .filter(vessel => vessel)
      .map((currentVessel, index) => {
        return buildFeature(currentVessel, index)
          .then(feature => feature)
      }).filter(vessel => vessel)
  }

  function modifyVesselIconWhenBaseLayerChange () {
    const isLight = vesselIconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      let foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      if (foundStyle) {
        let vesselImage = getVesselImage({
          speed: feature.getProperties().speed,
          course: feature.getProperties().course
        }, isLight)
        foundStyle.setImage(vesselImage)
        let opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        foundStyle.getImage().setOpacity(opacity)
      }
    })

    vectorSource.changed()
  }

  function highLightVesselsOnMap () {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      vectorSource.getFeatures().filter(feature => {
        return !temporaryVesselsToHighLightOnMap.some(vessel => {
          return vesselAndVesselFeatureAreEquals(vessel, feature)
        })
      }).map(featureToHide => {
        let foundStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if (foundStyle) {
          foundStyle.getImage().setOpacity(0)
        }
      })

      vectorSource.changed()
    }
  }

  function showBackVesselsIconsWhenClosingVesselsHighLight () {
    if (vesselsLastPositionVisibility && (!temporaryVesselsToHighLightOnMap || !temporaryVesselsToHighLightOnMap.length) && map) {
      vectorSource.getFeatures().forEach(feature => {
        let opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        let foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if (foundStyle) {
          foundStyle.getImage().setOpacity(opacity)
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
      let style = selectedVesselFeatureAndIdentity.feature.getStyle()
      let vesselAlreadyWithSelectorStyle = selectedVesselFeatureAndIdentity.feature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
      if (!vesselAlreadyWithSelectorStyle) {
        selectedVesselFeatureAndIdentity.feature.setStyle([...style, selectedVesselStyle])
        let vesselIdentity = getVesselIdentityFromFeature(selectedVesselFeatureAndIdentity.feature)
        dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(selectedVesselFeatureAndIdentity.feature, vesselIdentity)))
      }
    }
  }

  function addOrRemoveVesselLabelWhenZooming () {
    if (map) {
      let extent = mapRef.current.getView().calculateExtent(map.getSize())

      if (vesselNamesHiddenByZoom === undefined) {
        return
      }

      if (vesselLabelsShowedOnMap && !vesselNamesHiddenByZoom && isVesselNameMinimumZoom()) {
        removeVesselLabelToAllFeatures()
        addVesselLabelToAllFeatures(extent, vesselLabel)
      } else if (vesselLabelsShowedOnMap && vesselNamesHiddenByZoom && isVesselNameMaximumZoom()) {
        removeVesselLabelToAllFeatures()
      } else if (!vesselLabelsShowedOnMap) {
        removeVesselLabelToAllFeatures()
      }
    }
  }

  function isVesselNameMinimumZoom() {
    return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES;
  }

  function isVesselNameMaximumZoom() {
    return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES;
  }

  function addVesselLabelToAllFeatures(extent, vesselLabel) {
    vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
      const vesselDate = new Date(feature.getProperties().dateTime)
      const vesselIsHidden = new Date()
      vesselIsHidden.setHours(vesselIsHidden.getHours() - vesselsLastPositionVisibility.hidden)

      if(vesselDate > vesselIsHidden) {
        getSVG(feature, vesselLabel).then(svg => {
          if(svg) {
            let style = getVesselNameStyle(svg.showedText, svg.imageElement)
            feature.setStyle([...feature.getStyle(), style])
          }
        })
      }
    })
  }

  function removeVesselLabelToAllFeatures() {
    vectorSource.getFeatures().map(feature => {
      let stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_NAME_STYLE)
      feature.setStyle([...stylesWithoutVesselName]);
    })
  }

  function moveFeatureToNewPosition (featureToModify) {
    const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]
    const newCoordinates = new transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    setSelectedVesselLastPosition({
      internalReferenceNumber: featureToModify.getProperties().internalReferenceNumber,
      externalReferenceNumber: featureToModify.getProperties().externalReferenceNumber,
      ircs: featureToModify.getProperties().ircs,
      geometry: featureToModify.getGeometry()
    })
    featureToModify.getStyle().push(selectedVesselStyle)
    featureToModify.setGeometry(new Point(newCoordinates))
  }

  const buildFeature = (currentVessel, index) => new Promise(resolve =>  {
    let transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    if (currentVessel &&
      selectedVesselFeatureAndIdentity &&
      selectedVesselFeatureAndIdentity.feature &&
      vesselAndVesselFeatureAreEquals(currentVessel, selectedVesselFeatureAndIdentity.feature)) {
      const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]
      if(lastPosition && lastPosition.longitude && lastPosition.latitude) {
        transformedCoordinates = new transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)
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
      totalWeightOnboard: currentVessel.totalWeightOnboard,
    });

    feature.setId(`${LayersEnum.VESSELS.code}:${index}`)

    let vesselLabelsIsShowedOnMap = vesselNamesHiddenByZoom === undefined
      ? false
      : vesselLabelsShowedOnMap && !vesselNamesHiddenByZoom;
    let isLight = vesselIconIsLight(selectedBaseLayer)

    const options = {
      selectedVesselFeatureAndIdentity: selectedVesselFeatureAndIdentity,
      vesselLabelsShowedOnMap: vesselLabelsIsShowedOnMap,
      vesselsLastPositionVisibility: vesselsLastPositionVisibility,
      vesselLabel: vesselLabel,
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
