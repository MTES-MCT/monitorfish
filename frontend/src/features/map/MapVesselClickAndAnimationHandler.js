import { useEffect } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'

import LayersEnum from '../../domain/entities/layers'
import { resetAnimateToCoordinates, resetAnimateToExtent } from '../../domain/shared_slices/Map'
import { updateVesselTrackAsZoomed } from '../../domain/shared_slices/Vessel'
import getVesselVoyage from '../../domain/use_cases/vessel/getVesselVoyage'
import showVessel from '../../domain/use_cases/vessel/showVessel'
import showVesselTrack from '../../domain/use_cases/vessel/showVesselTrack'

/**
 * Handle map animations - Note that the map  and mapClickEvent parameters are given from
 * the BaseMap component, event if it's not seen in the props passed to MapVesselAnimation
 * @param {Object} map
 * @param {MapClickEvent} mapClickEvent
 */
function MapVesselClickAndAnimationHandler({ map, mapClickEvent }) {
  const dispatch = useDispatch()
  const { animateToCoordinates, animateToExtent } = useSelector(state => state.map)
  const { vessels, vesselSidebarIsOpen, vesselsTracksShowed, vesselTrackExtent } = useSelector(state => state.vessel)
  const { previewFilteredVesselsMode } = useSelector(state => state.global)

  useEffect(() => {
    function createAnimateObject(resolution, duration, zoom) {
      return {
        center: [animateToCoordinates[0] + resolution, animateToCoordinates[1]],
        duration,
        zoom,
      }
    }
    function animateViewToCoordinates() {
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
    function animateViewToExtent() {
      if (map && vesselSidebarIsOpen && animateToExtent && vesselTrackExtent?.length) {
        map.getView().fit(vesselTrackExtent, {
          callback: () => {
            dispatch(resetAnimateToExtent())
          },
          duration: 500,
          maxZoom: 10,
          padding: [100, 550, 100, 50],
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
      .filter(vesselId => {
        const track = vesselsTracksShowed[vesselId]

        return track.toZoom && track.extent && !track.toShow
      })
      .forEach(vesselIdentity => {
        const { extent } = vesselsTracksShowed[vesselIdentity]

        map.getView().fit(extent, {
          callback: () => {
            dispatch(updateVesselTrackAsZoomed(vesselIdentity))
          },
          duration: 500,
          maxZoom: 10,
          padding: [100, 550, 100, 50],
        })
      })
  }, [map, vesselsTracksShowed])

  useEffect(() => {
    const clickedFeatureId = mapClickEvent?.feature?.getId()
    if (!previewFilteredVesselsMode && clickedFeatureId?.toString()?.includes(LayersEnum.VESSELS.code)) {
      const clickedVessel = vessels.find(vessel => clickedFeatureId?.toString()?.includes(vessel.vesselId))

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
