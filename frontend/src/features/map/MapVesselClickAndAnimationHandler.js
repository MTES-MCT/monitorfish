import { useEffect } from 'react'
import { useDispatch, useSelector, batch } from 'react-redux'
import { resetAnimateToCoordinates, resetAnimateToExtent } from '../../domain/shared_slices/Map'
import showVessel from '../../domain/use_cases/showVessel'
import LayersEnum from '../../domain/entities/layers'
import showVesselTrack from '../../domain/use_cases/showVesselTrack'
import getVesselVoyage from '../../domain/use_cases/getVesselVoyage'

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
    vesselsgeojson,
    vesselSidebarIsOpen,
    vesselTrackExtent
  } = useSelector(state => state.vessel)
  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  useEffect(() => {
    animateViewToCoordinates()
  }, [animateToCoordinates, map, vesselSidebarIsOpen])

  useEffect(() => {
    animateViewToExtent()
  }, [animateToExtent, vesselTrackExtent, map, vesselSidebarIsOpen])

  useEffect(() => {
    const clickedFeatureId = mapClickEvent?.feature?.getId()
    if (!previewFilteredVesselsMode && clickedFeatureId?.toString()?.includes(LayersEnum.VESSELS.code)) {
      const feature = vesselsgeojson.find((vessel) => {
        return clickedFeatureId?.toString()?.includes(vessel.vesselId)
      })
      if (feature) {
        if (mapClickEvent.ctrlKeyPressed) {
          dispatch(showVesselTrack(feature, false))
        } else {
          batch(() => {
            dispatch(showVessel(feature, false, false))
            dispatch(getVesselVoyage(feature, null, false))
          })
        }
      }
    }
  }, [mapClickEvent])

  function animateViewToExtent () {
    if (map && vesselSidebarIsOpen && animateToExtent && vesselTrackExtent?.length) {
      map.getView().fit(vesselTrackExtent, {
        duration: 500,
        padding: [100, 550, 100, 50],
        maxZoom: 10,
        callback: () => {
          dispatch(resetAnimateToExtent())
        }
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
