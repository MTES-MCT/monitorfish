import type { OverlayCardMargins } from '@features/Map/components/Overlay/types'

export const AIS_VESSEL_OVERLAY_CARD_MARGIN: OverlayCardMargins = {
  xLeft: 20,
  xMiddle: -185,
  xRight: -407,
  yBottom: -230,
  yMiddle: -115,
  yTop: 20
}

/** Approximate rendered height of the AIS vessel card (px). Must match |yBottom| of the margins above. */
export const AIS_CARD_HEIGHT = 220
export const AIS_CARD_WIDTH = 387
