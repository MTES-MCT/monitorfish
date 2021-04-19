import Overlay from 'ol/Overlay'

export const vesselCardID = 'vessel-card';
export const vesselTrackCardID = 'vessel-track-card';
export const trackTypeCardID = 'track-line-card';

export function getOverlays () {
  const vesselCardOverlay = new Overlay({
    element: document.getElementById(vesselCardID),
    autoPan: true,
    autoPanAnimation: {
      duration: 400,
    },
    className: 'ol-overlay-container ol-selectable'
  })

  const vesselTrackCardOverlay = new Overlay({
    element: document.getElementById(vesselTrackCardID),
    autoPan: true,
    autoPanAnimation: {
      duration: 400,
    },
    className: 'ol-overlay-container ol-selectable'
  })

  const trackTypeCardOverlay = new Overlay({
    element: document.getElementById(trackTypeCardID),
    autoPan: true,
    autoPanAnimation: {
      duration: 400,
    },
    className: 'ol-overlay-container ol-selectable'
  })

  return { vesselCardOverlay, vesselTrackCardOverlay, trackTypeCardOverlay }
}
