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
import { setVesselIconStyle } from './styles/featuresStyles'
import { toStringHDMS } from 'ol/coordinate'
import { updateVesselFeatureAndIdentity } from '../domain/reducers/Vessel'
import { getVesselFeatureAndIdentity } from '../domain/entities/vessel'

const VesselsLayer = ({ map }) => {
  const vessels = useSelector(state => state.vessel.vessels)
  const selectedVesselFeatureAndIdentity = useSelector(state => state.vessel.selectedVesselFeatureAndIdentity)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)
  const vesselNamesHiddenByZoom = useSelector(state => state.map.vesselNamesHiddenByZoom)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
  const selectedBaseLayer = useSelector(state => state.map.selectedBaseLayer)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
  const vesselLabel = useSelector(state => state.map.vesselLabel)

  const dispatch = useDispatch()

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    className: Layers.VESSELS.code,
    source: vectorSource,
    zIndex: Layers.VESSELS.zIndex
  }))

  useEffect(() => {
    if(map) {
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
        })

      Promise.all(vesselsFeaturesPromise).then(vesselsFeatures => {
        vectorSource.clear(true)
        vectorSource.addFeatures(vesselsFeatures)
        vectorSource.changed()
      })
    }
  }, [vessels, map])

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

    setVesselIconStyle(
      currentVessel,
      feature,
      options)
      .then(newSelectedVesselFeature => {
        if (newSelectedVesselFeature) {
          dispatch(updateVesselFeatureAndIdentity(getVesselFeatureAndIdentity(newSelectedVesselFeature, selectedVesselFeatureAndIdentity.identity)))
        }

        resolve(feature)
      })
  })

  return null

}

export default VesselsLayer