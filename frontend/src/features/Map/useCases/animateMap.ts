import { getCoordinatesInViewWorld, getExtentInViewWorld, getMapResolution, getMapZoom } from '@features/Map/utils'

import { monitorfishMap } from '../monitorfishMap'

import type { Extent } from 'ol/extent'

const SIDEBAR_OFFSET_FACTOR = 200

export function animateToVesselCoordinates(vesselCoordinates: [number, number], isVesselSidebarOpen: boolean) {
  // Stay on the world copy displayed by the map instead of flying back around the globe
  const coordinates = getCoordinatesInViewWorld(vesselCoordinates)

  if (getMapZoom() >= 8) {
    const sidebarOffset = isVesselSidebarOpen ? getMapResolution() * SIDEBAR_OFFSET_FACTOR : 0

    monitorfishMap.getView().animate({ center: [coordinates[0] + sidebarOffset, coordinates[1]], duration: 500 })

    return
  }

  // The offset must be computed from the resolution at the target zoom, not the current (larger) one —
  // otherwise, zooming in from a low zoom level ends up applying a wildly oversized offset once at zoom 8.
  const targetResolution = monitorfishMap.getView().getResolutionForZoom(8)
  const sidebarOffset = isVesselSidebarOpen ? targetResolution * SIDEBAR_OFFSET_FACTOR : 0

  monitorfishMap
    .getView()
    .animate({ center: [coordinates[0], coordinates[1]], duration: 250, zoom: 8 }, () =>
      monitorfishMap.getView().animate({ center: [coordinates[0] + sidebarOffset, coordinates[1]], duration: 250 })
    )
}

export function fitMapToVesselTrack(extent: Extent, callback?: () => void) {
  monitorfishMap
    .getView()
    .fit(getExtentInViewWorld(extent), { callback, duration: 500, maxZoom: 10, padding: [100, 550, 100, 50] })
}

export function fitMapToExtent(extent: Extent) {
  monitorfishMap.getView().fit(getExtentInViewWorld(extent), { duration: 200, maxZoom: 12, padding: [30, 30, 30, 30] })
}
