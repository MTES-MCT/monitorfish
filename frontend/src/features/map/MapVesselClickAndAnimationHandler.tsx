import { useEffect } from 'react'

import { resetAnimateToCoordinates, resetAnimateToExtent, resetFitToExtent } from '../../domain/shared_slices/Map'
import { updateVesselTrackAsZoomed } from '../../domain/shared_slices/Vessel'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

/**
 * Handle map animations
 * @param {Object} map
 */
export function MapVesselClickAndAnimationHandler({ map }) {
  const dispatch = useMainAppDispatch()
  const { animateToCoordinates, animateToExtent, fitToExtent } = useMainAppSelector(state => state.map)
  const { vesselSidebarIsOpen, vesselsTracksShowed, vesselTrackExtent } = useMainAppSelector(state => state.vessel)
  useEffect(() => {
    function createAnimateObject(_animateToCoordinates, resolution, duration, zoom) {
      return {
        center: [_animateToCoordinates[0] + resolution, _animateToCoordinates[1]],
        duration,
        zoom
      }
    }
    function animateViewToCoordinates() {
      if (map && animateToCoordinates && animateToCoordinates[0] && animateToCoordinates[1] && vesselSidebarIsOpen) {
        if (map.getView().getZoom() >= 8) {
          const resolution = map.getView().getResolution()
          map.getView().animate(createAnimateObject(animateToCoordinates, resolution * 200, 1000, undefined))
        } else {
          map.getView().animate(createAnimateObject(animateToCoordinates, 0, 800, 8), () => {
            const resolution = map.getView().getResolution()
            map.getView().animate(createAnimateObject(animateToCoordinates, resolution * 200, 500, undefined))
          })
        }
        dispatch(resetAnimateToCoordinates())
      }
    }
    animateViewToCoordinates()
  }, [dispatch, animateToCoordinates, map, vesselSidebarIsOpen])

  useEffect(() => {
    function animateViewToExtent() {
      if (map && vesselSidebarIsOpen && animateToExtent && vesselTrackExtent?.length) {
        map.getView().fit(vesselTrackExtent, {
          callback: () => {
            dispatch(resetAnimateToExtent())
          },
          duration: 500,
          maxZoom: 10,
          padding: [100, 550, 100, 50]
        })
      }
    }

    animateViewToExtent()
  }, [dispatch, animateToExtent, vesselTrackExtent, map, vesselSidebarIsOpen])

  useEffect(() => {
    if (!map || !fitToExtent) {
      return
    }

    map.getView().fit(fitToExtent, {
      callback: () => {
        dispatch(resetFitToExtent())
      },
      duration: 1000,
      maxZoom: 12,
      padding: [30, 30, 30, 30]
    })
  }, [dispatch, fitToExtent, map])

  useEffect(() => {
    if (!map) {
      return
    }

    Object.keys(vesselsTracksShowed)
      .filter(vesselCompositeIdentifier => {
        const track = vesselsTracksShowed[vesselCompositeIdentifier]

        return track?.toZoom && track?.extent && !track?.toShow
      })
      .forEach(vesselCompositeIdentifier => {
        if (!vesselsTracksShowed[vesselCompositeIdentifier]) {
          return
        }

        const { extent } = vesselsTracksShowed[vesselCompositeIdentifier]!

        map.getView().fit(extent, {
          callback: () => {
            dispatch(updateVesselTrackAsZoomed(vesselCompositeIdentifier))
          },
          duration: 500,
          maxZoom: 10,
          padding: [100, 550, 100, 50]
        })
      })
  }, [dispatch, map, vesselsTracksShowed])

  return null
}
