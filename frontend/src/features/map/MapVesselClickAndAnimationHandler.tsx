import { useEffect } from 'react'

import { monitorfishMap } from './monitorfishMap'
import { getMapResolution, getMapZoom } from './utils'
import { resetAnimateToCoordinates, resetAnimateToExtent, resetFitToExtent } from '../../domain/shared_slices/Map'
import { updateVesselTrackAsZoomed } from '../../domain/shared_slices/Vessel'
import { useMainAppDispatch } from '../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

/**
 * Handle map animations
 */
export function MapVesselClickAndAnimationHandler() {
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
      if (animateToCoordinates && animateToCoordinates[0] && animateToCoordinates[1] && vesselSidebarIsOpen) {
        if (getMapZoom() >= 8) {
          const resolution = getMapResolution()
          monitorfishMap.getView().animate(createAnimateObject(animateToCoordinates, resolution * 200, 1000, undefined))
        } else {
          monitorfishMap.getView().animate(createAnimateObject(animateToCoordinates, 0, 800, 8), () => {
            const resolution = getMapResolution()
            monitorfishMap
              .getView()
              .animate(createAnimateObject(animateToCoordinates, resolution * 200, 500, undefined))
          })
        }
        dispatch(resetAnimateToCoordinates())
      }
    }
    animateViewToCoordinates()
  }, [dispatch, animateToCoordinates, vesselSidebarIsOpen])

  useEffect(() => {
    function animateViewToExtent() {
      if (vesselSidebarIsOpen && animateToExtent && vesselTrackExtent?.length) {
        monitorfishMap.getView().fit(vesselTrackExtent, {
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
  }, [dispatch, animateToExtent, vesselTrackExtent, vesselSidebarIsOpen])

  useEffect(() => {
    if (!fitToExtent) {
      return
    }

    monitorfishMap.getView().fit(fitToExtent, {
      callback: () => {
        dispatch(resetFitToExtent())
      },
      duration: 1000,
      maxZoom: 12,
      padding: [30, 30, 30, 30]
    })
  }, [dispatch, fitToExtent])

  useEffect(() => {
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

        monitorfishMap.getView().fit(extent, {
          callback: () => {
            dispatch(updateVesselTrackAsZoomed(vesselCompositeIdentifier))
          },
          duration: 500,
          maxZoom: 10,
          padding: [100, 550, 100, 50]
        })
      })
  }, [dispatch, vesselsTracksShowed])

  return null
}
