import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetAnimateTo } from '../../domain/reducers/Map'
import { getVesselFeatureAndIdentity, getVesselIdentityFromFeature } from '../../domain/entities/vessel'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import LayersEnum from '../../domain/entities/layers'

const MapVesselAnimation = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()
  const { animateTo } = useSelector(state => state.map)
  const {
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)

  useEffect(() => {
    animate()
  }, [animateTo, map, vesselSidebarIsOpen])

  useEffect(() => {
    if (mapClickEvent && mapClickEvent.feature) {
      showVesselTrackAndSidebarOnMapClick(mapClickEvent.feature)
    }
  }, [mapClickEvent])

  function animate () {
    if (map &&
      animateTo &&
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

      dispatch(resetAnimateTo())
    }
  }

  function createAnimateObject (resolution, duration, zoom) {
    return {
      center: [
        animateTo[0] + resolution,
        animateTo[1]
      ],
      duration,
      zoom
    }
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
