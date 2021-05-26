import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { MIN_ZOOM_VESSEL_NAMES } from '../../layers/VesselsLayer'
import { hideVesselNames, resetAnimateToVessel } from '../../domain/reducers/Map'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../../domain/entities/vessel'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import LayersEnum from '../../domain/entities/layers'

const MapVesselAnimation = ({ map, mapMovingAndZoomEvent, mapClickEvent }) => {
  const dispatch = useDispatch()
  const mapState = useSelector(state => state.map)
  const vessel = useSelector(state => state.vessel)

  const {
    animateToVessel
  } = mapState

  const {
    vesselSidebarIsOpen,
    selectedVesselFeatureAndIdentity
  } = vessel

  useEffect(() => {
    if (map) {
      addAnimateToVessel(map)
    }
  }, [animateToVessel, map, vesselSidebarIsOpen, selectedVesselFeatureAndIdentity])

  useEffect(() => {
    if (mapMovingAndZoomEvent) {
      hideVesselOnMapZoom()
    }
  }, [map, mapMovingAndZoomEvent])

  useEffect(() => {
    if (mapClickEvent) {
      showVesselTrackAndSidebarOnMapClick(mapClickEvent)
    }
  }, [vessel, mapClickEvent])

  function createAnimateObject (resolution, duration, zoom) {
    return {
      center: [
        animateToVessel.getGeometry().getCoordinates()[0] + resolution,
        animateToVessel.getGeometry().getCoordinates()[1]
      ],
      duration,
      zoom
    }
  }

  function addAnimateToVessel (map) {
    if (map && animateToVessel && selectedVesselFeatureAndIdentity && vesselSidebarIsOpen) {
      if (map.getView().getZoom() >= 8) {
        const resolution = map.getView().getResolution()
        map.getView().animate(createAnimateObject(resolution * 200, 1000, undefined))
      } else {
        map.getView().animate(createAnimateObject(0, 800, 8), () => {
          const resolution = map.getView().getResolution()
          map.getView().animate(createAnimateObject(resolution * 200, 500, undefined))
        })
      }
      dispatch(resetAnimateToVessel())
    }
  }

  function hideVesselOnMapZoom () {
    dispatch(hideVesselNames(map && map.getView().getZoom() <= MIN_ZOOM_VESSEL_NAMES))
  }

  function showVesselTrackAndSidebarOnMapClick (feature) {
    if (feature && feature.getId() && feature.getId().toString().includes(LayersEnum.VESSELS.code)) {
      const vessel = getVesselIdentityFromFeature(feature)
      dispatch(showVesselTrackAndSidebar(getVesselFeatureAndIdentity(feature, vessel), false, false))
    }
  }
  return null
}

export default MapVesselAnimation
