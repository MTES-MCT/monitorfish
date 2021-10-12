import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetAnimateTo } from '../../domain/shared_slices/Map'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import LayersEnum from '../../domain/entities/layers'

/**
 * Handle map animations - Note that the map  and mapClickEvent parameters are given from
 * the BaseMap component, event if it's not seen in the props passed to MapVesselAnimation
 */
const MapVesselClickAndAnimationHandler = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()
  const { animateTo } = useSelector(state => state.map)
  const {
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)
  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  useEffect(() => {
    animate()
  }, [animateTo, map, vesselSidebarIsOpen])

  useEffect(() => {
    if (mapClickEvent && mapClickEvent.feature && !previewFilteredVesselsMode) {
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
    if (feature?.getId()?.toString()?.includes(LayersEnum.VESSELS.code)) {
      dispatch(showVesselTrackAndSidebar(feature.vessel, false, false))
    }
  }

  return null
}

export default MapVesselClickAndAnimationHandler
