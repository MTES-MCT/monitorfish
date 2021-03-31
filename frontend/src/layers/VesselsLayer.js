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
  getVesselImage, getVesselNameStyle, selectedVesselStyle,
  setVesselIconStyle,
  VESSEL_ICON_STYLE, VESSEL_NAME_STYLE,
  VESSEL_SELECTOR_STYLE
} from './styles/featuresStyles'
import { toStringHDMS } from 'ol/coordinate'
import { setVesselsLayerSource, updateVesselFeatureAndIdentity } from '../domain/reducers/Vessel'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../domain/entities/vessel'

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
    if(map) {
      dispatch(setVesselsLayerSource(vectorSource))
      map.getLayers().push(layer)
    }
  }, [map])

  useEffect(() => {
    if(map && vessels && vessels.length) {
      let vesselsFeaturesPromise = vessels
        .filter(vessel => vessel)
        .map((currentVessel, index) => {
          return buildFeature(currentVessel, index)
            .then(feature => feature)
        }).filter(vessel => vessel)

      Promise.all(vesselsFeaturesPromise).then(vesselsFeatures => {
        vectorSource.clear(true)
        vectorSource.addFeatures(vesselsFeatures)
        vectorSource.dispatchEvent({
          type: VESSELS_UPDATE_EVENT,
          features: vesselsFeatures
        })
      })
    }
  }, [vessels, map])

  useEffect(() => {
    const isLight = vesselIconIsLight(selectedBaseLayer)

    vectorSource.getFeatures().forEach(feature => {
      let foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      if(foundStyle) {
        let vesselImage = getVesselImage({
          speed: feature.getProperties().speed,
          course: feature.getProperties().course
        }, isLight);
        foundStyle.setImage(vesselImage)
        let opacity = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        foundStyle.getImage().setOpacity(opacity)
      }
    })

    vectorSource.changed()
  }, [selectedBaseLayer])

  useEffect(() => {
    if(temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length && map) {
      vectorSource.getFeatures().filter(feature => {
        return !temporaryVesselsToHighLightOnMap.some(vessel => {
          return feature.getProperties().externalReferenceNumber === vessel.externalReferenceNumber ||
            feature.getProperties().internalReferenceNumber === vessel.internalReferenceNumber ||
            feature.getProperties().ircs === vessel.ircs
        })
      }).map(featureToHide => {
        let foundStyle = featureToHide.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if(foundStyle) {
          foundStyle.getImage().setOpacity(0)
        }
      })

      vectorSource.changed()
    }
  }, [temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    if(vesselsLastPositionVisibility && (!temporaryVesselsToHighLightOnMap || !temporaryVesselsToHighLightOnMap.length) && map) {
      vectorSource.getFeatures().forEach(feature => {
        let opacity  = getVesselIconOpacity(vesselsLastPositionVisibility, feature.getProperties().dateTime)
        let foundStyle = feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
        if(foundStyle) {
          foundStyle.getImage().setOpacity(opacity)
        }
      })
      vectorSource.changed()
    }
  }, [vesselsLastPositionVisibility, temporaryVesselsToHighLightOnMap])

  useEffect(() => {
    if(selectedVessel && selectedVessel.positions && selectedVessel.positions.length) {
      const featureToModify = vectorSource.getFeatures().find(feature => {
        const properties = feature.getProperties()
        return properties.externalReferenceNumber === selectedVessel.externalReferenceNumber ||
          properties.internalReferenceNumber === selectedVessel.internalReferenceNumber ||
          properties.ircs === selectedVessel.ircs
      })


      if(featureToModify) {
        moveFeatureToNewPosition(featureToModify)
      }
    }
  }, [selectedVessel])

  useEffect(() => {
    if(selectedVesselFeatureAndIdentity && selectedVesselFeatureAndIdentity.feature && !removeSelectedIconToFeature) {
      let style = selectedVesselFeatureAndIdentity.feature.getStyle()
      let vesselAlreadyWithSelectorStyle = selectedVesselFeatureAndIdentity.feature.getStyle().find(style => style.zIndex_ === VESSEL_SELECTOR_STYLE)
      if (!vesselAlreadyWithSelectorStyle) {
        selectedVesselFeatureAndIdentity.feature.setStyle([...style, selectedVesselStyle]);
        let vesselIdentity = getVesselIdentityFromFeature(selectedVesselFeatureAndIdentity.feature)
        dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(selectedVesselFeatureAndIdentity.feature, vesselIdentity)))
      }
    }
  }, [selectedVesselFeatureAndIdentity])

  useEffect(() => {
    if (map) {
      let extent = mapRef.current.getView().calculateExtent(map.getSize());

      if(vesselNamesHiddenByZoom === undefined) {
        return
      }

      if (vesselLabelsShowedOnMap && !vesselNamesHiddenByZoom && isVesselNameMinimumZoom()) {
        removeVesselNameToAllFeatures();
        addVesselLabelToAllFeatures(extent, vesselLabel);
      } else if (vesselLabelsShowedOnMap && vesselNamesHiddenByZoom && isVesselNameMaximumZoom()) {
        removeVesselNameToAllFeatures();
      } else if (!vesselLabelsShowedOnMap) {
        removeVesselNameToAllFeatures();
      }
    }
  }, [vesselLabelsShowedOnMap, map, vesselNamesHiddenByZoom, isMoving, vesselLabel])

  function isVesselNameMinimumZoom() {
    return mapRef.current && mapRef.current.getView().getZoom() > MIN_ZOOM_VESSEL_NAMES;
  }

  function isVesselNameMaximumZoom() {
    return mapRef.current && mapRef.current.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES;
  }

  function addVesselLabelToAllFeatures(extent, vesselLabel) {
    vectorSource.forEachFeatureIntersectingExtent(extent, feature => {
      getSVG(feature, vesselLabel).then(svg => {
        if(svg) {
          let style = getVesselNameStyle(svg.showedText, svg.imageElement)
          feature.setStyle([...feature.getStyle(), style])
        }
      })
    })
  }

  function removeVesselNameToAllFeatures() {
    vectorSource.getFeatures().map(feature => {
      let stylesWithoutVesselName = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_NAME_STYLE)
      feature.setStyle([...stylesWithoutVesselName]);
    })
  }

  function moveFeatureToNewPosition (featureToModify) {
    const lastPosition = selectedVessel.positions[selectedVessel.positions.length - 1]
    const newCoordinates = new transform([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

    featureToModify.setGeometry(new Point(newCoordinates))
  }

  const buildFeature = (currentVessel, index) => new Promise(resolve =>  {
    const transformedCoordinates = transform([currentVessel.longitude, currentVessel.latitude], WSG84_PROJECTION, OPENLAYERS_PROJECTION)

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
      dateTime: currentVessel.dateTime
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
