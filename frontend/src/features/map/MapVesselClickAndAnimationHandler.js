import { useEffect } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import { resetAnimateToCoordinates, resetAnimateToExtent } from '../../domain/shared_slices/Map'
import { showVessel } from '../../domain/use_cases/vessel/showVessel'
import { Layer } from '../../domain/entities/layers/constants'
import showVesselTrack from '../../domain/use_cases/vessel/showVesselTrack'
import { getVesselVoyage } from '../../domain/use_cases/vessel/getVesselVoyage'
import { updateVesselTrackAsZoomed } from '../../domain/shared_slices/Vessel'

/**
 * Handle map animations - Note that the map  and mapClickEvent parameters are given from
 * the BaseMap component, event if it's not seen in the props passed to MapVesselAnimation
 * @param {Object} map
 * @param {MapClickEvent} mapClickEvent
 * @param {boolean} hasClickEvent
 */
const MapVesselClickAndAnimationHandler = ({ map, mapClickEvent }) => {
  const dispatch = useDispatch()
  const {
    animateToCoordinates,
    animateToExtent
  } = useSelector(state => state.map)
  const {
    vessels,
    vesselSidebarIsOpen,
    vesselTrackExtent,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const {
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  useEffect(() => {
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
    animateViewToCoordinates()
  }, [animateToCoordinates, map, vesselSidebarIsOpen])

  useEffect(() => {
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

    animateViewToExtent()
  }, [animateToExtent, vesselTrackExtent, map, vesselSidebarIsOpen])

  useEffect(() => {
    if (!map) {
      return
    }

    Object.keys(vesselsTracksShowed)
      .filter(vesselCompositeIdentifier => {
        const track = vesselsTracksShowed[vesselCompositeIdentifier]

        return track.toZoom && track.extent && !track.toShow
      }).forEach(vesselCompositeIdentifier => {
        const extent = vesselsTracksShowed[vesselCompositeIdentifier].extent

        map.getView().fit(extent, {
          duration: 500,
          padding: [100, 550, 100, 50],
          maxZoom: 10,
          callback: () => {
            dispatch(updateVesselTrackAsZoomed(vesselCompositeIdentifier))
          }
        })
      })
  }, [map, vesselsTracksShowed])

  useEffect(() => {
    const clickedFeatureId = mapClickEvent?.feature?.getId()
    if (!previewFilteredVesselsMode && clickedFeatureId?.toString()?.includes(Layer.VESSELS.code)) {
      const clickedVessel = vessels.find(vessel => {
        return clickedFeatureId?.toString()?.includes(vessel.vesselFeatureId)
      })

      if (clickedVessel) {
        if (mapClickEvent.ctrlKeyPressed) {
          dispatch(showVesselTrack(clickedVessel.vesselProperties, false))
        } else {
          batch(() => {
            dispatch(showVessel(clickedVessel.vesselProperties, false, false))
            dispatch(getVesselVoyage(clickedVessel.vesselProperties, null, false))
          })
        }
      }
    }
  }, [mapClickEvent])

  return null
}

export default MapVesselClickAndAnimationHandler
