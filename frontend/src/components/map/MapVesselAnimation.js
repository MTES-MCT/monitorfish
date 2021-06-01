import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { hideVesselLabels, resetAnimateToVessel } from '../../domain/reducers/Map'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../../domain/entities/vessel'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import LayersEnum from '../../domain/entities/layers'
import { MIN_ZOOM_VESSEL_LABELS } from '../../layers/VesselsLayer'

const MapVesselAnimation = ({ map, mapMovingAndZoomEvent, mapClickEvent }) => {
  const dispatch = useDispatch()
  const { animateToVessel } = useSelector(state => state.map)
  const {
    vesselSidebarIsOpen,
    selectedVesselFeatureAndIdentity
  } = useSelector(state => state.vessel)

  useEffect(() => {
    addAnimateToVessel()
  }, [animateToVessel, map, vesselSidebarIsOpen, selectedVesselFeatureAndIdentity])

  useEffect(() => {
    if (mapMovingAndZoomEvent) {
      hideVesselOnMapZoom()
    }
  }, [map, mapMovingAndZoomEvent])

  useEffect(() => {
    if (mapClickEvent && mapClickEvent.feature) {
      showVesselTrackAndSidebarOnMapClick(mapClickEvent.feature)
    }
  }, [mapClickEvent])

  function addAnimateToVessel () {
    if (map &&
      animateToVessel &&
      selectedVesselFeatureAndIdentity &&
      selectedVesselFeatureAndIdentity.feature &&
      vesselSidebarIsOpen) {
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

  function createAnimateObject (resolution, duration, zoom) {
    return {
      center: [
        selectedVesselFeatureAndIdentity.feature.getGeometry().getCoordinates()[0] + resolution,
        selectedVesselFeatureAndIdentity.feature.getGeometry().getCoordinates()[1]
      ],
      duration,
      zoom
    }
  }

  function hideVesselOnMapZoom () {
    dispatch(hideVesselLabels(map && map.getView().getZoom() <= MIN_ZOOM_VESSEL_LABELS))
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
