import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetAnimateToCoordinates } from '../../domain/shared_slices/Map'
import showVesselTrackAndSidebar from '../../domain/use_cases/showVesselTrackAndSidebar'
import LayersEnum from '../../domain/entities/layers'
import showVesselTrack from '../../domain/use_cases/showVesselTrack'

/**
 * Handle map animations - Note that the map  and mapClickEvent parameters are given from
 * the BaseMap component, event if it's not seen in the props passed to MapVesselAnimation
 * @param {Object} map
 * @param {MapClickEvent} mapClickEvent
 */
const MapVesselClickAndAnimationHandler = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()
  const {
    animateToCoordinates,
    animateToExtent
  } = useSelector(state => state.map)
  const {
    vesselSidebarIsOpen
  } = useSelector(state => state.vessel)
  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  useEffect(() => {
    animateViewToCoordinates()
  }, [animateToCoordinates, map, vesselSidebarIsOpen])

  useEffect(() => {
    animateViewToExtent()
  }, [animateToExtent, map, vesselSidebarIsOpen])

  useEffect(() => {
    if (!previewFilteredVesselsMode && mapClickEvent?.feature?.getId()?.toString()?.includes(LayersEnum.VESSELS.code)) {
      if (mapClickEvent.ctrlKeyPressed) {
        dispatch(showVesselTrack(mapClickEvent.feature.vessel, false))
      } else {
        dispatch(showVesselTrackAndSidebar(mapClickEvent.feature.vessel, false, false))
      }
    }
  }, [mapClickEvent])

  function animateViewToExtent () {
    if (map && vesselSidebarIsOpen && animateToExtent) {
      map.getView().fit(animateToExtent, {
        duration: 500,
        padding: [100, 550, 100, 50],
        maxZoom: 10
      })
    }
  }

  function animateViewToCoordinates () {
    if (map && animateToCoordinates && vesselSidebarIsOpen) {
      if (map.getView().getZoom() >= 8) {
        const resolution = map.getView().getResolution()
        map.getView().animate(createAnimateObject(resolution * 200, 1000, undefined))
      } else {
        map.getView().animate(createAnimateObject(0, 800, 8), () => {
          const resolution = map.getView().getResolution()
          map.getView().animate(createAnimateObject(resolution * 200, 500, undefined))
        })
      }

      dispatch(resetAnimateToCoordinates())
    }
  }

  function createAnimateObject (resolution, duration, zoom) {
    return {
      center: [
        animateToCoordinates[0] + resolution,
        animateToCoordinates[1]
      ],
      duration,
      zoom
    }
  }

  return null
}

export default MapVesselClickAndAnimationHandler
